'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, CheckCircle2, Trophy, Clock } from 'lucide-react'

function getAccessToken() {
  return document.cookie.split('; ').find(r => r.startsWith('sb-access-token='))?.split('=')[1]
}

export default function PrediccionesPage() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) { setLoading(false); return }
    const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
    s.auth.getUser(token).then(({ data }) => {
      if (data.user) {
        s.from('predictions')
          .select('*, match:matches(*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code))')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .then(({ data: p }) => { setPredictions(p ?? []); setLoading(false) })
      }
    })
  }, [])

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Cargando...</div>

  const total = predictions.length
  const correct = predictions.filter(p => p.points_earned > 0).length
  const exact = predictions.filter(p => p.is_exact_score).length
  const pending = predictions.filter(p => p.points_earned === 0 && p.match?.status !== 'finished').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-red/10"><Target className="h-5 w-5 text-brand-red" /></div>
        <div><h1 className="text-2xl font-bold">Mis Predicciones</h1><p className="text-sm text-muted-foreground">Tus pronósticos y puntos</p></div>
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
              <Card key={p.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{p.match?.home_team?.flag_emoji}</span>
                    <span className="text-sm font-medium">{p.match?.home_team?.name_es}</span>
                    <span className="text-sm font-bold tabular-nums">{p.predicted_home_score} - {p.predicted_away_score}</span>
                    <span className="text-sm font-medium">{p.match?.away_team?.name_es}</span>
                    <span>{p.match?.away_team?.flag_emoji}</span>
                  </div>
                  <div>
                    {isFinished && p.points_earned > 0 && <Badge className="bg-emerald-100 text-emerald-800 text-xs">+{p.points_earned} {p.is_exact_score ? 'exacto' : ''}</Badge>}
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
