'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/* ── Carga inicial ── */
export async function getPronosticosData() {
  const uid = await getAuthUserId()
  const db  = createServiceRoleClient()

  const [teamsRes, groupPredsRes, specialPredsRes, specialResultsRes, playersRes] = await Promise.all([
    db.from('teams').select('id, name_es, flag_emoji, code, group_name').order('group_name').order('name_es'),
    uid
      ? db.from('group_predictions').select('group_name, position, team_id').eq('user_id', uid)
      : Promise.resolve({ data: [] }),
    uid
      ? db.from('special_predictions').select('type, player_id, team_id, points_earned').eq('user_id', uid)
      : Promise.resolve({ data: [] }),
    db.from('special_results').select('type, player_id, locked'),
    db.from('players').select('id, name, team_id, position').order('name'),
  ])

  return {
    uid,
    teams:          teamsRes.data ?? [],
    groupPreds:     groupPredsRes.data ?? [],
    specialPreds:   specialPredsRes.data ?? [],
    specialResults: specialResultsRes.data ?? [],
    players:        playersRes.data ?? [],
  }
}

/* ── Guardar posición de grupo ── */
export async function saveGroupPredictionAction(
  groupName: string,
  position: number,
  teamId: string | null,
) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  const db = createServiceRoleClient()

  if (!teamId) {
    await db.from('group_predictions')
      .delete()
      .eq('user_id', uid)
      .eq('group_name', groupName)
      .eq('position', position)
    revalidatePath('/dashboard/pronosticos')
    return { success: true }
  }

  // Verificar que no esté en otra posición del mismo grupo
  const { data: existing } = await db.from('group_predictions')
    .select('position')
    .eq('user_id', uid)
    .eq('group_name', groupName)
    .eq('team_id', teamId)
    .maybeSingle()

  if (existing && existing.position !== position) {
    // Quitar de la posición anterior primero
    await db.from('group_predictions')
      .delete()
      .eq('user_id', uid)
      .eq('group_name', groupName)
      .eq('team_id', teamId)
  }

  const { error } = await db.from('group_predictions').upsert(
    { user_id: uid, group_name: groupName, position, team_id: teamId },
    { onConflict: 'user_id,group_name,position' },
  )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/pronosticos')
  return { success: true }
}

/* ── Guardar predicción especial ── */
export async function saveSpecialPredictionAction(
  type: string,
  playerId: string | null,
  teamId: string | null,
) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  // Verificar que el tipo no esté bloqueado
  const db = createServiceRoleClient()
  const { data: result } = await db.from('special_results').select('locked').eq('type', type).single()
  if (result?.locked) return { error: 'Este pronóstico ya está cerrado' }

  const { error } = await db.from('special_predictions').upsert(
    { user_id: uid, type, player_id: playerId, team_id: teamId },
    { onConflict: 'user_id,type' },
  )

  if (error) return { error: error.message }
  return { success: true }
}
