'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PredictionForm } from '@/components/predictions/prediction-form'

function getAccessToken() {
  return document.cookie.split('; ').find(r => r.startsWith('sb-access-token='))?.split('=')[1]
}

export default function FixturePage() {
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function load() {
      const { data: m } = await supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(name_es, flag_emoji, code), away_team:teams!matches_away_team_id_fkey(name_es, flag_emoji, code)')
        .eq('stage', 'group')
        .order('match_date', { ascending: true })

      setMatches(m ?? [])
      setLoading(false)
    }

    async function loadPredictions() {
      const token = getAccessToken()
      if (!token) return

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )

      const { data: { user } } = await supabase.auth.getUser(token)
      if (!user) return

      const { data: p } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)

      setPredictions(p ?? [])
    }

    load()
    loadPredictions()
  }, [])

  if (loading) return <div className="text-center py-10 text-muted-foreground">Cargando fixture...</div>

  const predictionsMap = new Map(predictions.map((p: any) => [p.match_id, p]))
  const matchesByDate: Record<string, any[]> = {}
  matches.forEach((match: any) => {
    const d = format(new Date(match.match_date), 'yyyy-MM-dd')
    if (!matchesByDate[d]) matchesByDate[d] = []
    matchesByDate[d].push(match)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-brand-red" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fixture</h1>
          <p className="text-muted-foreground">Hacé tus predicciones para cada partido.</p>
        </div>
      </div>
      {matches.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold">No hay partidos cargados</h3>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(matchesByDate).map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-red" />
                {format(new Date(dateKey + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {dayMatches.map((match: any) => {
                  const pred = predictionsMap.get(match.id)
                  const isLocked = match.predictions_locked || new Date(match.match_date) < new Date()
                  return (
                    <Card key={match.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">Grupo {match.group_name}</Badge>
                          <span className="text-xs text-muted-foreground">#{match.match_number}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-center">
                            <div className="text-2xl mb-1">{match.home_team?.flag_emoji}</div>
                            <div className="font-semibold text-sm">{match.home_team?.name_es}</div>
                            <div className="text-xs text-muted-foreground">{match.home_team?.code}</div>
                          </div>
                          <div className="text-center px-4">
                            <div className="text-2xl font-bold text-brand-red">
                              {match.home_score ?? '-'} : {match.away_score ?? '-'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{format(new Date(match.match_date), 'HH:mm')}</div>
                          </div>
                          <div className="flex-1 text-center">
                            <div className="text-2xl mb-1">{match.away_team?.flag_emoji}</div>
                            <div className="font-semibold text-sm">{match.away_team?.name_es}</div>
                            <div className="text-xs text-muted-foreground">{match.away_team?.code}</div>
                          </div>
                        </div>
                        <PredictionForm
                          matchId={match.id}
                          homeTeamName={match.home_team?.name_es || 'Local'}
                          awayTeamName={match.away_team?.name_es || 'Visitante'}
                          existingPrediction={pred ? { predicted_home_score: pred.predicted_home_score, predicted_away_score: pred.predicted_away_score } : undefined}
                          isLocked={isLocked}
                        />
                        {pred && pred.points_earned > 0 && (
                          <div className="mt-2 text-center">
                            <Badge className="bg-green-600">+{pred.points_earned} pts {pred.is_exact_score ? '(exacto)' : ''}</Badge>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{match.venue}, {match.city}
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
