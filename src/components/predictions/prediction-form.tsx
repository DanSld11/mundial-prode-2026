'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { savePredictionAction } from '@/app/dashboard/actions'
import { toast } from 'sonner'

interface PredictionFormProps {
  matchId: string
  homeTeamName: string
  awayTeamName: string
  existingPrediction?: {
    predicted_home_score: number
    predicted_away_score: number
  }
  isLocked: boolean
}

export function PredictionForm({ matchId, homeTeamName, awayTeamName, existingPrediction, isLocked }: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.predicted_home_score?.toString() || '')
  const [awayScore, setAwayScore] = useState(existingPrediction?.predicted_away_score?.toString() || '')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isLocked) return

    setLoading(true)
    const formData = new FormData()
    formData.append('match_id', matchId)
    formData.append('home_score', homeScore)
    formData.append('away_score', awayScore)

    const result = await savePredictionAction(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Predicción guardada')
    }
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
          <Input
            type="number"
            min={0}
            max={20}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-16 text-center h-8"
            required
          />
        </div>
        <span className="text-sm text-muted-foreground">-</span>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground mb-1">{awayTeamName}</span>
          <Input
            type="number"
            min={0}
            max={20}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-16 text-center h-8"
            required
          />
        </div>
        <Button type="submit" size="sm" disabled={loading} className="ml-2 h-8">
          {loading ? '...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
