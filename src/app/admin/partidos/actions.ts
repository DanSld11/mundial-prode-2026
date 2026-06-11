'use server'

import { createServiceRoleClient } from '@/lib/server-client'

export async function getAdminPartidosData() {
  const db = createServiceRoleClient()

  const [matchesRes, playersRes, scorersRes] = await Promise.all([
    db.from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(id,name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(id,name_es,flag_emoji,code)')
      .order('match_date', { ascending: true }),
    db.from('players')
      .select('id, name, shirt_number, position, team_id, team:teams(id,name_es,code,flag_emoji)')
      .eq('active', true)
      .order('shirt_number', { ascending: true, nullsFirst: false })
      .order('name')
      .limit(5000),
    db.from('match_goal_scorers')
      .select('match_id, player_id'),
  ])

  return {
    matches: matchesRes.data ?? [],
    players: playersRes.data ?? [],
    scorers: scorersRes.data ?? [],
  }
}
