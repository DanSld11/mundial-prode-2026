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
  const [homeScore, setHomeScore] = useState(existingPrediction?.predicted_home_score?.toString() || '')
  const [awayScore, setAwayScore] = useState(existingPrediction?.predicted_away_score?.toString() || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLocked) return

    const token = getAccessToken()
    if (!token) return

    setLoading(true)

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
      await supabase.auth.getUser(token)

      const { data: { user } } = await supabase.auth.getUser(token)
      if (!user) { toast.error('No autenticado'); setLoading(false); return }

      const matchRes = await supabase.from('matches').select('predictions_locked, home_team_id, away_team_id').eq('id', matchId).single()
      const match = matchRes.data
      if (!match || match.predictions_locked) { toast.error('Predicciones cerradas'); setLoading(false); return }

      let predictedWinnerId = null
      const hs = parseInt(homeScore)
      const as = parseInt(awayScore)
      if (hs > as) predictedWinnerId = match.home_team_id
      else if (as > hs) predictedWinnerId = match.away_team_id

      const { error } = await supabase.from('predictions').upsert({
        user_id: user.id,
        match_id: matchId,
        predicted_home_score: hs,
        predicted_away_score: as,
        predicted_winner_id: predictedWinnerId,
      }, { onConflict: 'user_id, match_id' })

      if (error) { toast.error(error.message) }
      else { toast.success('Predicción guardada'); setTimeout(() => window.location.reload(), 500) }
    } catch (err: any) {
      toast.error(err.message)
    }

    setLoading(false)
  }

  if (isLocked) {
    return (
      <div className="mt-3 text-center">
        {existingPrediction ? (
          <span className="text-sm font-medium text-green-600">
            Tu predicción: {existingPrediction.predicted_home_score} - {existingPrediction.predicted_away_score}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Predicciones cerradas</span>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex items-center gap-2 justify-center">
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-1">{homeTeamName}</span>
          <Input type="number" min={0} max={20} value={homeScore} onChange={(e) => setHomeScore(e.target.value)} className="w-16 text-center h-8" required />
        </div>
        <span className="text-sm text-muted-foreground">-</span>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-1">{awayTeamName}</span>
          <Input type="number" min={0} max={20} value={awayScore} onChange={(e) => setAwayScore(e.target.value)} className="w-16 text-center h-8" required />
        </div>
        <Button type="submit" size="sm" disabled={loading} className="ml-2 h-8">
          {loading ? '...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
