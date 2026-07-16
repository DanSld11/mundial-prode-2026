'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  let token = cookieStore.get('sb-access-token')?.value
  if (!token) {
    const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(/\/\/(.+?)\.supabase/)?.[1]
    if (projectRef) {
      const key = `sb-${projectRef}-auth-token`
      const raw = cookieStore.get(key)?.value ?? cookieStore.get(`${key}.0`)?.value
      if (raw) {
        try { const s = JSON.parse(decodeURIComponent(raw)); if (s?.access_token) token = s.access_token } catch {}
      }
    }
  }
  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  return user?.id ?? null
}

export async function getResumenData() {
  const uid = await getAuthUserId()
  if (!uid) return null

  const db = createServiceRoleClient()

  const [profileRes, allProfilesRes, predsRes, groupRes, bracketRes, spinsRes, adjRes] = await Promise.all([
    db.from('profiles').select('id, username, total_points, avatar_url').eq('id', uid).single(),
    db.from('profiles').select('id, username, total_points').order('total_points', { ascending: false }).limit(200),
    db.from('predictions')
      .select(`
        points_earned, outcome_points, exact_score_points, scorer_points, is_exact_score, predicted_outcome,
        match:matches(
          status, home_score, away_score, stage,
          home_team:teams!matches_home_team_id_fkey(name_es, code, flag_emoji),
          away_team:teams!matches_away_team_id_fkey(name_es, code, flag_emoji)
        )
      `)
      .eq('user_id', uid).limit(2000),
    db.from('group_predictions').select('points_earned').eq('user_id', uid),
    db.from('bracket_predictions').select('points_earned').eq('user_id', uid),
    db.from('ruleta_spins').select('points_change').eq('user_id', uid),
    db.from('user_notifications').select('points_change').eq('user_id', uid).eq('type', 'point_adjustment'),
  ])

  const profile = profileRes.data
  if (!profile) return null

  const allProfiles = (allProfilesRes.data ?? []).filter((p) => (p.total_points ?? 0) > 0 || p.id === uid)
  const position = allProfiles.findIndex((p) => p.id === uid) + 1
  const totalPlayers = allProfiles.length
  const podio = allProfiles.slice(0, 3).map((p, i) => ({ pos: i + 1, username: p.username, pts: p.total_points ?? 0 }))

  // Solo predicciones de partidos ya jugados
  const preds = (predsRes.data ?? []).filter((p: any) => p.match?.status === 'finished')

  const totalPreds = preds.length
  const aciertos = preds.filter((p: any) => (p.outcome_points ?? 0) > 0).length
  const exactos = preds.filter((p: any) => p.is_exact_score).length
  const goleadores = preds.filter((p: any) => (p.scorer_points ?? 0) > 0).length
  const pctAciertos = totalPreds > 0 ? Math.round((aciertos / totalPreds) * 100) : 0

  // Mejor partido (más puntos en uno solo)
  let best: any = null
  for (const p of preds) {
    if (!best || (p.points_earned ?? 0) > (best.points_earned ?? 0)) best = p
  }
  const bestMatch = best && (best.points_earned ?? 0) > 0 ? {
    home: best.match?.home_team?.code ?? '?',
    homeFlag: best.match?.home_team?.flag_emoji ?? '',
    away: best.match?.away_team?.code ?? '?',
    awayFlag: best.match?.away_team?.flag_emoji ?? '',
    score: `${best.match?.home_score}–${best.match?.away_score}`,
    pts: best.points_earned,
  } : null

  // Equipo más apostado (a ganador)
  const teamCounts = new Map<string, { name: string; flag: string; count: number }>()
  for (const p of preds as any[]) {
    const team = p.predicted_outcome === 'home' ? p.match?.home_team : p.predicted_outcome === 'away' ? p.match?.away_team : null
    if (!team) continue
    const cur = teamCounts.get(team.code) ?? { name: team.name_es, flag: team.flag_emoji, count: 0 }
    cur.count++
    teamCounts.set(team.code, cur)
  }
  let favTeam: { name: string; flag: string; count: number } | null = null
  for (const t of teamCounts.values()) if (!favTeam || t.count > favTeam.count) favTeam = t

  const sum = (rows: any[] | null, col: string) => (rows ?? []).reduce((s, r) => s + (r[col] ?? 0), 0)

  return {
    username: profile.username,
    totalPoints: profile.total_points ?? 0,
    position,
    totalPlayers,
    podio,
    totalPreds,
    aciertos,
    pctAciertos,
    exactos,
    goleadores,
    bestMatch,
    favTeam,
    breakdown: {
      partidos: sum(preds as any[], 'points_earned'),
      grupos: sum(groupRes.data as any[], 'points_earned'),
      llaves: sum(bracketRes.data as any[], 'points_earned'),
      ruleta: sum(spinsRes.data as any[], 'points_change'),
      ajustes: sum(adjRes.data as any[], 'points_change'),
    },
  }
}
