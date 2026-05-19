'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PredictionForm } from '@/components/predictions/prediction-form'

function FlagImg({ code, size }: { code: string; size?: number }) {
  const w = size || 40
  return <img src={`https://flagcdn.com/w${w}/${code}.png`} srcSet={`https://flagcdn.com/w${w*2}/${code}.png 2x`} alt="" className="w-6 h-auto rounded-xs border shadow-sm inline-block" loading="lazy" />
}

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
      const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/10">
          <CalendarDays className="h-5 w-5 text-brand-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fixture</h1>
          <p className="text-sm text-muted-foreground">Fase de grupos · 11–27 junio 2026</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-muted-foreground">No hay partidos cargados</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Ejecutá el seed desde el panel de admin.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(matchesByDate).map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 pl-1 uppercase tracking-wider">
                {format(new Date(dateKey + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
              </h2>
              <div className="grid gap-2">
                {dayMatches.map((match: any) => {
                  const pred = predictionsMap.get(match.id)
                  const isLocked = match.predictions_locked || new Date(match.match_date) < new Date()
                  const isFinished = match.status === 'finished'
                  const homeFlag = match.home_team?.flag_emoji
                  const awayFlag = match.away_team?.flag_emoji

                  return (
                    <Card key={match.id} className="border shadow-sm hover:shadow transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs shrink-0 w-12 justify-center font-mono">G{match.group_name}</Badge>
                          <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm font-medium text-right leading-tight">{match.home_team?.name_es}</span>
                              {homeFlag && <FlagImg code={homeFlag} />}
                            </div>
                            <div className="text-center px-3">
                              {isFinished ? (
                                <span className="text-lg font-bold tabular-nums">{match.home_score} - {match.away_score}</span>
                              ) : (
                                <span className="text-xs font-medium text-muted-foreground">
                                  {format(new Date(match.match_date), 'HH:mm')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {awayFlag && <FlagImg code={awayFlag} />}
                              <span className="text-sm font-medium text-left leading-tight">{match.away_team?.name_es}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <MapPin className="h-3 w-3" />{match.city}
                          </div>
                        </div>
                        <div className="mt-2">
                          <PredictionForm
                            matchId={match.id}
                            homeTeamName={match.home_team?.code || '?'}
                            awayTeamName={match.away_team?.code || '?'}
                            existingPrediction={pred ? { predicted_home_score: pred.predicted_home_score, predicted_away_score: pred.predicted_away_score } : undefined}
                            isLocked={isLocked}
                          />
                          {pred && pred.points_earned > 0 && (
                            <div className="mt-1 text-center">
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
