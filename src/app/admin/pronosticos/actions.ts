'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

/* ── Load data for admin panel ── */
export async function getAdminPronosticosData() {
  const db = createServiceRoleClient()

  const [teamsRes, groupResultsRes, specialResultsRes, playersRes] = await Promise.all([
    db.from('teams').select('id, name_es, flag_emoji, code, group_name').order('group_name').order('name_es'),
    db.from('group_results').select('group_name, position, team_id'),
    db.from('special_results').select('type, player_id, team_id, locked'),
    db.from('players').select('id, name, team_id, position').order('name').limit(2000),
  ])

  return {
    teams:          teamsRes.data          ?? [],
    groupResults:   groupResultsRes.data   ?? [],
    specialResults: specialResultsRes.data ?? [],
    players:        playersRes.data        ?? [],
  }
}

/* ── Set group result (1st/2nd/3rd per group) ── */
export async function saveGroupResultAction(
  groupName: string,
  position: number,
  teamId: string | null,
) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const db = createServiceRoleClient()

  if (!teamId) {
    await db.from('group_results')
      .delete()
      .eq('group_name', groupName)
      .eq('position', position)
    revalidatePath('/admin/pronosticos')
    return { success: true }
  }

  const { error } = await db.from('group_results').upsert(
    { group_name: groupName, position, team_id: teamId },
    { onConflict: 'group_name,position' },
  )

  if (error) return { error: error.message }
  revalidatePath('/admin/pronosticos')
  return { success: true }
}

/* ── Set special award result ── */
export async function saveSpecialResultAction(
  type: string,
  playerId: string | null,
  teamId: string | null,
  locked: boolean,
) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const db = createServiceRoleClient()

  const { error } = await db.from('special_results').upsert(
    { type, player_id: playerId, team_id: teamId, locked },
    { onConflict: 'type' },
  )

  if (error) return { error: error.message }
  revalidatePath('/admin/pronosticos')
  revalidatePath('/dashboard/pronosticos')
  return { success: true }
}

/* ── Score group predictions ── */
export async function scoreGroupPredictionsAction(groupName: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const db = createServiceRoleClient()

  // Get official results
  const { data: results } = await db.from('group_results')
    .select('position, team_id')
    .eq('group_name', groupName)

  if (!results || results.length === 0)
    return { error: 'No hay resultados oficiales para este grupo' }

  const resultMap: Record<number, string> = {}
  for (const r of results) resultMap[r.position] = r.team_id

  // Get all user predictions for this group
  const { data: allPreds } = await db.from('group_predictions')
    .select('user_id, position, team_id')
    .eq('group_name', groupName)

  if (!allPreds) return { error: 'Error al leer predicciones' }

  // Scoring config (hardcoded defaults; can be customized later)
  const pts = {
    exactPos: 3,   // exact position in group
    qualified: 1,  // team qualified but wrong position
  }

  // Group predictions by user
  const byUser: Record<string, { position: number; team_id: string }[]> = {}
  for (const p of allPreds) {
    if (!byUser[p.user_id]) byUser[p.user_id] = []
    byUser[p.user_id].push({ position: p.position, team_id: p.team_id })
  }

  // Compute points per user per position
  // For Mundial 2026 group phase: top 2 advance per group
  const qualifiedSet = new Set([resultMap[1], resultMap[2]].filter(Boolean))

  let updated = 0
  for (const [userId, preds] of Object.entries(byUser)) {
    for (const pred of preds) {
      let points = 0
      const official = resultMap[pred.position]
      if (official && official === pred.team_id) {
        points = pts.exactPos // exact position
      } else if (qualifiedSet.has(pred.team_id) && pred.position <= 2) {
        points = pts.qualified // team qualified but wrong position
      }

      await db.from('group_predictions')
        .update({ points_earned: points })
        .eq('user_id', userId)
        .eq('group_name', groupName)
        .eq('position', pred.position)

      updated++
    }
  }

  // Recalculate user total points (sum of all predictions)
  const { data: allGroupPts } = await db.from('group_predictions').select('user_id, points_earned')
  const { data: allMatchPts } = await db.from('predictions').select('user_id, points_earned')
  const { data: allSpecialPts } = await db.from('special_predictions').select('user_id, points_earned')

  // Sum per user
  const totals: Record<string, number> = {}
  for (const r of [...(allGroupPts ?? []), ...(allMatchPts ?? []), ...(allSpecialPts ?? [])]) {
    totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_earned ?? 0)
  }

  for (const [userId, total] of Object.entries(totals)) {
    await db.from('profiles').update({ total_points: total }).eq('id', userId)
  }

  revalidatePath('/admin/pronosticos')
  return { success: true, count: updated }
}

/* ── Score special prediction ── */
export async function scoreSpecialPredictionAction(type: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const db = createServiceRoleClient()

  // Get result
  const { data: result } = await db.from('special_results')
    .select('player_id, team_id')
    .eq('type', type)
    .single()

  if (!result) return { error: 'No hay resultado oficial para este tipo' }

  // Scoring config (hardcoded defaults)
  const pointsPerType: Record<string, number> = {
    top_scorer:      10,
    best_goalkeeper: 8,
    best_player:     8,
    champion:        15,
    runner_up:       8,
  }
  const pts = pointsPerType[type] ?? 5

  // Get all user predictions for this type
  const { data: preds } = await db.from('special_predictions')
    .select('user_id, player_id, team_id')
    .eq('type', type)

  if (!preds) return { error: 'Error al leer predicciones' }

  let scored = 0
  for (const pred of preds) {
    let points = 0
    if (result.player_id && pred.player_id === result.player_id) points = pts
    else if (!result.player_id && result.team_id && pred.team_id === result.team_id) points = pts

    await db.from('special_predictions')
      .update({ points_earned: points })
      .eq('user_id', pred.user_id)
      .eq('type', type)

    scored++
  }

  // Recalculate totals
  const { data: allGroupPts } = await db.from('group_predictions').select('user_id, points_earned')
  const { data: allMatchPts } = await db.from('predictions').select('user_id, points_earned')
  const { data: allSpecialPts } = await db.from('special_predictions').select('user_id, points_earned')

  const totals: Record<string, number> = {}
  for (const r of [...(allGroupPts ?? []), ...(allMatchPts ?? []), ...(allSpecialPts ?? [])]) {
    totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_earned ?? 0)
  }
  for (const [userId, total] of Object.entries(totals)) {
    await db.from('profiles').update({ total_points: total }).eq('id', userId)
  }

  revalidatePath('/admin/pronosticos')
  return { success: true, count: scored }
}
