'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Goal, MapPin, Shield, Trophy, Zap } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { createAnonClient } from '@/lib/auth-client'
import { formatPeruLongDateTime } from '@/lib/peru-time'

interface TournamentStats {
  totalMatches: number
  finishedMatches: number
  totalGoals: number
  avgGoals: number
  highestScoringMatch: any
  topScorers: { name: string; goals: number; team_name: string; flag: string }[]
  teamGoals: { name_es: string; flag_emoji: string; goals: number }[]
  groupStandings: Record<string, any[]>
}

export default function EstadisticasPage() {
  const [stats, setStats] = useState<TournamentStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createAnonClient()

    async function loadStats() {
      const [matchesRes, matchGoalsRes] = await Promise.all([
        supabase
          .from('matches')
          .select('id, status, home_score, away_score, match_date, city, group_name, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)')
          .eq('stage', 'group')
          .order('match_date'),
        supabase
          .from('match_scorers')
          .select('player:players(name, team:teams(name_es, flag_emoji))')
          .limit(500),
      ])

      const matches = matchesRes.data ?? []
      const matchGoals = matchGoalsRes.data ?? []

      const finished = matches.filter((m: any) => m.status === 'finished')
      const totalGoals = finished.reduce((sum: number, m: any) => sum + (m.home_score ?? 0) + (m.away_score ?? 0), 0)
      const avgGoals = finished.length > 0 ? totalGoals / finished.length : 0

      // Highest scoring match
      const highestScoringMatch = finished.reduce((best: any, m: any) => {
        const goals = (m.home_score ?? 0) + (m.away_score ?? 0)
        return !best || goals > (best.home_score + best.away_score) ? m : best
      }, null)

      // Top scorers from match_scorers
      const scorerCount: Record<string, { name: string; goals: number; team_name: string; flag: string }> = {}
      for (const mg of matchGoals) {
        const player = (mg as any).player
        if (!player) continue
        const key = player.name
        if (!scorerCount[key]) {
          scorerCount[key] = { name: player.name, goals: 0, team_name: player.team?.name_es ?? '', flag: player.team?.flag_emoji ?? '' }
        }
        scorerCount[key].goals++
      }
      const topScorers = Object.values(scorerCount).sort((a, b) => b.goals - a.goals).slice(0, 10)

      // Goals per team
      const teamGoalsMap: Record<string, { name_es: string; flag_emoji: string; goals: number }> = {}
      for (const m of finished) {
        const homeTeam = (m as any).home_team
        const awayTeam = (m as any).away_team
        if (homeTeam) {
          if (!teamGoalsMap[homeTeam.name_es]) teamGoalsMap[homeTeam.name_es] = { name_es: homeTeam.name_es, flag_emoji: homeTeam.flag_emoji, goals: 0 }
          teamGoalsMap[homeTeam.name_es].goals += m.home_score ?? 0
        }
        if (awayTeam) {
          if (!teamGoalsMap[awayTeam.name_es]) teamGoalsMap[awayTeam.name_es] = { name_es: awayTeam.name_es, flag_emoji: awayTeam.flag_emoji, goals: 0 }
          teamGoalsMap[awayTeam.name_es].goals += m.away_score ?? 0
        }
      }
      const teamGoals = Object.values(teamGoalsMap).sort((a, b) => b.goals - a.goals).slice(0, 10)

      // Group standings (W/D/L/GF/GA/Pts)
      const groupStandings: Record<string, Record<string, { name_es: string; flag_emoji: string; code: string; p: number; w: number; d: number; l: number; gf: number; ga: number; pts: number }>> = {}
      for (const m of finished) {
        const grp = m.group_name
        if (!groupStandings[grp]) groupStandings[grp] = {}
        const homeTeam = (m as any).home_team
        const awayTeam = (m as any).away_team
        if (!homeTeam || !awayTeam) continue
        const hs = m.home_score ?? 0
        const as_ = m.away_score ?? 0

        if (!groupStandings[grp][homeTeam.name_es]) groupStandings[grp][homeTeam.name_es] = { ...homeTeam, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }
        if (!groupStandings[grp][awayTeam.name_es]) groupStandings[grp][awayTeam.name_es] = { ...awayTeam, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }

        groupStandings[grp][homeTeam.name_es].p++
        groupStandings[grp][awayTeam.name_es].p++
        groupStandings[grp][homeTeam.name_es].gf += hs
        groupStandings[grp][homeTeam.name_es].ga += as_
        groupStandings[grp][awayTeam.name_es].gf += as_
        groupStandings[grp][awayTeam.name_es].ga += hs

        if (hs > as_) {
          groupStandings[grp][homeTeam.name_es].w++; groupStandings[grp][homeTeam.name_es].pts += 3
          groupStandings[grp][awayTeam.name_es].l++
        } else if (hs < as_) {
          groupStandings[grp][awayTeam.name_es].w++; groupStandings[grp][awayTeam.name_es].pts += 3
          groupStandings[grp][homeTeam.name_es].l++
        } else {
          groupStandings[grp][homeTeam.name_es].d++; groupStandings[grp][homeTeam.name_es].pts++
          groupStandings[grp][awayTeam.name_es].d++; groupStandings[grp][awayTeam.name_es].pts++
        }
      }

      // Sort each group by pts, then gd
      const sortedGroups: Record<string, any[]> = {}
      for (const [g, teams] of Object.entries(groupStandings)) {
        sortedGroups[g] = Object.values(teams).sort((a, b) => {
          if (b.pts !== a.pts) return b.pts - a.pts
          return (b.gf - b.ga) - (a.gf - a.ga)
        })
      }

      setStats({
        totalMatches: matches.length,
        finishedMatches: finished.length,
        totalGoals,
        avgGoals,
        highestScoringMatch,
        topScorers,
        teamGoals,
        groupStandings: sortedGroups,
      })
      setLoading(false)
    }

    loadStats()
  }, [])

  if (loading) return (
    <div className="space-y-5">
      <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />)}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )

  if (!stats) return null

  const hasData = stats.finishedMatches > 0

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Estadísticas del Torneo</h1>
            <p className="text-sm text-muted-foreground">Fase de grupos · Datos en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Partidos jugados', value: `${stats.finishedMatches}/${stats.totalMatches}`, icon: Shield },
          { label: 'Goles totales', value: stats.totalGoals, icon: Goal },
          { label: 'Prom. goles/partido', value: stats.avgGoals.toFixed(1), icon: Zap },
          { label: 'Máx. goles/partido', value: stats.highestScoringMatch ? (stats.highestScoringMatch.home_score + stats.highestScoringMatch.away_score) : '—', icon: Trophy },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-extrabold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasData ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">Aún no hay partidos jugados</p>
          <p className="mt-1 text-sm text-muted-foreground/60">Las estadísticas aparecerán cuando el torneo comience.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Top scorers */}
          {stats.topScorers.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Goal className="h-4 w-4 text-brand-red" />
                  Tabla de goleadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topScorers.map((scorer, i) => (
                    <div key={scorer.name} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                      <span className="w-5 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
                      <TeamFlag code={scorer.flag} label={scorer.team_name} />
                      <span className="flex-1 truncate text-sm font-semibold">{scorer.name}</span>
                      <span className="text-xs text-muted-foreground">{scorer.team_name}</span>
                      <Badge variant="secondary" className="tabular-nums">{scorer.goals}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team goals */}
          {stats.teamGoals.length > 0 && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-brand-red" />
                  Goles por selección (top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.teamGoals.map((team, i) => {
                    const maxGoals = stats.teamGoals[0]?.goals ?? 1
                    const pct = Math.round((team.goals / maxGoals) * 100)
                    return (
                      <div key={team.name_es} className="flex items-center gap-2 text-sm">
                        <span className="w-5 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
                        <TeamFlag code={team.flag_emoji} label={team.name_es} />
                        <span className="w-20 sm:w-28 shrink-0 truncate font-medium">{team.name_es}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                          <div className="h-2 rounded-full bg-brand-red transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 shrink-0 text-right font-bold tabular-nums">{team.goals}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Highest scoring match */}
          {stats.highestScoringMatch && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-brand-red" />
                  Partido más goleador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
                      <TeamFlag code={stats.highestScoringMatch.home_team?.flag_emoji} label={stats.highestScoringMatch.home_team?.name_es} className="h-6 w-9" />
                      <span className="text-sm font-semibold truncate w-full text-center">{stats.highestScoringMatch.home_team?.name_es}</span>
                    </div>
                    <div className="rounded-xl bg-secondary px-4 py-2 text-xl font-extrabold tabular-nums">
                      {stats.highestScoringMatch.home_score} - {stats.highestScoringMatch.away_score}
                    </div>
                    <div className="flex min-w-0 flex-col items-center gap-1 text-center">
                      <TeamFlag code={stats.highestScoringMatch.away_team?.flag_emoji} label={stats.highestScoringMatch.away_team?.name_es} className="h-6 w-9" />
                      <span className="text-sm font-semibold truncate w-full text-center">{stats.highestScoringMatch.away_team?.name_es}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />{stats.highestScoringMatch.city}
                    <span>·</span>
                    <span>Grupo {stats.highestScoringMatch.group_name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Group standings */}
          {Object.keys(stats.groupStandings).length > 0 && (
            <Card className="shadow-sm lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4 text-brand-red" />
                  Clasificación por grupos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(stats.groupStandings)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([group, teams]) => (
                    <div key={group} className="rounded-xl border overflow-hidden">
                      <div className="bg-muted/40 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Grupo {group}
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th className="px-2 py-1.5 text-left font-medium">Equipo</th>
                            <th className="px-1 py-1.5 text-center font-medium">PJ</th>
                            <th className="px-1 py-1.5 text-center font-medium">G</th>
                            <th className="px-1 py-1.5 text-center font-medium">E</th>
                            <th className="px-1 py-1.5 text-center font-medium">P</th>
                            <th className="px-1 py-1.5 text-center font-medium">GD</th>
                            <th className="px-2 py-1.5 text-center font-bold text-foreground">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teams.map((team, idx) => (
                            <tr key={team.name_es} className={`border-b last:border-0 ${idx < 2 ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''}`}>
                              <td className="flex items-center gap-1.5 px-2 py-1.5">
                                {idx < 2 && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
                                <TeamFlag code={team.flag_emoji} label={team.name_es} />
                                <span className="truncate font-medium">{team.code || team.name_es}</span>
                              </td>
                              <td className="px-1 py-1.5 text-center tabular-nums text-muted-foreground">{team.p}</td>
                              <td className="px-1 py-1.5 text-center tabular-nums text-muted-foreground">{team.w}</td>
                              <td className="px-1 py-1.5 text-center tabular-nums text-muted-foreground">{team.d}</td>
                              <td className="px-1 py-1.5 text-center tabular-nums text-muted-foreground">{team.l}</td>
                              <td className="px-1 py-1.5 text-center tabular-nums text-muted-foreground">{team.gf - team.ga > 0 ? '+' : ''}{team.gf - team.ga}</td>
                              <td className="px-2 py-1.5 text-center font-bold tabular-nums">{team.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
