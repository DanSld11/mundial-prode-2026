'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

function getAccessToken() {
  return document.cookie.split('; ').find(r => r.startsWith('sb-access-token='))?.split('=')[1]
}

interface PredictionFormProps {
  matchId: string
  homeTeamName: string
  awayTeamName: string
  existingPrediction?: { predicted_home_score: number; predicted_away_score: number }
  isLocked: boolean
}

export function PredictionForm({ matchId, homeTeamName, awayTeamName, existingPrediction, isLocked }: PredictionFormProps) {
  const [show, setShow] = useState(false)
  const [homeScore, setHomeScore] = useState(existingPrediction?.predicted_home_score?.toString() || '')
  const [awayScore, setAwayScore] = useState(existingPrediction?.predicted_away_score?.toString() || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLocked) return

    const token = getAccessToken()
    if (!token) { toast.error('No autenticado'); return }

    setLoading(true)
    try {
      const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { autoRefreshToken: false, persistSession: false } })
      const { data: { user } } = await s.auth.getUser(token)
      if (!user) { toast.error('No autenticado'); setLoading(false); return }

      const { data: match } = await s.from('matches').select('predictions_locked, home_team_id, away_team_id').eq('id', matchId).single()
      if (!match || match.predictions_locked) { toast.error('Predicciones cerradas'); setLoading(false); return }

      let predictedWinnerId = null
      const hs = parseInt(homeScore)
      const as = parseInt(awayScore)
      if (hs > as) predictedWinnerId = match.home_team_id
      else if (as > hs) predictedWinnerId = match.away_team_id

      const { error } = await s.from('predictions').upsert({
        user_id: user.id, match_id: matchId,
        predicted_home_score: hs, predicted_away_score: as,
        predicted_winner_id: predictedWinnerId,
      }, { onConflict: 'user_id, match_id' })

      if (error) toast.error(error.message)
      else { toast.success('Predicción guardada'); setTimeout(() => window.location.reload(), 600) }
    } catch (err: any) { toast.error(err.message) }
    setLoading(false)
  }

  if (isLocked) {
    return existingPrediction ? (
      <p className="text-xs text-muted-foreground text-center">
        Predijiste <span className="font-semibold text-foreground">{existingPrediction.predicted_home_score}-{existingPrediction.predicted_away_score}</span>
      </p>
    ) : <p className="text-xs text-muted-foreground text-center">Cerrado</p>
  }

  if (!show && existingPrediction) {
    return (
      <div className="text-center">
        <span className="text-xs font-semibold">{existingPrediction.predicted_home_score} - {existingPrediction.predicted_away_score}</span>
        <button onClick={() => setShow(true)} className="ml-2 text-xs text-brand-red hover:underline">Editar</button>
      </div>
    )
  }

  if (!show && !existingPrediction) {
    return (
      <div className="text-center">
        <Button variant="ghost" size="sm" className="h-7 text-xs text-brand-red" onClick={() => setShow(true)}>
          Predecir
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 justify-center">
      <Input type="number" min={0} max={20} value={homeScore} onChange={e => setHomeScore(e.target.value)} className="w-12 h-7 text-center text-xs p-0" required />
      <span className="text-xs text-muted-foreground">-</span>
      <Input type="number" min={0} max={20} value={awayScore} onChange={e => setAwayScore(e.target.value)} className="w-12 h-7 text-center text-xs p-0" required />
      <Button type="submit" size="sm" disabled={loading} className="h-7 text-xs">{loading ? '...' : 'OK'}</Button>
    </form>
  )
}
