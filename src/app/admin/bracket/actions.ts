'use server'

import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'
import { scoreMatchAction } from '@/app/admin/actions'

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
  // Round of 16 — 8 partidos (calendario oficial FIFA, hora Lima UTC-5)
  { match_number: 89,  stage: 'round_of_16', match_date: '2026-07-04T16:00:00-05:00', label: 'R16-1' },
  { match_number: 90,  stage: 'round_of_16', match_date: '2026-07-04T12:00:00-05:00', label: 'R16-2' },
  { match_number: 91,  stage: 'round_of_16', match_date: '2026-07-05T15:00:00-05:00', label: 'R16-3' },
  { match_number: 92,  stage: 'round_of_16', match_date: '2026-07-05T19:00:00-05:00', label: 'R16-4' },
  { match_number: 93,  stage: 'round_of_16', match_date: '2026-07-06T14:00:00-05:00', label: 'R16-5' },
  { match_number: 94,  stage: 'round_of_16', match_date: '2026-07-06T19:00:00-05:00', label: 'R16-6' },
  { match_number: 95,  stage: 'round_of_16', match_date: '2026-07-07T11:00:00-05:00', label: 'R16-7' },
  { match_number: 96,  stage: 'round_of_16', match_date: '2026-07-07T15:00:00-05:00', label: 'R16-8' },
  // Cuartos de Final — 4 partidos
  { match_number: 97,  stage: 'quarterfinal', match_date: '2026-07-09T15:00:00-05:00', label: 'QF-1' },
  { match_number: 98,  stage: 'quarterfinal', match_date: '2026-07-10T14:00:00-05:00', label: 'QF-2' },
  { match_number: 99,  stage: 'quarterfinal', match_date: '2026-07-11T16:00:00-05:00', label: 'QF-3' },
  { match_number: 100, stage: 'quarterfinal', match_date: '2026-07-11T20:00:00-05:00', label: 'QF-4' },
  // Semifinales — 2 partidos
  { match_number: 101, stage: 'semifinal',    match_date: '2026-07-14T14:00:00-05:00', label: 'SF-1' },
  { match_number: 102, stage: 'semifinal',    match_date: '2026-07-15T14:00:00-05:00', label: 'SF-2' },
  // Tercer Puesto
  { match_number: 103, stage: 'third_place',  match_date: '2026-07-18T16:00:00-05:00', label: '3PL' },
  // Gran Final
  { match_number: 104, stage: 'final',        match_date: '2026-07-19T14:00:00-05:00', label: 'FINAL' },
]

