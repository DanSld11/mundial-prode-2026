'use server'

import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

// Fechas aproximadas WC 2026 (hora Lima UTC-5)
const KNOCKOUT_TEMPLATE = [
  // Round of 32 — 16 partidos
  { match_number: 73,  stage: 'round_of_32', match_date: '2026-07-04T13:00:00-05:00', label: 'R32-A' },
  { match_number: 74,  stage: 'round_of_32', match_date: '2026-07-04T16:00:00-05:00', label: 'R32-B' },
  { match_number: 75,  stage: 'round_of_32', match_date: '2026-07-04T19:00:00-05:00', label: 'R32-C' },
  { match_number: 76,  stage: 'round_of_32', match_date: '2026-07-04T22:00:00-05:00', label: 'R32-D' },
  { match_number: 77,  stage: 'round_of_32', match_date: '2026-07-05T13:00:00-05:00', label: 'R32-E' },
  { match_number: 78,  stage: 'round_of_32', match_date: '2026-07-05T16:00:00-05:00', label: 'R32-F' },
  { match_number: 79,  stage: 'round_of_32', match_date: '2026-07-05T19:00:00-05:00', label: 'R32-G' },
  { match_number: 80,  stage: 'round_of_32', match_date: '2026-07-05T22:00:00-05:00', label: 'R32-H' },
  { match_number: 81,  stage: 'round_of_32', match_date: '2026-07-06T13:00:00-05:00', label: 'R32-I' },
  { match_number: 82,  stage: 'round_of_32', match_date: '2026-07-06T16:00:00-05:00', label: 'R32-J' },
  { match_number: 83,  stage: 'round_of_32', match_date: '2026-07-06T19:00:00-05:00', label: 'R32-K' },
  { match_number: 84,  stage: 'round_of_32', match_date: '2026-07-06T22:00:00-05:00', label: 'R32-L' },
  { match_number: 85,  stage: 'round_of_32', match_date: '2026-07-07T13:00:00-05:00', label: 'R32-M' },
  { match_number: 86,  stage: 'round_of_32', match_date: '2026-07-07T16:00:00-05:00', label: 'R32-N' },
  { match_number: 87,  stage: 'round_of_32', match_date: '2026-07-07T19:00:00-05:00', label: 'R32-O' },
  { match_number: 88,  stage: 'round_of_32', match_date: '2026-07-07T22:00:00-05:00', label: 'R32-P' },
  // Round of 16 — 8 partidos
  { match_number: 89,  stage: 'round_of_16', match_date: '2026-07-11T13:00:00-05:00', label: 'R16-1' },
  { match_number: 90,  stage: 'round_of_16', match_date: '2026-07-11T19:00:00-05:00', label: 'R16-2' },
  { match_number: 91,  stage: 'round_of_16', match_date: '2026-07-12T13:00:00-05:00', label: 'R16-3' },
  { match_number: 92,  stage: 'round_of_16', match_date: '2026-07-12T19:00:00-05:00', label: 'R16-4' },
  { match_number: 93,  stage: 'round_of_16', match_date: '2026-07-13T13:00:00-05:00', label: 'R16-5' },
  { match_number: 94,  stage: 'round_of_16', match_date: '2026-07-13T19:00:00-05:00', label: 'R16-6' },
  { match_number: 95,  stage: 'round_of_16', match_date: '2026-07-14T13:00:00-05:00', label: 'R16-7' },
  { match_number: 96,  stage: 'round_of_16', match_date: '2026-07-14T19:00:00-05:00', label: 'R16-8' },
  // Cuartos de Final — 4 partidos
  { match_number: 97,  stage: 'quarterfinal', match_date: '2026-07-18T13:00:00-05:00', label: 'QF-1' },
  { match_number: 98,  stage: 'quarterfinal', match_date: '2026-07-18T19:00:00-05:00', label: 'QF-2' },
  { match_number: 99,  stage: 'quarterfinal', match_date: '2026-07-19T13:00:00-05:00', label: 'QF-3' },
  { match_number: 100, stage: 'quarterfinal', match_date: '2026-07-19T19:00:00-05:00', label: 'QF-4' },
  // Semifinales — 2 partidos
  { match_number: 101, stage: 'semifinal',    match_date: '2026-07-22T19:00:00-05:00', label: 'SF-1' },
  { match_number: 102, stage: 'semifinal',    match_date: '2026-07-23T19:00:00-05:00', label: 'SF-2' },
  // Tercer Puesto
  { match_number: 103, stage: 'third_place',  match_date: '2026-07-25T13:00:00-05:00', label: '3PL' },
  // Gran Final
  { match_number: 104, stage: 'final',        match_date: '2026-07-26T14:00:00-05:00', label: 'FINAL' },
]

export async function getAdminBracketData() {
  const db = createServiceRoleClient()

  const [matchesRes, teamsRes] = await Promise.all([
    db.from('matches')
      .select(`
        id, match_number, stage, match_date, status, predictions_locked,
        home_score, away_score, stadium,
        home_team_id, away_team_id,
        home_team:teams!matches_home_team_id_fkey(id, name_es, code, flag_emoji),
        away_team:teams!matches_away_team_id_fkey(id, name_es, code, flag_emoji)
      `)
      .in('stage', ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'])
      .order('match_number'),
    db.from('teams').select('id, name_es, code, flag_emoji').order('name_es'),
  ])

  return {
    matches: matchesRes.data ?? [],
    teams: teamsRes.data ?? [],
  }
}

export async function createKnockoutStructure() {
  const db = createServiceRoleClient()

  // Verificar cuáles match_numbers ya existen
  const { data: existing } = await db.from('matches')
    .select('match_number')
    .in('match_number', KNOCKOUT_TEMPLATE.map((t) => t.match_number))

  const existingNumbers = new Set((existing ?? []).map((m: any) => m.match_number))
  const toInsert = KNOCKOUT_TEMPLATE.filter((t) => !existingNumbers.has(t.match_number))

  if (toInsert.length === 0) return { success: true, created: 0 }

  const { error } = await db.from('matches').insert(
    toInsert.map(({ label: _label, ...t }) => ({
      ...t,
      status: 'scheduled',
      predictions_locked: false,
      home_score: null,
      away_score: null,
      home_team_id: null,
      away_team_id: null,
    })),
  )

  if (error) return { error: error.message }

  revalidatePath('/admin/bracket')
  revalidatePath('/dashboard/bracket')
  return { success: true, created: toInsert.length }
}

export async function updateKnockoutMatch(
  matchId: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
  matchDate: string,
  stadium: string,
) {
  const db = createServiceRoleClient()

  const { error } = await db.from('matches').update({
    home_team_id: homeTeamId || null,
    away_team_id: awayTeamId || null,
    match_date: matchDate,
    stadium: stadium || null,
    updated_at: new Date().toISOString(),
  }).eq('id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/admin/bracket')
  revalidatePath('/dashboard/bracket')
  return { success: true }
}

export async function lockKnockoutStage(stage: string, locked: boolean) {
  const db = createServiceRoleClient()

  const { error } = await db.from('matches')
    .update({ predictions_locked: locked })
    .eq('stage', stage)

  if (error) return { error: error.message }

  revalidatePath('/admin/bracket')
  revalidatePath('/dashboard/bracket')
  return { success: true }
}
