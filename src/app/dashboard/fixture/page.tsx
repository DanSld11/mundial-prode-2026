'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { TeamFlag } from '@/components/team-flag'

function getAccessToken() {
  return document.cookie.split('; ').find(r => r.startsWith('sb-access-token='))?.split('=')[1]
}

export default function FixturePage() {
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    supabase.from('matches')
      .select('*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)')
      .eq('stage', 'group')
      .order('match_date', { ascending: true })
      .then(({ data }) => { setMatches(data ?? []); setLoading(false) })

    const token = getAccessToken()
    if (token) {
      const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      })
      s.auth.getUser(token).then(({ data }) => {
        if (data.user) {
          s.from('predictions').select('*').eq('user_id', data.user.id).then(({ data: p }) => setPredictions(p ?? []))
        }
      })
    }
  }, [])

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Cargando fixture...</div>

  const predictionsMap = new Map(predictions.map((p: any) => [p.match_id, p]))
  const matchesByDate: Record<string, any[]> = {}
  matches.forEach((m: any) => {
    const d = format(new Date(m.match_date), 'yyyy-MM-dd')
    if (!matchesByDate[d]) matchesByDate[d] = []
    matchesByDate[d].push(m)
  })

  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Fixture</h1>
            <p className="text-sm text-muted-foreground">Fase de grupos oficial · 11-27 junio 2026</p>
          </div>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-muted-foreground">No hay partidos cargados</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Ejecutá el seed desde el panel de admin.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-6">
          {Object.entries(matchesByDate).map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              <h2 className="mb-2 pl-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {format(new Date(dateKey + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
              </h2>
              <div className="grid gap-3">
                {dayMatches.map((match: any) => {
                  const pred = predictionsMap.get(match.id)
                  const isLocked = match.predictions_locked || new Date(match.match_date) < new Date()
                  const isFinished = match.status === 'finished'
                  const homeFlag = match.home_team?.flag_emoji
                  const awayFlag = match.away_team?.flag_emoji

                  return (
                    <Card key={match.id} className="overflow-hidden border shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-center justify-between gap-2 sm:w-28 sm:justify-start">
                            <Badge variant="secondary" className="w-12 shrink-0 justify-center font-mono text-xs">G{match.group_name}</Badge>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {format(new Date(match.match_date), 'HH:mm')}
                            </span>
                          </div>
                          <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                            <div className="flex min-w-0 items-center justify-end gap-2">
                              <span className="truncate text-right text-sm font-semibold leading-tight">{match.home_team?.name_es}</span>
                              <TeamFlag code={homeFlag} label={match.home_team?.name_es} className="shrink-0" />
                            </div>
                            <div className="min-w-14 px-2 text-center sm:min-w-16 sm:px-3">
                              {isFinished ? (
                                <span className="text-lg font-bold tabular-nums">{match.home_score} - {match.away_score}</span>
                              ) : (
                                <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                                  {format(new Date(match.match_date), 'HH:mm')}
                                </span>
                              )}
                            </div>
                            <div className="flex min-w-0 items-center gap-2">
                              <TeamFlag code={awayFlag} label={match.away_team?.name_es} className="shrink-0" />
                              <span className="truncate text-left text-sm font-semibold leading-tight">{match.away_team?.name_es}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground sm:w-40 sm:shrink-0 sm:justify-start">
                            <MapPin className="h-3 w-3" />{match.city}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t pt-3 sm:flex-row">
                          <div className="text-xs text-muted-foreground">
                            {pred ? (
                              <span>
                                Predicción guardada
                                {pred.points_earned > 0 ? ` · +${pred.points_earned} pts` : ''}
                              </span>
                            ) : isLocked ? (
                              <span>Predicciones cerradas</span>
                            ) : (
                              <span>Resultado, goleador y marcador exacto</span>
                            )}
                          </div>
                          <Link
                            href={`/dashboard/fixture/${match.id}`}
                            className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
                              pred
                                ? 'border bg-background hover:bg-muted'
                                : 'bg-brand-red text-white hover:bg-red-700'
                            }`}
                          >
                            Entrar al encuentro
                          </Link>
                          {pred && pred.points_earned > 0 && (
                            <div className="sm:hidden">
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">+{pred.points_earned} pts{pred.is_exact_score ? ' exacto' : ''}</Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
