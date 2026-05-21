'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, CheckCircle2, Trophy, Clock } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { getAccessToken, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'

export default function PrediccionesPage() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) { setLoading(false); return }
    const s = createAuthedClient(token)
    getCurrentUserId(token).then((userId) => {
      if (userId) {
        s.from('predictions')
          .select('*, predicted_scorer:players(name,shirt_number), match:matches(*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code))')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .then(({ data: p }) => { setPredictions(p ?? []); setLoading(false) })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Cargando...</div>

  const total = predictions.length
  const correct = predictions.filter(p => p.points_earned > 0).length
  const exact = predictions.filter(p => p.exact_score_points > 0 || p.is_exact_score).length
  const pending = predictions.filter(p => p.points_earned === 0 && p.match?.status !== 'finished').length

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-red text-white shadow-sm"><Target className="h-5 w-5" /></div>
          <div><h1 className="text-2xl font-bold">Mis Predicciones</h1><p className="text-sm text-muted-foreground">Tus pronósticos y puntos</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[{ label: 'Total', value: total, icon: Target },{ label: 'Acertadas', value: correct, icon: CheckCircle2 },{ label: 'Exactas', value: exact, icon: Trophy },{ label: 'Pendientes', value: pending, icon: Clock }].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.label === 'Acertadas' ? 'text-emerald-500' : s.label === 'Exactas' ? 'text-brand-gold' : 'text-muted-foreground'}`} />
              <div><div className="text-xl font-bold tabular-nums">{s.value}</div><div className="text-xs text-muted-foreground">{s.label}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {predictions.length === 0 ? (
        <Card className="p-12 text-center"><p className="text-muted-foreground">No tenés predicciones. Andá al fixture.</p></Card>
      ) : (
        <div className="space-y-2">
          {predictions.map(p => {
            const isFinished = p.match?.status === 'finished'
            return (
              <Card key={p.id} className="shadow-sm">
                <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <div className="flex min-w-0 items-center justify-end gap-2">
                      <span className="truncate text-right text-sm font-semibold">{p.match?.home_team?.name_es}</span>
                      <TeamFlag code={p.match?.home_team?.flag_emoji} label={p.match?.home_team?.name_es} className="shrink-0" />
                    </div>
                    <span className="rounded-md bg-secondary px-3 py-1 text-sm font-bold tabular-nums">
                      {p.predicted_home_score ?? '-'} - {p.predicted_away_score ?? '-'}
                    </span>
                    <div className="flex min-w-0 items-center gap-2">
                      <TeamFlag code={p.match?.away_team?.flag_emoji} label={p.match?.away_team?.name_es} className="shrink-0" />
                      <span className="truncate text-sm font-semibold">{p.match?.away_team?.name_es}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1 sm:justify-end">
                    {p.predicted_outcome && <Badge variant="outline" className="text-xs">Resultado: {p.predicted_outcome === 'home' ? 'Local' : p.predicted_outcome === 'away' ? 'Visitante' : 'Empate'}</Badge>}
                    {p.predicted_scorer && <Badge variant="outline" className="text-xs">Gol: {p.predicted_scorer.name}</Badge>}
                    {isFinished && p.points_earned > 0 && <Badge className="bg-emerald-100 text-emerald-800 text-xs">+{p.points_earned} pts</Badge>}
                    {isFinished && p.points_earned === 0 && <Badge variant="secondary" className="text-xs">0 pts</Badge>}
                    {!isFinished && <Badge variant="outline" className="text-xs">Pendiente</Badge>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
