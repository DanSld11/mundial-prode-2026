'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { SEED_TEAMS, generateGroupMatches } from '@/lib/seed-data'
import { SEED_PLAYERS } from '@/lib/seed-players'
import { revalidatePath } from 'next/cache'
import type { Team } from '@/types'

export async function seedTeamsAction() {
  const supabase = await createServerSupabaseClient()

  await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { error } = await supabase.from('teams').insert(
    SEED_TEAMS.map((t) => ({
      name: t.name,
      name_es: t.name_es,
      code: t.code,
      flag_emoji: t.flag_emoji,
      group_name: t.group_name,
      confederation: t.confederation,
    }))
  )

  if (error) {
    console.error('Error seeding teams:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/grupos')
  revalidatePath('/dashboard/fixture')
  return { success: true, count: SEED_TEAMS.length }
}

export async function seedMatchesAction() {
  const supabase = await createServerSupabaseClient()

  const { data: teamsData, error: teamsError } = await supabase.from('teams').select('id, code')
  if (teamsError || !teamsData) {
    return { error: teamsError?.message || 'No se encontraron equipos' }
  }

  const teams = teamsData as unknown as Team[]
  const teamMap = new Map(teams.map((t) => [t.code, t.id]))
  const matchData = generateGroupMatches(SEED_TEAMS as any)

  const matchesToInsert = matchData.map((m) => {
    const homeTeamId = teamMap.get(m.home_team_code)
    const awayTeamId = teamMap.get(m.away_team_code)

    if (!homeTeamId || !awayTeamId) {
      console.warn(`Team not found for match ${m.match_number}: ${m.home_team_code} vs ${m.away_team_code}`)
    }

    return {
      match_number: m.match_number,
      stage: m.stage,
      group_name: m.group_name,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: m.match_date,
      venue: m.venue,
      city: m.city,
    }
  })

  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { error } = await supabase.from('matches').insert(matchesToInsert)

  if (error) {
    console.error('Error seeding matches:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/fixture')
  revalidatePath('/dashboard/grupos')
  return { success: true, count: matchesToInsert.length }
}

export async function seedPlayersAction() {
  const adminClient = createServiceRoleClient()

  // Fetch all teams to build code → id map
  const { data: teamsData, error: teamsError } = await adminClient
    .from('teams')
    .select('id, code')

  if (teamsError || !teamsData || teamsData.length === 0) {
    return { error: 'Primero cargá los 48 equipos con el botón "48 Equipos".' }
  }

  const teamMap = new Map<string, string>(teamsData.map((t: any) => [t.code, t.id]))

  // Remove existing players to avoid duplicates
  await adminClient.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // Build insert payload
  const playersToInsert = SEED_PLAYERS.map((p) => {
    const teamId = teamMap.get(p.team_code)
    if (!teamId) {
      console.warn(`Team code not found: ${p.team_code}`)
      return null
    }
    return {
      team_id: teamId,
      name: p.name,
      shirt_number: p.shirt_number,
      position: p.position,
      active: true,
    }
  }).filter(Boolean)

  const CHUNK = 200
  let inserted = 0
  for (let i = 0; i < playersToInsert.length; i += CHUNK) {
    const { error } = await adminClient.from('players').insert(playersToInsert.slice(i, i + CHUNK))
    if (error) return { error: error.message }
    inserted += Math.min(CHUNK, playersToInsert.length - i)
  }

  revalidatePath('/admin/jugadores')
  revalidatePath('/dashboard/fixture')
  return { success: true, count: inserted }
}

export async function updateMatchResultAction(formData: FormData) {
  const matchId = formData.get('match_id') as string
  const homeScore = parseInt(formData.get('home_score') as string)
  const awayScore = parseInt(formData.get('away_score') as string)
  const scorerIds = formData.getAll('scorer_ids').map(String).filter(Boolean)

  if (!matchId || isNaN(homeScore) || isNaN(awayScore)) {
    return { error: 'Datos inválidos' }
  }

  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
  let adminClient: ReturnType<typeof createServiceRoleClient>

  try {
    supabase = await createServerSupabaseClient()
    adminClient = createServiceRoleClient()
  } catch (e: any) {
    return { error: e.message }
  }

  const { data: match } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id')
    .eq('id', matchId)
    .single()

  if (!match) {
    return { error: 'Partido no encontrado' }
  }

  let winnerId = null
  let isDraw = false
  if (homeScore > awayScore) {
    winnerId = match.home_team_id
  } else if (awayScore > homeScore) {
    winnerId = match.away_team_id
  } else {
    isDraw = true
  }

  const { error: updateError } = await adminClient
    .from('matches')
    .update({
      home_score: homeScore,
      away_score: awayScore,
      winner_team_id: winnerId,
      is_draw: isDraw,
      status: 'finished',
      predictions_locked: true,
    })
    .eq('id', matchId)

  if (updateError) {
    return { error: `Error actualizando partido: ${updateError.message}` }
  }

  await adminClient.from('match_goal_scorers').delete().eq('match_id', matchId)

  if (scorerIds.length > 0) {
    const { error: scorersError } = await adminClient
      .from('match_goal_scorers')
      .insert(scorerIds.map((playerId) => ({ match_id: matchId, player_id: playerId })))

    if (scorersError) {
      return { error: `Error guardando goleadores: ${scorersError.message}` }
    }
  }

  // Calcular puntos usando service role para tener permisos completos
  const { error: rpcError } = await adminClient.rpc('update_match_predictions', {
    p_match_id: matchId,
    p_home_score: homeScore,
    p_away_score: awayScore,
  })

  if (rpcError) {
    // Fallback: calcular puntos directo si el RPC falla
    const fallbackError = await calculatePointsFallback(adminClient, matchId, homeScore, awayScore)
    if (fallbackError) {
      return { error: `Resultado guardado pero error al calcular puntos: ${rpcError.message}` }
    }
  }

  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard/fixture')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')
  revalidatePath('/dashboard')
  return { success: true }
}

// Fallback por si el RPC no está disponible: calcula puntos directo con JS
async function calculatePointsFallback(
  adminClient: ReturnType<typeof createServiceRoleClient>,
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<string | null> {
  try {
    const actualOutcome = homeScore > awayScore ? 'home' : awayScore > homeScore ? 'away' : 'draw'

    const { data: settings } = await adminClient.from('scoring_settings').select('prediction_type, points')
    const pts = {
      outcome: settings?.find((s) => s.prediction_type === 'outcome')?.points ?? 1,
      scorer: settings?.find((s) => s.prediction_type === 'scorer')?.points ?? 2,
      exact_score: settings?.find((s) => s.prediction_type === 'exact_score')?.points ?? 3,
    }

    const { data: predictions } = await adminClient
      .from('predictions')
      .select('id, user_id, predicted_outcome, predicted_scorer_id, predicted_home_score, predicted_away_score')
      .eq('match_id', matchId)

    if (!predictions?.length) return null

    const { data: scorers } = await adminClient
      .from('match_goal_scorers')
      .select('player_id')
      .eq('match_id', matchId)

    const scorerSet = new Set((scorers ?? []).map((s) => s.player_id))

    for (const pred of predictions) {
      const outcomePoints = pred.predicted_outcome === actualOutcome ? pts.outcome : 0
      const scorerPoints = pred.predicted_scorer_id && scorerSet.has(pred.predicted_scorer_id) ? pts.scorer : 0
      const exactPoints =
        pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore ? pts.exact_score : 0
      const total = outcomePoints + scorerPoints + exactPoints

      await adminClient
        .from('predictions')
        .update({
          outcome_points: outcomePoints,
          scorer_points: scorerPoints,
          exact_score_points: exactPoints,
          points_earned: total,
          is_exact_score: exactPoints > 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pred.id)
    }

    // Recalcular total de cada usuario afectado
    const userIds = Array.from(new Set(predictions.map((p) => p.user_id)))
    for (const userId of userIds) {
      const { data: userPreds } = await adminClient
        .from('predictions')
        .select('points_earned')
        .eq('user_id', userId)
      const total = (userPreds ?? []).reduce((sum, p) => sum + (p.points_earned ?? 0), 0)
      await adminClient.from('profiles').update({ total_points: total, updated_at: new Date().toISOString() }).eq('id', userId)
    }

    return null
  } catch (e: any) {
    return e.message
  }
}

export async function recalculateAllPointsAction() {
  let adminClient: ReturnType<typeof createServiceRoleClient>
  try {
    adminClient = createServiceRoleClient()
  } catch (e: any) {
    return { error: e.message }
  }

  const { data: matches, error } = await adminClient
    .from('matches')
    .select('id, home_score, away_score')
    .eq('status', 'finished')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)

  if (error) {
    return { error: error.message }
  }

  let recalculated = 0
  let rpcAvailable = true

  for (const match of matches ?? []) {
    if (rpcAvailable) {
      const { error: rpcError } = await adminClient.rpc('update_match_predictions', {
        p_match_id: match.id,
        p_home_score: match.home_score,
        p_away_score: match.away_score,
      })

      if (rpcError) {
        rpcAvailable = false
        const fallbackError = await calculatePointsFallback(adminClient, match.id, match.home_score, match.away_score)
        if (fallbackError) return { error: fallbackError }
      }
    } else {
      const fallbackError = await calculatePointsFallback(adminClient, match.id, match.home_score, match.away_score)
      if (fallbackError) return { error: fallbackError }
    }

    recalculated += 1
  }

  revalidatePath('/admin')
  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/fixture')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')

  return { success: true, count: recalculated }
}
