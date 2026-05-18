import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { PredictionForm } from '@/components/predictions/prediction-form'
import type { Match, Team, Prediction } from '@/types'

interface MatchWithTeams extends Omit<Match, 'home_team' | 'away_team'> {
  home_team: Pick<Team, 'name_es' | 'flag_emoji' | 'code'> | null
  away_team: Pick<Team, 'name_es' | 'flag_emoji' | 'code'> | null
}

export default async function FixturePage() {
  const supabase = await createServerSupabaseClient()

  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(name_es, flag_emoji, code),
      away_team:teams!matches_away_team_id_fkey(name_es, flag_emoji, code)
    `)
    .eq('stage', 'group')
    .order('match_date', { ascending: true })

  const matches = (matchesData ?? []) as unknown as MatchWithTeams[]

  // Obtener predicciones del usuario
  const { data: { user } } = await supabase.auth.getUser()
  let predictions: Prediction[] = []
  if (user) {
    const { data: predData } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
    predictions = (predData ?? []) as unknown as Prediction[]
  }

  const predictionsMap = new Map(predictions.map((p) => [p.match_id, p]))

  // Agrupar por fecha
  const matchesByDate: Record<string, MatchWithTeams[]> = {}
  matches.forEach((match) => {
    const dateKey = format(new Date(match.match_date), 'yyyy-MM-dd')
    if (!matchesByDate[dateKey]) matchesByDate[dateKey] = []
    matchesByDate[dateKey].push(match)
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

      {Object.entries(matchesByDate).length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold">No hay partidos cargados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            El administrador debe cargar el fixture desde el panel de admin.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(matchesByDate).map(([dateKey, dayMatches]) => (
          <div key={dateKey}>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-red" />
              {format(new Date(dateKey + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {dayMatches.map((match) => {
                const pred = predictionsMap.get(match.id)
                const isLocked = match.predictions_locked || new Date(match.match_date) < new Date()

                return (
                  <Card key={match.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline">Grupo {match.group_name}</Badge>
                        <span className="text-xs text-muted-foreground">
                          #{match.match_number}
                        </span>
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
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(new Date(match.match_date), 'HH:mm')}
                          </div>
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
                        existingPrediction={pred ? {
                          predicted_home_score: pred.predicted_home_score,
                          predicted_away_score: pred.predicted_away_score,
                        } : undefined}
                        isLocked={isLocked}
                      />
                      {pred && pred.points_earned > 0 && (
                        <div className="mt-2 text-center">
                          <Badge variant="default" className="bg-green-600">
                            +{pred.points_earned} pts {pred.is_exact_score ? '(exacto)' : ''}
                          </Badge>
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {match.venue}, {match.city}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
