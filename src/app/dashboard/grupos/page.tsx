'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Trophy, Users } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { buildGroupStandings } from '@/lib/group-standings'
import type { Match, Team } from '@/types'

const groups = ['A','B','C','D','E','F','G','H','I','J','K','L'] as const

export default function GruposPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
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

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Cargando grupos...</div>

  const totalTeams = teams.length

  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Grupos</h1>
              <p className="text-sm text-muted-foreground">
                {totalTeams > 0 ? '48 selecciones · 12 grupos · Copa Mundial FIFA 2026' : 'Sin equipos cargados'}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit shrink-0 text-xs">{totalTeams}/48 cargados</Badge>
        </div>
      </div>

      {totalTeams === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-muted-foreground">No hay equipos cargados</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Ejecutá el seed desde el panel de admin.</p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {groups.map((g) => {
            const groupTeams = teams.filter((t) => t.group_name === g) as Team[]
            const groupMatches = matches.filter((m) => m.group_name === g) as Match[]
            const standings = buildGroupStandings(groupTeams, groupMatches)
            return (
              <Card key={g} className="overflow-hidden border shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/30 px-4 py-3">
                  <CardTitle className="text-base font-semibold">Grupo {g}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{standings.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/20 text-[10px] uppercase text-muted-foreground">
                        <tr>
                          <th className="w-8 px-2 py-2 text-left">#</th>
                          <th className="min-w-32 px-2 py-2 text-left">País</th>
                          <th className="px-1 py-2 text-center">PJ</th>
                          <th className="hidden px-1 py-2 text-center sm:table-cell">PG</th>
                          <th className="hidden px-1 py-2 text-center sm:table-cell">PE</th>
                          <th className="hidden px-1 py-2 text-center sm:table-cell">PP</th>
                          <th className="hidden px-1 py-2 text-center md:table-cell">GF</th>
                          <th className="hidden px-1 py-2 text-center md:table-cell">GC</th>
                          <th className="px-1 py-2 text-center">DG</th>
                          <th className="px-2 py-2 text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {standings.map((standing, index) => {
                          const team = standing.team
                          const qualifies = index < 2
                          return (
                            <tr key={team.id} className={qualifies ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : undefined}>
                              <td className="px-2 py-2 align-middle">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold tabular-nums">{index + 1}</span>
                                  {qualifies && <ShieldCheck className="h-3 w-3 text-emerald-600" />}
                                </div>
                              </td>
                              <td className="px-2 py-2 align-middle">
                                <div className="flex min-w-0 items-center gap-2">
                                  <TeamFlag code={team.flag_emoji} label={team.name_es} className="h-4 w-6 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold">{team.name_es}</p>
                                    <p className="text-[10px] uppercase text-muted-foreground">{team.code}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-1 py-2 text-center text-xs tabular-nums">{standing.played}</td>
                              <td className="hidden px-1 py-2 text-center text-xs tabular-nums sm:table-cell">{standing.won}</td>
                              <td className="hidden px-1 py-2 text-center text-xs tabular-nums sm:table-cell">{standing.drawn}</td>
                              <td className="hidden px-1 py-2 text-center text-xs tabular-nums sm:table-cell">{standing.lost}</td>
                              <td className="hidden px-1 py-2 text-center text-xs tabular-nums md:table-cell">{standing.goalsFor}</td>
                              <td className="hidden px-1 py-2 text-center text-xs tabular-nums md:table-cell">{standing.goalsAgainst}</td>
                              <td className="px-1 py-2 text-center text-xs tabular-nums">{standing.goalDifference}</td>
                              <td className="px-2 py-2 text-center text-sm font-extrabold tabular-nums">{standing.points}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="border-t bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Top 2</span> clasifica a la siguiente fase.
                  </div>
                  {standings.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">Grupo sin equipos cargados.</div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
