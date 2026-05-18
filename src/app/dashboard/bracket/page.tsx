import { createServerSupabaseClient } from '@/lib/supabase'
import BracketPageClient from './bracket-client'
import type { Team } from '@/types'

export default async function BracketPage() {
  const supabase = await createServerSupabaseClient()

  const { data: teamsData } = await supabase
    .from('teams')
    .select('id, name_es, flag_emoji, code')
    .order('name_es', { ascending: true })

  const { data: { user } } = await supabase.auth.getUser()

  let predictions: any[] = []
  if (user) {
    const { data: predData } = await supabase
      .from('bracket_predictions')
      .select(`
        stage,
        slot_key,
        team_id,
        team:teams(name_es, flag_emoji, code)
      `)
      .eq('user_id', user.id)

    predictions = predData ?? []
  }

  return (
    <BracketPageClient
      teams={(teamsData ?? []) as unknown as Team[]}
      predictions={predictions}
    />
  )
}
