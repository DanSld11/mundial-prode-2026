'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const db = createServiceRoleClient()
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function getScoringSettingsAction() {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador', settings: [] }

  const db = createServiceRoleClient()
  const { data, error } = await db.from('scoring_settings').select('*')
  if (error) return { error: error.message, settings: [] }
  return { settings: data ?? [] }
}

export async function saveScoringSettingAction(type: string, points: number) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }

  const db = createServiceRoleClient()
  const { error } = await db
    .from('scoring_settings')
    .upsert({ prediction_type: type, points, updated_at: new Date().toISOString() })

  if (error) return { error: error.message }

  const { data: finishedMatches } = await db
    .from('matches')
    .select('id, home_score, away_score')
    .eq('status', 'finished')

  for (const match of finishedMatches ?? []) {
    if (match.home_score === null || match.away_score === null) continue
    await db.rpc('update_match_predictions', {
      p_match_id: match.id,
      p_home_score: match.home_score,
      p_away_score: match.away_score,
    })
  }

  revalidatePath('/admin/puntuacion')
  revalidatePath('/dashboard/tabla')
  return { success: true }
}
