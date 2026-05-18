import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Trophy, CheckCircle2, XCircle } from 'lucide-react'
import type { Match, Team, Prediction } from '@/types'

interface PredictionWithMatch extends Prediction {
  match: Match & {
    home_team: Pick<Team, 'name_es' | 'flag_emoji' | 'code'> | null
    away_team: Pick<Team, 'name_es' | 'flag_emoji' | 'code'> | null
  }
}

export default async function PrediccionesPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let predictions: PredictionWithMatch[] = []

  if (user) {
    const { data } = await supabase
      .from('predictions')
      .select(`
        *,
        match:matches(*, home_team:teams!matches_home_team_id_fkey(name_es, flag_emoji, code), away_team:teams!matches_away_team_id_fkey(name_es, flag_emoji, code))
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    predictions = (data ?? []) as unknown as PredictionWithMatch[]
  }

  const total = predictions.length
  const correct = predictions.filter((p) => p.points_earned > 0).length
  const exact = predictions.filter((p) => p.is_exact_score).length
  const pending = predictions.filter((p) => p.points_earned === 0 && !p.match.home_score).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-brand-red" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Predicciones</h1>
          <p className="text-muted-foreground">Revisá tus pronósticos y puntos ganados.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Target className="h-5 w-5 text-brand-red" />
            <div>
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{correct}</div>
              <div className="text-xs text-muted-foreground">Acertadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-brand-gold" />
            <div>
              <div className="text-2xl font-bold">{exact}</div>
              <div className="text-xs text-muted-foreground">Exactas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{pending}</div>
              <div className="text-xs text-muted-foreground">Pendientes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {predictions.length === 0 && (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Target className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-semibold">No tenés predicciones</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Andá al fixture y empezá a predecir los partidos.
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {predictions.map((pred) => {
          const isFinished = pred.match.home_score !== null && pred.match.away_score !== null
          const isPending = !isFinished
          const isCorrect = pred.points_earned > 0
          const isExact = pred.is_exact_score

          return (
            <Card key={pred.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center w-20">
                      <div className="text-lg">{pred.match.home_team?.flag_emoji}</div>
                      <div className="text-xs font-medium">{pred.match.home_team?.name_es}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        {pred.predicted_home_score} - {pred.predicted_away_score}
                      </div>
                      {isFinished && (
                        <div className="text-xs text-muted-foreground">
                          Resultado: {pred.match.home_score} - {pred.match.away_score}
                        </div>
                      )}
                    </div>
                    <div className="text-center w-20">
                      <div className="text-lg">{pred.match.away_team?.flag_emoji}</div>
                      <div className="text-xs font-medium">{pred.match.away_team?.name_es}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPending && (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                    {isCorrect && (
                      <Badge variant="default" className="bg-green-600">
                        +{pred.points_earned} pts
                      </Badge>
                    )}
                    {isExact && (
                      <Badge variant="default" className="bg-brand-gold text-black">
                        Exacto
                      </Badge>
                    )}
                    {isFinished && !isCorrect && (
                      <Badge variant="destructive">0 pts</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
