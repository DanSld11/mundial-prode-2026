'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { SEED_TEAMS, generateGroupMatches } from '@/lib/seed-data'
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

export async function updateMatchResultAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const matchId = formData.get('match_id') as string
  const homeScore = parseInt(formData.get('home_score') as string)
  const awayScore = parseInt(formData.get('away_score') as string)
  const scorerIds = formData.getAll('scorer_ids').map(String).filter(Boolean)

  if (!matchId || isNaN(homeScore) || isNaN(awayScore)) {
    return { error: 'Datos inválidos' }
  }

  // Obtener el partido para saber los equipos
  const { data: match } = await supabase
    .from('matches')
    .select('home_team_id, away_team_id')
    .eq('id', matchId)
    .single()

  if (!match) {
    return { error: 'Partido no encontrado' }
  }

  // Determinar ganador
  let winnerId = null
  let isDraw = false
  if (homeScore > awayScore) {
    winnerId = match.home_team_id
  } else if (awayScore > homeScore) {
    winnerId = match.away_team_id
  } else {
    isDraw = true
  }

  // Actualizar partido
  const { error: updateError } = await supabase
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
    return { error: updateError.message }
  }

  await supabase.from('match_goal_scorers').delete().eq('match_id', matchId)

  if (scorerIds.length > 0) {
    const { error: scorersError } = await supabase
      .from('match_goal_scorers')
      .insert(scorerIds.map((playerId) => ({ match_id: matchId, player_id: playerId })))

    if (scorersError) {
      return { error: scorersError.message }
    }
  }

  // Recalcular puntos
  const { error: rpcError } = await supabase.rpc('update_match_predictions', {
    p_match_id: matchId,
    p_home_score: homeScore,
    p_away_score: awayScore,
  })

  if (rpcError) {
    return { error: rpcError.message }
  }

  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard/fixture')
  revalidatePath('/dashboard/predicciones')
  revalidatePath('/dashboard/tabla')
  revalidatePath('/dashboard')
  return { success: true }
}
