'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Crown, Medal, Shield, Target, Trophy, Users, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'
import { ActivityFeed } from '@/components/activity-feed'

const quickLinks = [
  { href: '/dashboard/grupos', title: 'Grupos', description: 'Ver las 48 selecciones', icon: Users },
  { href: '/dashboard/fixture', title: 'Fixture', description: 'Predecir partidos', icon: CalendarDays },
  { href: '/dashboard/predicciones', title: 'Mis predicciones', description: 'Revisar tus picks', icon: Target },
  { href: '/dashboard/tabla', title: 'Tabla', description: 'Ranking de jugadores', icon: Medal },
]

export default function DashboardPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [leaders, setLeaders] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createAnonClient()

    Promise.all([
      supabase.from('teams').select('id, name_es, code, flag_emoji, group_name').order('group_name').order('name_es'),
      supabase
        .from('matches')
        .select('id, match_date, group_name, status, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)')
        .eq('stage', 'group')
        .order('match_date', { ascending: true }),
      supabase.from('leaderboard').select('id, username, total_points, position').order('position').limit(5),
    ]).then(([teamsResult, matchesResult, leadersResult]) => {
      setTeams(teamsResult.data ?? [])
      setMatches(matchesResult.data ?? [])
      setLeaders(leadersResult.data ?? [])
      setLoading(false)
    })

    const token = getAccessToken()
    if (token) {
      const authClient = createAuthedClient(token)
      getCurrentUserId(token).then((userId) => {
        if (!userId) return
        authClient.from('profiles').select('role').eq('id', userId).single().then(({ data: profile }) => {
          setIsAdmin(profile?.role === 'admin')
        })
      })
    }
  }, [])

  const groupCount = useMemo(() => new Set(teams.map((team) => team.group_name)).size, [teams])
  const nextMatches = matches.filter((match) => match.status !== 'finished').slice(0, 4)
  const featuredTeams = teams.slice(0, 10)

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando dashboard...</div>

  return (
    <div className="space-y-5 sm:space-y-7">
      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 sm:p-7 lg:p-8">
            <Badge className="mb-4 bg-brand-red text-white hover:bg-brand-red">Copa Mundial FIFA 2026</Badge>
            <h1 className="max-w-2xl font-bebas text-4xl tracking-wide sm:text-5xl lg:text-6xl">
              Tu centro de predicciones del Mundial
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Revisa grupos, completa tus pronósticos y sigue la tabla de posiciones desde un solo lugar.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link href="/dashboard/fixture" className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-red px-4 text-sm font-medium text-white transition-colors hover:bg-red-700">
                Ir al fixture <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/dashboard/grupos" className="inline-flex h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted">
                Ver grupos
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {featuredTeams.map((team) => (
                <div key={team.id} className="flex items-center gap-2 rounded-full border bg-background px-2.5 py-1.5 text-xs shadow-sm">
                  <TeamFlag code={team.flag_emoji} label={team.name_es} className="h-4 w-6" />
                  <span className="font-semibold">{team.code}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t bg-muted/30 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Equipos', value: teams.length },
                { label: 'Grupos', value: groupCount },
                { label: 'Partidos', value: matches.length },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border bg-card p-3 text-center shadow-sm">
                  <div className="text-2xl font-extrabold tabular-nums">{item.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border bg-card p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Próximos partidos</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Hora Perú</span>
                  <Link href="/dashboard/fixture" className="text-xs font-medium text-brand-red hover:underline">Ver todos</Link>
                </div>
              </div>
              <div className="space-y-3">
                {nextMatches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Todavía no hay fixture cargado.</p>
                ) : (
                  nextMatches.map((match) => (
                    <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                      <div className="flex min-w-0 items-center justify-end gap-2">
                        <span className="truncate font-medium">{match.home_team?.code}</span>
                        <TeamFlag code={match.home_team?.flag_emoji} label={match.home_team?.name_es} />
                      </div>
                      <div className="text-center text-[11px] text-muted-foreground">
                        {formatPeruShortDateTime(match.match_date)}
                      </div>
                      <div className="flex min-w-0 items-center gap-2">
                        <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} />
                        <span className="truncate font-medium">{match.away_team?.code}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[...quickLinks, ...(isAdmin ? [{ href: '/admin', title: 'Admin', description: 'Gestionar torneo', icon: Shield }] : [])].map((item) => (
          <Link key={item.href} href={item.href} className="group rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand-red" />
            </div>
          </Link>
        ))}
      </section>

      {/* Pronósticos callout */}
      <Link href="/dashboard/pronosticos" className="group block overflow-hidden rounded-2xl border bg-gradient-to-r from-brand-gold/10 to-brand-red/10 p-4 shadow-sm transition hover:shadow-md sm:p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gold text-white shadow-sm">
            <Crown className="h-7 w-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pronósticos del Mundial</p>
            <p className="mt-1 text-sm font-semibold">Predecí grupos, campeón, Bota de Oro y más →</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand-red" />
        </div>
      </Link>

      {/* Activity feed */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-brand-red" />
          <h2 className="text-sm font-semibold">Actividad reciente</h2>
        </div>
        <ActivityFeed />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-brand-red" />
              Grupos destacados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from(new Set(teams.map((t) => t.group_name))).slice(0, 3).map((group) => {
                const groupTeams = teams.filter((team) => team.group_name === group)
                return (
                  <div key={group} className="rounded-xl border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold">Grupo {group}</h3>
                      <Badge variant="secondary">{groupTeams.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {groupTeams.map((team) => (
                        <div key={team.id} className="flex items-center gap-2 text-sm">
                          <TeamFlag code={team.flag_emoji} label={team.name_es} />
                          <span className="min-w-0 flex-1 truncate font-medium">{team.name_es}</span>
                          <span className="font-mono text-xs text-muted-foreground">{team.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Medal className="h-4 w-4 text-brand-red" />
              Tabla rápida
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay jugadores en la tabla.</p>
            ) : (
              <div className="space-y-2">
                {leaders.map((leader) => (
                  <div key={leader.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold">{leader.position}</span>
                      <span className="text-sm font-semibold">{leader.username}</span>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{leader.total_points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
