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
// Multiplicadores por fase: grupos×1, R32×2, R16×2, QF×3, SF×4, 3°×4, Final×5
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
      // Recalcular total de cada usuario sumando las 3 tablas de predicciones + ajustes manuales
      const userIds = Array.from(new Set(predictions.map((p) => p.user_id)))
      for (const userId of userIds) {
        const [{ data: matchPts }, { data: groupPts }, { data: specialPts }, { data: adjPts }] = await Promise.all([
          adminClient.from('predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('group_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('special_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('user_notifications').select('points_change').eq('user_id', userId).eq('type', 'point_adjustment'),
        ])
        const total =
          (matchPts ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0) +
          (groupPts ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0) +
          (specialPts ?? []).reduce((s, p) => s + (p.points_earned ?? 0), 0) +
          (adjPts ?? []).reduce((s, p) => s + ((p as any).points_change ?? 0), 0)
        await adminClient.from('profiles').update({ total_points: Math.max(0, total), updated_at: new Date().toISOString() }).eq('id', userId)
      }
    }

    return null
  } catch (e: any) {
    return e.message
  }
}

// Diagnóstico: puntúa un partido por su número y devuelve info detallada de qué encontró.
// Usar desde admin para debuggear casos donde "Recalcular Puntos" no funciona para un partido.
export async function debugScoreMatchByNumberAction(matchNumber: number) {
  const adminClient = createServiceRoleClient()

  const { data: match } = await adminClient
    .from('matches')
    .select('id, match_number, status, home_score, away_score, stage')
    .eq('match_number', matchNumber)
    .maybeSingle()

  if (!match) return { error: `Partido #${matchNumber} no encontrado en la base de datos` }
  if (match.status !== 'finished') return { error: `Partido #${matchNumber} aún no está finalizado (status: ${match.status})` }
  if (match.home_score == null || match.away_score == null) return { error: `Partido #${matchNumber} no tiene marcador cargado` }

  const { data: preds } = await adminClient
    .from('predictions')
    .select('id, user_id, predicted_outcome, predicted_home_score, predicted_away_score, predicted_scorer_id, points_earned')
    .eq('match_id', match.id)

  const predCount = preds?.length ?? 0

  // Ejecutar scoring
  const err = await calculatePointsFallback(adminClient, match.id, match.home_score, match.away_score, false)

  // Leer puntos actualizados
  const { data: predsAfter } = await adminClient
    .from('predictions')
    .select('id, user_id, points_earned')
    .eq('match_id', match.id)

  return {
    match: { id: match.id, number: match.match_number, status: match.status, score: `${match.home_score}-${match.away_score}`, stage: match.stage },
    predictionsFound: predCount,
    predsBefore: (preds ?? []).map(p => ({
      userId: (p as any).user_id.slice(0, 8),
      outcome: (p as any).predicted_outcome,
      home: (p as any).predicted_home_score,
      away: (p as any).predicted_away_score,
      scorer: (p as any).predicted_scorer_id ? '✓' : null,
      ptsWas: (p as any).points_earned,
    })),
    scoringError: err ?? null,
    pointsAfter: (predsAfter ?? []).map(p => ({ userId: (p as any).user_id.slice(0, 8), pts: (p as any).points_earned })),
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

      // Actualizar total de usuarios afectados por bracket (sumando las 4 tablas + ajustes manuales, en paralelo)
      await Promise.all(Array.from(bracketUserIds).map(async (userId) => {
        const [{ data: matchPts }, { data: groupPts }, { data: specialPts }, { data: bracketPts }, { data: adjPts }] = await Promise.all([
          adminClient.from('predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('group_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('special_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('bracket_predictions').select('points_earned').eq('user_id', userId),
          adminClient.from('user_notifications').select('points_change').eq('user_id', userId).eq('type', 'point_adjustment'),
        ])
        const total =
          (matchPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (groupPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (specialPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (bracketPts ?? []).reduce((s, p) => s + ((p as any).points_earned ?? 0), 0) +
          (adjPts ?? []).reduce((s, p) => s + ((p as any).points_change ?? 0), 0)
        await adminClient.from('profiles').update({ total_points: Math.max(0, total), updated_at: new Date().toISOString() }).eq('id', userId)
      }))
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

  // 1. Todos los partidos finalizados de una sola query
  const { data: matches, error } = await adminClient
    .from('matches')
    .select('id, home_score, away_score, stage, home_team_id, away_team_id, winner_team_id')
    .eq('status', 'finished')
    .not('home_score', 'is', null)
    .not('away_score', 'is', null)

  if (error) return { error: error.message }
  if (!matches?.length) return { success: true, count: 0 }

  // 2. Settings de puntuación una sola vez
  const { data: settingsData } = await adminClient.from('scoring_settings').select('prediction_type, points')
  const pts = {
    outcome: settingsData?.find((s: any) => s.prediction_type === 'outcome')?.points ?? 1,
    scorer: settingsData?.find((s: any) => s.prediction_type === 'scorer')?.points ?? 2,
    exact_score: settingsData?.find((s: any) => s.prediction_type === 'exact_score')?.points ?? 3,
  }

  const matchIds = matches.map((m) => m.id)
  const now = new Date().toISOString()

  // 3. Todas las predicciones + goleadores de todos los partidos de una sola query cada una
  const [{ data: allPreds }, { data: allScorers }] = await Promise.all([
    adminClient.from('predictions')
      .select('id, user_id, match_id, predicted_outcome, predicted_scorer_id, predicted_home_score, predicted_away_score')
      .in('match_id', matchIds)
      .limit(50000),
    adminClient.from('match_goal_scorers')
      .select('match_id, player_id')
      .in('match_id', matchIds)
      .limit(10000),
  ])

  // Indexar datos
  const matchMap = new Map(matches.map((m) => [m.id, m]))
  const scorersByMatch = new Map<string, Set<string>>()
  for (const s of allScorers ?? []) {
    if (!scorersByMatch.has(s.match_id)) scorersByMatch.set(s.match_id, new Set())
    scorersByMatch.get(s.match_id)!.add(s.player_id)
  }
  const predsByMatch = new Map<string, any[]>()
  for (const p of allPreds ?? []) {
    if (!predsByMatch.has(p.match_id)) predsByMatch.set(p.match_id, [])
    predsByMatch.get(p.match_id)!.push(p)
  }

  function inferOutcome(pred: any): string | null {
    if (pred.predicted_outcome) return pred.predicted_outcome
    if (pred.predicted_home_score != null && pred.predicted_away_score != null) {
      if (pred.predicted_home_score > pred.predicted_away_score) return 'home'
      if (pred.predicted_away_score > pred.predicted_home_score) return 'away'
      return 'draw'
    }
    return null
  }

  // 4. Calcular puntos de TODAS las predicciones en JS (sin queries adicionales)
  const predsToUpdate: any[] = []
  for (const [matchId, matchPreds] of predsByMatch) {
    const match = matchMap.get(matchId)
    if (!match) continue
    const { home_score: hs, away_score: as_, stage } = match
    const multiplier = STAGE_MULTIPLIERS[(stage ?? 'group') as keyof typeof STAGE_MULTIPLIERS] ?? 1
    const actualOutcome = hs > as_ ? 'home' : as_ > hs ? 'away' : 'draw'
    const scorerSet = scorersByMatch.get(matchId) ?? new Set()
    // Batacazo: ≤20% acertaron → +2 pts
    const correctCount = matchPreds.filter((p) => inferOutcome(p) === actualOutcome).length
    const isUnderdog = correctCount > 0 && correctCount / matchPreds.length <= 0.20

    for (const pred of matchPreds) {
      const eff = inferOutcome(pred)
      const correct = eff === actualOutcome
      const outcomeBase = correct ? pts.outcome : 0
      const underdogBonus = correct && isUnderdog ? 2 : 0
      const scorerPts = pred.predicted_scorer_id && scorerSet.has(pred.predicted_scorer_id) ? pts.scorer : 0
      const exactPts = pred.predicted_home_score === hs && pred.predicted_away_score === as_ ? pts.exact_score : 0
      const total = (outcomeBase + scorerPts + exactPts) * multiplier + underdogBonus
      predsToUpdate.push({
        id: pred.id,
        user_id: pred.user_id,
        match_id: pred.match_id,
        predicted_outcome: pred.predicted_outcome,
        predicted_scorer_id: pred.predicted_scorer_id,
        predicted_home_score: pred.predicted_home_score,
        predicted_away_score: pred.predicted_away_score,
        outcome_points: outcomeBase * multiplier + underdogBonus,
        scorer_points: scorerPts * multiplier,
        exact_score_points: exactPts * multiplier,
        points_earned: total,
        is_exact_score: exactPts > 0,
        updated_at: now,
      })
    }
  }

  // 5. Update en lotes paralelos (más confiable que upsert — evita problemas de NOT NULL)
  const PAR = 50
  for (let i = 0; i < predsToUpdate.length; i += PAR) {
    await Promise.all(
      predsToUpdate.slice(i, i + PAR).map((p: any) =>
        adminClient.from('predictions').update({
          outcome_points: p.outcome_points,
          scorer_points: p.scorer_points,
          exact_score_points: p.exact_score_points,
          points_earned: p.points_earned,
          is_exact_score: p.is_exact_score,
          updated_at: p.updated_at,
        }).eq('id', p.id)
      )
    )
  }

  // 6. Score bracket_predictions para partidos eliminatorios
  const KNOCKOUT_STAGES = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
  const knockoutMatches = matches.filter((m) => KNOCKOUT_STAGES.includes(m.stage))
  if (knockoutMatches.length > 0) {
    const { data: allBpreds } = await adminClient
      .from('bracket_predictions')
      .select('id, user_id, team_id, slot_key')
      .in('slot_key', knockoutMatches.map((m) => m.id))
      .limit(50000)

    const bpredsBySlot = new Map<string, any[]>()
    for (const bp of allBpreds ?? []) {
      if (!bpredsBySlot.has(bp.slot_key)) bpredsBySlot.set(bp.slot_key, [])
      bpredsBySlot.get(bp.slot_key)!.push(bp)
    }

    const bpredsToUpdate: any[] = []
    for (const km of knockoutMatches) {
      const multiplier = STAGE_MULTIPLIERS[(km.stage as keyof typeof STAGE_MULTIPLIERS)] ?? 1
      const winnerId =
        km.home_score > km.away_score ? km.home_team_id
        : km.away_score > km.home_score ? km.away_team_id
        : km.winner_team_id ?? null
      for (const bp of bpredsBySlot.get(km.id) ?? []) {
        const bpts = winnerId && bp.team_id === winnerId ? pts.outcome * multiplier : 0
        bpredsToUpdate.push({ id: bp.id, user_id: bp.user_id, team_id: bp.team_id, slot_key: bp.slot_key, points_earned: bpts, updated_at: now })
      }
    }
    for (let i = 0; i < bpredsToUpdate.length; i += PAR) {
      await Promise.all(
        bpredsToUpdate.slice(i, i + PAR).map((bp: any) =>
          adminClient.from('bracket_predictions').update({
            points_earned: bp.points_earned,
            updated_at: bp.updated_at,
          }).eq('id', bp.id)
        )
      )
    }
  }

  // 7. Sumar totales por usuario desde las 4 tablas + ajustes manuales y actualizar perfiles
  const [{ data: mPts }, { data: gPts }, { data: sPts }, { data: bPts }, { data: adjPts }] = await Promise.all([
    adminClient.from('predictions').select('user_id, points_earned').limit(50000),
    adminClient.from('group_predictions').select('user_id, points_earned').limit(50000),
    adminClient.from('special_predictions').select('user_id, points_earned').limit(50000),
    adminClient.from('bracket_predictions').select('user_id, points_earned').limit(50000),
    adminClient.from('user_notifications').select('user_id, points_change').eq('type', 'point_adjustment').limit(10000),
  ])

  const totals: Record<string, number> = {}
  for (const r of [...(mPts ?? []), ...(gPts ?? []), ...(sPts ?? []), ...(bPts ?? [])]) {
    const uid = (r as any).user_id
    totals[uid] = (totals[uid] ?? 0) + ((r as any).points_earned ?? 0)
  }
  // Incluir ajustes manuales de admin
  for (const r of adjPts ?? []) {
    const uid = (r as any).user_id
    totals[uid] = (totals[uid] ?? 0) + ((r as any).points_change ?? 0)
  }
  await Promise.all(
    Object.entries(totals).map(([userId, total]) =>
      adminClient.from('profiles').update({ total_points: Math.max(0, total), updated_at: now }).eq('id', userId)
    )
  )

  revalidatePath('/admin')
  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/partidos')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')
  revalidatePath('/dashboard/pollas', 'layout')

  return { success: true, count: matches.length }
}
