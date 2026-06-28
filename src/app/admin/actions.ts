'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { SEED_TEAMS, generateGroupMatches } from '@/lib/seed-data'
import { SEED_PLAYERS } from '@/lib/seed-players'
import { revalidatePath } from 'next/cache'
import type { Team } from '@/types'
import { STAGE_MULTIPLIERS } from '@/types'

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
  revalidatePath('/dashboard/partidos')
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

  revalidatePath('/dashboard/partidos')
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
  revalidatePath('/dashboard/partidos')
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

  // Calcular puntos solo con la lógica de JS (Node)
  const errorCalculating = await calculatePointsFallback(adminClient, matchId, homeScore, awayScore)
  if (errorCalculating) {
    return { error: `Resultado guardado pero error al calcular puntos: ${errorCalculating}` }
  }

  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard/partidos')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')
  revalidatePath('/dashboard')
  return { success: true }
}

// Lógica de cálculo de puntos con multiplicador por fase y bono batacazo.
// Aplica a predicciones hechas desde el módulo Partidos (tabla predictions).
// Para eliminatorias el multiplicador es 1.5×; para final es 3×; etc.
// skipUserTotal=true cuando se llama en bucle masivo (recalculateAll), para evitar
// N×M queries redundantes — el llamador actualiza totales al final en lote.
async function calculatePointsFallback(
  adminClient: ReturnType<typeof createServiceRoleClient>,
  matchId: string,
  homeScore: number,
  awayScore: number,
  skipUserTotal = false,
): Promise<string | null> {
  try {
    const { data: matchData } = await adminClient.from('matches').select('stage').eq('id', matchId).single()
    const stageMultiplier = STAGE_MULTIPLIERS[(matchData?.stage ?? 'group') as keyof typeof STAGE_MULTIPLIERS] ?? 1

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

    // Bono batacazo: si ≤20% acertaron el resultado → +2 pts
    // Inferir outcome cuando predicted_outcome es null (predicciones hechas solo con marcador)
    function inferOutcome(p: any): string | null {
      if (p.predicted_outcome) return p.predicted_outcome
      if (p.predicted_home_score != null && p.predicted_away_score != null) {
        if (p.predicted_home_score > p.predicted_away_score) return 'home'
        if (p.predicted_away_score > p.predicted_home_score) return 'away'
        return 'draw'
      }
      return null
    }
    const totalPredictions = predictions.length
    const correctOutcomeCount = predictions.filter((p) => inferOutcome(p) === actualOutcome).length
    const isUnderdog = correctOutcomeCount > 0 && correctOutcomeCount / totalPredictions <= 0.20

    const { data: scorers } = await adminClient.from('match_goal_scorers').select('player_id').eq('match_id', matchId)
    const scorerSet = new Set((scorers ?? []).map((s) => s.player_id))

    for (const pred of predictions) {
      // Inferir outcome desde marcadores si predicted_outcome no fue guardado explícitamente
      const effectiveOutcome =
        pred.predicted_outcome ||
        (pred.predicted_home_score != null && pred.predicted_away_score != null
          ? pred.predicted_home_score > pred.predicted_away_score
            ? 'home'
            : pred.predicted_away_score > pred.predicted_home_score
            ? 'away'
            : 'draw'
          : null)

      const isCorrectOutcome = effectiveOutcome === actualOutcome
      const baseOutcomePoints = isCorrectOutcome ? pts.outcome : 0
      const underdogBonus = isCorrectOutcome && isUnderdog ? 2 : 0
      const scorerPoints = pred.predicted_scorer_id && scorerSet.has(pred.predicted_scorer_id) ? pts.scorer : 0
      const exactPoints =
        pred.predicted_home_score === homeScore && pred.predicted_away_score === awayScore ? pts.exact_score : 0
      const total = (baseOutcomePoints + scorerPoints + exactPoints) * stageMultiplier + underdogBonus

      await adminClient
        .from('predictions')
        .update({
          outcome_points: baseOutcomePoints * stageMultiplier + underdogBonus,
          scorer_points: scorerPoints * stageMultiplier,
          exact_score_points: exactPoints * stageMultiplier,
          points_earned: total,
          is_exact_score: exactPoints > 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', pred.id)
    }

    if (!skipUserTotal) {
      // Recalcular total de cada usuario sumando las 3 tablas de predicciones
      const userIds = Array.from(new Set(predictions.map((p) => p.user_id)))
      for (const userId of userIds) {
        const [{ data: matchPts }, { data: groupPts }, { data: specialPts }] = await Promise.all([
          adminClient.from('predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('group_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('special_predictions').select('points_earned').eq('user_id', userId),
        ])
        const total =
          (matchPts ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0) +
          (groupPts ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0) +
          (specialPts ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0)
        await adminClient.from('profiles').update({ total_points: total, updated_at: new Date().toISOString() }).eq('id', userId)
      }
    }

    return null
  } catch (e: any) {
    return e.message
  }
}

// Función exportada para que otros módulos (ej: bracket admin) puedan calcular puntos
export async function scoreMatchAction(matchId: string, homeScore: number, awayScore: number) {
  const adminClient = createServiceRoleClient()

  // 1. Score predictions table (marcadores + goleador, con multiplicador)
  const err = await calculatePointsFallback(adminClient, matchId, homeScore, awayScore)
  if (err) return { error: err }

  // 2. Score bracket_predictions para este partido eliminatorio
  const { data: matchData } = await adminClient
    .from('matches')
    .select('stage, home_team_id, away_team_id, winner_team_id')
    .eq('id', matchId)
    .single()

  if (matchData) {
    const KNOCKOUT_STAGES = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
    if (KNOCKOUT_STAGES.includes(matchData.stage)) {
      const { data: settings } = await adminClient.from('scoring_settings').select('prediction_type, points')
      const outcomePts = settings?.find((s: any) => s.prediction_type === 'outcome')?.points ?? 1
      const multiplier = STAGE_MULTIPLIERS[(matchData.stage as keyof typeof STAGE_MULTIPLIERS)] ?? 1

      const winnerId =
        homeScore > awayScore ? matchData.home_team_id
        : awayScore > homeScore ? matchData.away_team_id
        : matchData.winner_team_id ?? null

      const { data: bpreds } = await adminClient
        .from('bracket_predictions')
        .select('id, user_id, team_id')
        .eq('slot_key', matchId)

      const bracketUserIds = new Set<string>()
      for (const bp of bpreds ?? []) {
        const pts = winnerId && bp.team_id === winnerId ? outcomePts * multiplier : 0
        await adminClient.from('bracket_predictions')
          .update({ points_earned: pts, updated_at: new Date().toISOString() })
          .eq('id', bp.id)
        bracketUserIds.add(bp.user_id)
      }

      // Actualizar total de usuarios afectados por bracket (sumando las 4 tablas)
      for (const userId of bracketUserIds) {
        const [{ data: matchPts }, { data: groupPts }, { data: specialPts }, { data: bracketPts }] = await Promise.all([
          adminClient.from('predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('group_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('special_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('bracket_predictions').select('points_earned').eq('user_id', userId),
        ])
        const total =
          (matchPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (groupPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (specialPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (bracketPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0)
        await adminClient.from('profiles').update({ total_points: total, updated_at: new Date().toISOString() }).eq('id', userId)
      }
    }
  }

  revalidatePath('/dashboard/tabla')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/partidos')
  revalidatePath('/dashboard/predicciones')
  return { success: true }
}

export async function resetTournamentAction() {
  let adminClient: ReturnType<typeof createServiceRoleClient>
  try {
    adminClient = createServiceRoleClient()
  } catch (e: any) {
    return { error: e.message }
  }

  // 1. Borrar predicciones de partidos
  const { error: e1 } = await adminClient
    .from('predictions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (e1) return { error: `predictions: ${e1.message}` }

  // 2. Borrar predicciones de grupos
  const { error: e2 } = await adminClient
    .from('group_predictions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (e2) return { error: `group_predictions: ${e2.message}` }

  // 3. Borrar goleadores de partidos (tabla sin columna id — usar match_id)
  const { error: e3 } = await adminClient
    .from('match_goal_scorers')
    .delete()
    .not('match_id', 'is', null)
  if (e3) return { error: `match_goal_scorers: ${e3.message}` }

  // 4. Resetear resultados de partidos a pendiente
  const { error: e4 } = await adminClient
    .from('matches')
    .update({
      home_score: null,
      away_score: null,
      winner_team_id: null,
      is_draw: false,
      status: 'scheduled',
      predictions_locked: false,
    })
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (e4) return { error: `matches reset: ${e4.message}` }

  // 5. Resetear puntos de todos los usuarios a 0
  const { error: e5 } = await adminClient
    .from('profiles')
    .update({ total_points: 0 })
    .neq('id', '00000000-0000-0000-0000-000000000000')
  if (e5) return { error: `profiles reset: ${e5.message}` }

  revalidatePath('/admin')
  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/partidos')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')

  return { success: true }
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

  // Paso 1: recalcular predictions.points_earned para todos los partidos finalizados en paralelo
  // skipUserTotal=true: omite actualización individual por usuario (Step 3 lo hace en lote al final)
  await Promise.all((matches ?? []).map((match) =>
    calculatePointsFallback(adminClient, match.id, match.home_score, match.away_score, true)
  ))
  recalculated = matches?.length ?? 0

  // Paso 2: score bracket_predictions para todos los partidos eliminatorios finalizados
  const KNOCKOUT_STAGES = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
  const { data: knockoutMatches } = await adminClient
    .from('matches')
    .select('id, stage, home_score, away_score, home_team_id, away_team_id, winner_team_id')
    .in('stage', KNOCKOUT_STAGES)
    .eq('status', 'finished')
    .not('home_score', 'is', null)

  const { data: scoringSettings } = await adminClient.from('scoring_settings').select('prediction_type, points')
  const outcomePoints = scoringSettings?.find((s: any) => s.prediction_type === 'outcome')?.points ?? 1

  for (const km of knockoutMatches ?? []) {
    const multiplier = STAGE_MULTIPLIERS[(km.stage as keyof typeof STAGE_MULTIPLIERS)] ?? 1
    const winnerId =
      km.home_score > km.away_score ? km.home_team_id
      : km.away_score > km.home_score ? km.away_team_id
      : km.winner_team_id ?? null

    const { data: bpreds } = await adminClient
      .from('bracket_predictions')
      .select('id, user_id, team_id')
      .eq('slot_key', km.id)

    for (const bp of bpreds ?? []) {
      const pts = winnerId && bp.team_id === winnerId ? outcomePoints * multiplier : 0
      await adminClient.from('bracket_predictions')
        .update({ points_earned: pts, updated_at: new Date().toISOString() })
        .eq('id', bp.id)
    }
  }

  // Paso 3: recalcular total de TODOS los usuarios sumando las 4 tablas
  // Límite explícito para evitar truncado por defecto de Supabase (1000 filas)
  const { data: allGroupPts } = await adminClient.from('group_predictions').select('user_id, points_earned').limit(50000)
  const { data: allMatchPts } = await adminClient.from('predictions').select('user_id, points_earned').limit(50000)
  const { data: allSpecialPts } = await adminClient.from('special_predictions').select('user_id, points_earned').limit(50000)
  const { data: allBracketPts } = await adminClient.from('bracket_predictions').select('user_id, points_earned').limit(50000)

  const totals: Record<string, number> = {}
  for (const r of [
    ...(allMatchPts ?? []),
    ...(allGroupPts ?? []),
    ...(allSpecialPts ?? []),
    ...(allBracketPts ?? []),
  ]) {
    totals[(r as any).user_id] = (totals[(r as any).user_id] ?? 0) + ((r as any).points_earned ?? 0)
  }
  for (const [userId, total] of Object.entries(totals)) {
    await adminClient.from('profiles').update({ total_points: total, updated_at: new Date().toISOString() }).eq('id', userId)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/partidos')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')

  return { success: true, count: recalculated }
}
