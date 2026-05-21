'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { Prediction } from '@/types'

export async function savePredictionAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const matchId = formData.get('match_id') as string
  const homeScore = parseInt(formData.get('home_score') as string)
  const awayScore = parseInt(formData.get('away_score') as string)

  if (!matchId || isNaN(homeScore) || isNaN(awayScore)) {
    return { error: 'Datos inválidos' }
  }

  // Verificar que el partido no esté bloqueado
  const { data: match } = await supabase
    .from('matches')
    .select('predictions_locked, match_date')
    .eq('id', matchId)
    .single()

  if (!match) {
    return { error: 'Partido no encontrado' }
  }

  const isLocked = match.predictions_locked || new Date(match.match_date) < new Date()
  if (isLocked) {
    return { error: 'Las predicciones para este partido están cerradas' }
  }

  // Determinar ganador predicho
  let predictedWinnerId = null
  if (homeScore > awayScore) {
    const { data: homeTeam } = await supabase.from('matches').select('home_team_id').eq('id', matchId).single()
    predictedWinnerId = homeTeam?.home_team_id
  } else if (awayScore > homeScore) {
    const { data: awayTeam } = await supabase.from('matches').select('away_team_id').eq('id', matchId).single()
    predictedWinnerId = awayTeam?.away_team_id
  }

  const { error } = await supabase
    .from('predictions')
    .upsert({
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: homeScore,
      predicted_away_score: awayScore,
      predicted_winner_id: predictedWinnerId,
    }, { onConflict: 'user_id,match_id' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/fixture')
  revalidatePath('/dashboard/predicciones')
  return { success: true }
}

export async function getUserPredictions() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('predictions')
    .select(`
      *,
      match:matches(*, home_team:teams!matches_home_team_id_fkey(name_es, flag_emoji, code), away_team:teams!matches_away_team_id_fkey(name_es, flag_emoji, code))
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []) as unknown as Prediction[]
}

export async function deletePredictionAction(matchId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('user_id', user.id)
    .eq('match_id', matchId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/fixture')
  revalidatePath('/dashboard/predicciones')
  return { success: true }
}
