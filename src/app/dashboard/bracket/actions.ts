'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'
import { KNOCKOUT_STAGES } from './constants'

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  let token = cookieStore.get('sb-access-token')?.value

  if (!token) {
    const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(/\/\/(.+?)\.supabase/)?.[1]
    if (projectRef) {
      const key = `sb-${projectRef}-auth-token`
      const raw = cookieStore.get(key)?.value ?? cookieStore.get(`${key}.0`)?.value
      if (raw) {
        try {
          const session = JSON.parse(decodeURIComponent(raw))
          if (session?.access_token) token = session.access_token
        } catch {}
      }
    }
  }

  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  return user?.id ?? null
}

export async function getBracketData() {
  const uid = await getAuthUserId()
  const db = createServiceRoleClient()

  const [matchesRes, predsRes] = await Promise.all([
    db.from('matches')
      .select(`
        id, match_number, stage, match_date, status,
        home_score, away_score, predictions_locked,
        home_team:teams!matches_home_team_id_fkey(id, name_es, code, flag_emoji),
        away_team:teams!matches_away_team_id_fkey(id, name_es, code, flag_emoji)
      `)
      .in('stage', KNOCKOUT_STAGES)
      .order('match_number'),
    uid
      ? db.from('bracket_predictions').select('slot_key, team_id, stage, points_earned').eq('user_id', uid)
      : Promise.resolve({ data: [] }),
  ])

  return {
    uid,
    matches: matchesRes.data ?? [],
    predictions: predsRes.data ?? [],
  }
}

export async function saveBracketPrediction(matchId: string, stage: string, teamId: string | null) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  const db = createServiceRoleClient()

  const { data: match } = await db.from('matches')
    .select('predictions_locked, match_date')
    .eq('id', matchId)
    .single()

  if (!match) return { error: 'Partido no encontrado' }
  if (match.predictions_locked || new Date(match.match_date) <= new Date()) {
    return { error: 'Las predicciones para este partido están cerradas' }
  }

  if (!teamId) {
    await db.from('bracket_predictions')
      .delete()
      .eq('user_id', uid)
      .eq('slot_key', matchId)
    revalidatePath('/dashboard/bracket')
    return { success: true }
  }

  const { error } = await db.from('bracket_predictions').upsert(
    { user_id: uid, stage, slot_key: matchId, team_id: teamId },
    { onConflict: 'user_id,stage,slot_key' },
  )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/bracket')
  return { success: true }
}
