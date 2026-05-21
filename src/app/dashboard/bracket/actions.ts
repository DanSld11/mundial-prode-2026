'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import type { BracketPrediction } from '@/types'

export async function saveBracketPredictionAction(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autenticado' }
  }

  const stage = formData.get('stage') as string
  const slotKey = formData.get('slot_key') as string
  const teamId = formData.get('team_id') as string

  if (!stage || !slotKey) {
    return { error: 'Datos inválidos' }
  }

  const { error } = await supabase
    .from('bracket_predictions')
    .upsert({
      user_id: user.id,
      stage,
      slot_key: slotKey,
      team_id: teamId || null,
    }, { onConflict: 'user_id,stage,slot_key' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/bracket')
  return { success: true }
}

export async function getUserBracketPredictions() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('bracket_predictions')
    .select(`
      *,
      team:teams(name_es, flag_emoji, code)
    `)
    .eq('user_id', user.id)

  return (data ?? []) as unknown as BracketPrediction[]
}

export async function getBracketLeaderboard() {
  const supabase = await createServerSupabaseClient()

  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, total_points')
    .order('total_points', { ascending: false })
    .limit(20)

  return data ?? []
}