export async function getAdminBracketData() {
  const db = createServiceRoleClient()

  const [matchesRes, teamsRes] = await Promise.all([
    db.from('matches')
      .select(`
        id, match_number, stage, match_date, status, predictions_locked,
        home_score, away_score, venue,
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

// ── Bracket advancement map ────────────────────────────────────────────
// Defines which match number the winner of each match advances to, and as which side
const WINNER_ADVANCES: Record<number, { next: number; side: 'home_team_id' | 'away_team_id' }> = {
  // R32 → R16 (según llave oficial WC 2026)
  73:  { next: 89,  side: 'home_team_id' }, // RSA vs CAN → R16-1
  76:  { next: 89,  side: 'away_team_id' }, // NED vs MAR → R16-1
  75:  { next: 90,  side: 'home_team_id' }, // GER vs PAR → R16-2
  78:  { next: 90,  side: 'away_team_id' }, // FRA vs SWE → R16-2
  81:  { next: 91,  side: 'home_team_id' }, // BEL vs SEN → R16-3
  82:  { next: 91,  side: 'away_team_id' }, // USA vs BIH → R16-3
  83:  { next: 92,  side: 'home_team_id' }, // ESP vs AUT → R16-4
  84:  { next: 92,  side: 'away_team_id' }, // POR vs CRO → R16-4
  74:  { next: 93,  side: 'home_team_id' }, // BRA vs JPN → R16-5
  77:  { next: 93,  side: 'away_team_id' }, // CIV vs NOR → R16-5
  79:  { next: 94,  side: 'home_team_id' }, // MEX vs ECU → R16-6
  80:  { next: 94,  side: 'away_team_id' }, // ENG vs COD → R16-6
  85:  { next: 95,  side: 'home_team_id' }, // SUI vs ALG → R16-7
  88:  { next: 95,  side: 'away_team_id' }, // COL vs GHA → R16-7
  86:  { next: 96,  side: 'home_team_id' }, // AUS vs EGY → R16-8
  87:  { next: 96,  side: 'away_team_id' }, // ARG vs CPV → R16-8
  89:  { next: 97,  side: 'home_team_id' },
  90:  { next: 97,  side: 'away_team_id' },
  91:  { next: 98,  side: 'home_team_id' },
  92:  { next: 98,  side: 'away_team_id' },
  93:  { next: 99,  side: 'home_team_id' },
  94:  { next: 99,  side: 'away_team_id' },
  95:  { next: 100, side: 'home_team_id' },
  96:  { next: 100, side: 'away_team_id' },
  97:  { next: 101, side: 'home_team_id' },
  98:  { next: 101, side: 'away_team_id' },
  99:  { next: 102, side: 'home_team_id' },
  100: { next: 102, side: 'away_team_id' },
  101: { next: 104, side: 'home_team_id' },
  102: { next: 104, side: 'away_team_id' },
}

// SF losers go to 3rd place match
const LOSER_ADVANCES: Record<number, { next: number; side: 'home_team_id' | 'away_team_id' }> = {
  101: { next: 103, side: 'home_team_id' },
  102: { next: 103, side: 'away_team_id' },
}

export async function saveMatchResult(
  matchId: string,
  matchNumber: number,
  homeScore: number,
  awayScore: number,
  overrideWinnerId: string | null,
) {
  const db = createServiceRoleClient()

  // 1) Read current teams
  const { data: match, error: fetchErr } = await db
    .from('matches')
    .select('home_team_id, away_team_id')
    .eq('id', matchId)
    .single()

  if (fetchErr || !match) return { error: 'Partido no encontrado' }

  // 2) Determine winner
  let winnerId: string | null = null
  if (homeScore > awayScore)       winnerId = match.home_team_id
  else if (awayScore > homeScore)  winnerId = match.away_team_id
  else                             winnerId = overrideWinnerId  // draw → admin picks

  // 3) Save score, winner and mark as finished
  const { error: updateErr } = await db.from('matches').update({
    home_score: homeScore,
    away_score: awayScore,
    winner_team_id: winnerId,
    is_draw: homeScore === awayScore,
    status: 'finished',
    predictions_locked: true,
  }).eq('id', matchId)

  if (updateErr) return { error: updateErr.message }

  // 4) Calculate points for all predictions on this match
  await scoreMatchAction(matchId, homeScore, awayScore)

  // 5) Advance winner to next round
  const winAdv = WINNER_ADVANCES[matchNumber]
  if (winAdv && winnerId) {
    const { data: nextMatch } = await db.from('matches')
      .select('id').eq('match_number', winAdv.next).single()
    if (nextMatch) {
      await db.from('matches').update({ [winAdv.side]: winnerId }).eq('id', nextMatch.id)
    }
  }

  // 6) Advance loser of SF to 3rd place
  const loserAdv = LOSER_ADVANCES[matchNumber]
  if (loserAdv && winnerId) {
    const loserId = winnerId === match.home_team_id ? match.away_team_id : match.home_team_id
    const { data: thirdMatch } = await db.from('matches')
      .select('id').eq('match_number', loserAdv.next).single()
    if (thirdMatch && loserId) {
      await db.from('matches').update({ [loserAdv.side]: loserId }).eq('id', thirdMatch.id)
    }
  }

  revalidatePath('/admin/bracket')
  revalidatePath('/admin/partidos')
  revalidatePath('/dashboard/bracket')
  revalidatePath('/dashboard/tabla')
  revalidatePath('/dashboard')
  return { success: true }
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
    venue: stadium || null,
    updated_at: new Date().toISOString(),
  }).eq('id', matchId)

  if (error) return { error: error.message }

  revalidatePath('/admin/bracket')
  revalidatePath('/dashboard/bracket')
  return { success: true }
}

/**
 * Auto-seed Round of 32 from group results.
 * Pairing: each group winner vs runner-up from adjacent group (cross-group).
 * Matches 85-88 reserved for best 3rd-place teams (assigned manually).
 *
 * FIFA 2026 pairings (match_number → home_group_pos × away_group_pos):
 *  73: 1A vs 2B  |  79: 1G vs 2H
 *  74: 1B vs 2A  |  80: 1H vs 2G
 *  75: 1C vs 2D  |  81: 1I vs 2J
 *  76: 1D vs 2C  |  82: 1J vs 2I
 *  77: 1E vs 2F  |  83: 1K vs 2L
 *  78: 1F vs 2E  |  84: 1L vs 2K
 *  85-88: 3rd-place slots (set manually in admin)
 */
const R32_SEEDING: { match_number: number; home: [string, number]; away: [string, number] }[] = [
  { match_number: 73, home: ['A', 1], away: ['B', 2] },
  { match_number: 74, home: ['B', 1], away: ['A', 2] },
  { match_number: 75, home: ['C', 1], away: ['D', 2] },
  { match_number: 76, home: ['D', 1], away: ['C', 2] },
  { match_number: 77, home: ['E', 1], away: ['F', 2] },
  { match_number: 78, home: ['F', 1], away: ['E', 2] },
  { match_number: 79, home: ['G', 1], away: ['H', 2] },
  { match_number: 80, home: ['H', 1], away: ['G', 2] },
  { match_number: 81, home: ['I', 1], away: ['J', 2] },
  { match_number: 82, home: ['J', 1], away: ['I', 2] },
  { match_number: 83, home: ['K', 1], away: ['L', 2] },
  { match_number: 84, home: ['L', 1], away: ['K', 2] },
]

export async function autoSeedR32Action() {
  const db = createServiceRoleClient()

  // Read all group_results (positions 1 and 2)
  const { data: groupResults, error: grErr } = await db.from('group_results')
    .select('group_name, position, team_id')
    .in('position', [1, 2])

  if (grErr) return { error: grErr.message }
  if (!groupResults || groupResults.length === 0)
    return { error: 'No hay resultados de grupos cargados aún.' }

  // Build lookup: group_name + position → team_id
  const lookup = new Map<string, string>()
  for (const r of groupResults) {
    lookup.set(`${r.group_name}:${r.position}`, r.team_id)
  }

  // Get existing R32 matches to obtain their IDs
  const matchNumbers = R32_SEEDING.map((s) => s.match_number)
  const { data: r32Matches, error: matchErr } = await db.from('matches')
    .select('id, match_number')
    .in('match_number', matchNumbers)

  if (matchErr) return { error: matchErr.message }
  if (!r32Matches || r32Matches.length === 0)
    return { error: 'Los partidos de Ronda de 32 no existen. Creá la estructura primero.' }

  const matchById = new Map(r32Matches.map((m: any) => [m.match_number, m.id]))

  let seeded = 0
  let skipped = 0
  const errors: string[] = []

  for (const slot of R32_SEEDING) {
    const matchId = matchById.get(slot.match_number)
    if (!matchId) { skipped++; continue }

    const homeTeamId = lookup.get(`${slot.home[0]}:${slot.home[1]}`)
    const awayTeamId = lookup.get(`${slot.away[0]}:${slot.away[1]}`)

    if (!homeTeamId || !awayTeamId) {
      skipped++
      continue
    }

    const { error } = await db.from('matches')
      .update({ home_team_id: homeTeamId, away_team_id: awayTeamId })
      .eq('id', matchId)

    if (error) errors.push(`Partido ${slot.match_number}: ${error.message}`)
    else seeded++
  }

  revalidatePath('/admin/bracket')
  revalidatePath('/dashboard/bracket')

  return { success: true, seeded, skipped, errors }
}

export async function propagateWinnersAction() {
  const db = createServiceRoleClient()

  const { data: finished } = await db.from('matches')
    .select('id, match_number, home_team_id, away_team_id, home_score, away_score, winner_team_id')
    .eq('status', 'finished')
    .in('stage', ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal'])

  if (!finished || finished.length === 0) return { success: true, propagated: 0 }

  let propagated = 0

  for (const match of finished) {
    const winnerId = match.winner_team_id
    if (!winnerId) continue

    const winAdv = WINNER_ADVANCES[match.match_number]
    if (winAdv) {
      const { data: nextMatch } = await db.from('matches')
        .select('id').eq('match_number', winAdv.next).single()
      if (nextMatch) {
        await db.from('matches').update({ [winAdv.side]: winnerId }).eq('id', nextMatch.id)
        propagated++
      }
    }

    const loserAdv = LOSER_ADVANCES[match.match_number]
    if (loserAdv && winnerId) {
      const loserId = winnerId === match.home_team_id ? match.away_team_id : match.home_team_id
      const { data: thirdMatch } = await db.from('matches')
        .select('id').eq('match_number', loserAdv.next).single()
      if (thirdMatch && loserId) {
        await db.from('matches').update({ [loserAdv.side]: loserId }).eq('id', thirdMatch.id)
      }
    }
  }

  revalidatePath('/admin/bracket')
  revalidatePath('/dashboard/bracket')
  return { success: true, propagated }
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
