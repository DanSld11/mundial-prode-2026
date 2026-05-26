'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Trophy, Users } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { buildGroupStandings } from '@/lib/group-standings'
import { createAnonClient } from '@/lib/auth-client'
import type { Match, Team } from '@/types'

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const

export default function GruposPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createAnonClient()
    Promise.all([
      supabase.from('teams').select('*').order('group_name').order('name_es'),
      supabase
        .from('matches')
        .select('id, match_number, stage, group_name, home_team_id, away_team_id, home_score, away_score, status, match_date, predictions_locked')
        .eq('stage', 'group'),
    ]).then(([teamsResult, matchesResult]) => {
      setTeams(teamsResult.data ?? [])
      setMatches(matchesResult.data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="space-y-5">
      <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    </div>
  )

  const totalTeams = teams.length

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Grupos</h1>
              <p className="text-sm text-muted-foreground">
                {totalTeams > 0 ? '48 selecciones · 12 grupos · Copa Mundial FIFA 2026' : 'Sin equipos cargados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{totalTeams}/48 equipos</Badge>
            <Badge variant="secondary" className="text-xs">12 grupos</Badge>
          </div>
        </div>
      </div>

      {totalTeams === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-muted-foreground">No hay equipos cargados</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Ejecutá el seed desde el panel de admin.</p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const groupTeams = teams.filter((t) => t.group_name === g) as Team[]
            const groupMatches = matches.filter((m) => m.group_name === g) as Match[]
            const standings = buildGroupStandings(groupTeams, groupMatches)
            const playedMatches = groupMatches.filter(m => m.status === 'finished').length
            const totalGroupMatches = 6 // 4 teams × 3 games / 2

            return (
              <Card key={g} className="overflow-hidden border shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold">Grupo {g}</CardTitle>
                    <span className="text-[10px] text-muted-foreground">{playedMatches}/{totalGroupMatches} partidos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Top 2 clasifica</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/30 text-[10px] uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="w-6 px-2 py-2 text-center">#</th>
                          <th className="min-w-[100px] px-2 py-2 text-left">Selección</th>
                          <th className="w-7 px-1 py-2 text-center" title="Partidos jugados">PJ</th>
                          <th className="w-7 px-1 py-2 text-center hidden sm:table-cell" title="Ganados">PG</th>
                          <th className="w-7 px-1 py-2 text-center hidden sm:table-cell" title="Empatados">PE</th>
                          <th className="w-7 px-1 py-2 text-center hidden sm:table-cell" title="Perdidos">PP</th>
                          <th className="w-7 px-1 py-2 text-center hidden sm:table-cell" title="Goles a favor">GF</th>
                          <th className="w-7 px-1 py-2 text-center hidden sm:table-cell" title="Goles en contra">GC</th>
                          <th className="w-7 px-1 py-2 text-center" title="Diferencia de goles">DG</th>
                          <th className="w-8 px-2 py-2 text-center font-bold" title="Puntos">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {standings.map((standing, index) => {
                          const team = standing.team
                          const qualifies = index < 2
                          return (
                            <tr
                              key={team.id}
                              className={[
                                'transition-colors',
                                qualifies
                                  ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                                  : 'hover:bg-muted/20',
                              ].join(' ')}
                            >
                              <td className="px-2 py-2 text-center align-middle">
                                <span className={`text-xs font-bold tabular-nums ${qualifies ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                  {index + 1}
                                </span>
                              </td>
                              <td className="px-2 py-2 align-middle">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  <TeamFlag code={team.flag_emoji} label={team.name_es} className="h-3.5 w-5 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold leading-tight">{team.name_es}</p>
                                    <p className="text-[9px] uppercase text-muted-foreground leading-tight">{team.code}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-1 py-2 text-center tabular-nums">{standing.played}</td>
                              <td className="px-1 py-2 text-center tabular-nums text-emerald-700 dark:text-emerald-400 font-medium hidden sm:table-cell">{standing.won}</td>
                              <td className="px-1 py-2 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{standing.drawn}</td>
                              <td className="px-1 py-2 text-center tabular-nums text-red-600 dark:text-red-400 hidden sm:table-cell">{standing.lost}</td>
                              <td className="px-1 py-2 text-center tabular-nums hidden sm:table-cell">{standing.goalsFor}</td>
                              <td className="px-1 py-2 text-center tabular-nums text-muted-foreground hidden sm:table-cell">{standing.goalsAgainst}</td>
                              <td className={`px-1 py-2 text-center tabular-nums font-semibold ${
                                standing.goalDifference > 0 ? 'text-emerald-600 dark:text-emerald-400' :
                                standing.goalDifference < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                              }`}>
                                {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                              </td>
                              <td className="px-2 py-2 text-center">
                                <span className={`font-extrabold tabular-nums text-sm ${qualifies ? 'text-emerald-700 dark:text-emerald-300' : ''}`}>
                                  {standing.points}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                        {standings.length === 0 && (
                          <tr>
                            <td colSpan={10} className="px-4 py-6 text-center text-sm text-muted-foreground">
                              Sin equipos cargados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Legend */}
      {totalTeams > 0 && (
        <div className="mx-auto max-w-7xl rounded-xl border bg-card px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800" />
              <span>Clasifica a la siguiente fase</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span><strong>PJ</strong> Partidos</span>
              <span className="hidden sm:inline"><strong>PG</strong> Ganados</span>
              <span className="hidden sm:inline"><strong>PE</strong> Empatados</span>
              <span className="hidden sm:inline"><strong>PP</strong> Perdidos</span>
              <span className="hidden sm:inline"><strong>GF/GC</strong> Goles</span>
              <span><strong>DG</strong> Diferencia</span>
              <span><strong>Pts</strong> Puntos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
