'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, AlertCircle, CheckCircle2, Goal, Medal, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruLongDateTime } from '@/lib/peru-time'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'

export default function MatchPredictionPage() {
  const params = useParams<{ matchId: string }>()
  const matchId = params.matchId
  const [match, setMatch] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [prediction, setPrediction] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [outcome, setOutcome] = useState('')
  const [scorerId, setScorerId] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const supabase = useMemo(() => createAnonClient(), [])

  useEffect(() => {
    async function load() {
      const { data: matchData } = await supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(id,name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(id,name_es,flag_emoji,code)')
        .eq('id', matchId)
        .single()

      setMatch(matchData)

      const teamIds = [matchData?.home_team_id, matchData?.away_team_id].filter(Boolean)
      if (teamIds.length) {
        const { data: playersData } = await supabase
          .from('players')
          .select('*, team:teams(id,name_es,code,flag_emoji)')
          .in('team_id', teamIds)
          .eq('active', true)
          .order('team_id')
          .order('name')
        setPlayers(playersData ?? [])
      }

      const token = getAccessToken()
      if (token) {
        setAccessToken(token)
        const authedSupabase = createAuthedClient(token)
        const userId = await getCurrentUserId(token)
        if (userId) {
          setUserId(userId)
          const { data: predictionData } = await authedSupabase
            .from('predictions')
            .select('*')
            .eq('user_id', userId)
            .eq('match_id', matchId)
            .single()
          if (predictionData) {
            setPrediction(predictionData)
            setOutcome(predictionData.predicted_outcome ?? '')
            setScorerId(predictionData.predicted_scorer_id ?? '')
            setHomeScore(predictionData.predicted_home_score?.toString() ?? '')
            setAwayScore(predictionData.predicted_away_score?.toString() ?? '')
          }
        }
      }

      setLoading(false)
    }

    load()
  }, [matchId, supabase])

  const isLocked = !!match && (match.predictions_locked || new Date(match.match_date) < new Date())
  const isFinished = match?.status === 'finished'
  const homePlayers = players.filter((player) => player.team_id === match?.home_team_id)
  const awayPlayers = players.filter((player) => player.team_id === match?.away_team_id)

  async function savePrediction() {
    setErrorMessage('')
    setSuccessMessage('')

    if (!accessToken) {
      setErrorMessage('No se pudo identificar tu sesión. Vuelve a iniciar sesión e inténtalo otra vez.')
      return
    }

    if (!userId || !match) {
      setErrorMessage('No se pudo cargar tu usuario o el partido.')
      return
    }

    if (isLocked) {
      setErrorMessage('Las predicciones para este encuentro ya están cerradas.')
      return
    }

    setSaving(true)

    const nextPrediction = {
      user_id: userId,
      match_id: matchId,
      predicted_outcome: outcome || null,
      predicted_winner_id:
        outcome === 'home' ? match.home_team_id :
        outcome === 'away' ? match.away_team_id :
        null,
      predicted_scorer_id: scorerId || null,
      predicted_home_score: homeScore === '' ? null : parseInt(homeScore),
      predicted_away_score: awayScore === '' ? null : parseInt(awayScore),
    }

    const authedSupabase = createAuthedClient(accessToken)
    const { data, error } = await authedSupabase
      .from('predictions')
      .upsert(nextPrediction, { onConflict: 'user_id, match_id' })
      .select()
      .single()

    if (error) {
      setErrorMessage(error.message)
    } else if (data) {
      setPrediction(data)
      setSuccessMessage('Predicción guardada correctamente.')
    }
    setSaving(false)
  }

  function pointsBadge(points: number | undefined) {
    if (!isFinished) return null
    return <Badge variant={points ? 'default' : 'secondary'}>{points ?? 0} pts</Badge>
  }

  function statusBadge(saved: boolean, points: number | undefined) {
    if (!saved) return <span className="text-xs text-muted-foreground">Pendiente</span>
    if (!isFinished) return <span className="text-xs text-muted-foreground">Guardado</span>
    return points
      ? <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Acertada</Badge>
      : <Badge variant="secondary">Fallida</Badge>
  }

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando encuentro...</div>
  if (!match) return <div className="py-20 text-center text-sm text-muted-foreground">Partido no encontrado.</div>

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/dashboard/fixture" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Volver al fixture
      </Link>

      <section className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">Grupo {match.group_name}</Badge>
          <span className="text-sm text-muted-foreground">
            {formatPeruLongDateTime(match.match_date)} · Hora Perú
          </span>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:justify-end sm:text-right">
            <span className="truncate text-lg font-bold">{match.home_team?.name_es}</span>
            <TeamFlag code={match.home_team?.flag_emoji} label={match.home_team?.name_es} className="h-7 w-10" />
          </div>
          <div className="rounded-xl bg-secondary px-3 py-2 text-sm font-bold">
            {isFinished ? `${match.home_score} - ${match.away_score}` : 'vs'}
          </div>
          <div className="flex min-w-0 flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} className="h-7 w-10" />
            <span className="truncate text-lg font-bold">{match.away_team?.name_es}</span>
          </div>
        </div>
        {isLocked && <p className="mt-4 text-center text-sm text-muted-foreground">Las predicciones para este encuentro están cerradas.</p>}
      </section>

      {(errorMessage || successMessage) && (
        <div className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${
          errorMessage ? 'border-destructive/20 bg-destructive/10 text-destructive' : 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300'
        }`}>
          {errorMessage ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
          <span>{errorMessage || successMessage}</span>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4 text-brand-red" />
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              {[
                { value: 'home', label: `Gana ${match.home_team?.name_es}` },
                { value: 'draw', label: 'Empate' },
                { value: 'away', label: `Gana ${match.away_team?.name_es}` },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setOutcome(option.value)}
                  className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                    outcome === option.value ? 'border-brand-red bg-brand-red/10 text-brand-red' : 'bg-background hover:bg-muted'
                  } disabled:opacity-60`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2">
              {statusBadge(!!prediction?.predicted_outcome, prediction?.outcome_points)}
              {pointsBadge(prediction?.outcome_points)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Goal className="h-4 w-4 text-brand-red" />
              Jugador que anota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <select
              value={scorerId}
              disabled={isLocked}
              onChange={(event) => setScorerId(event.target.value)}
              className="h-10 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option value="">Seleccionar jugador...</option>
              <optgroup label={match.home_team?.name_es ?? 'Local'}>
                {homePlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.shirt_number ? `${player.shirt_number} · ` : ''}{player.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label={match.away_team?.name_es ?? 'Visitante'}>
                {awayPlayers.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.shirt_number ? `${player.shirt_number} · ` : ''}{player.name}
                  </option>
                ))}
              </optgroup>
            </select>
            {players.length === 0 && <p className="text-xs text-muted-foreground">El admin aún no cargó jugadores para estos equipos.</p>}
            <div className="flex items-center justify-between gap-2">
              {statusBadge(!!prediction?.predicted_scorer_id, prediction?.scorer_points)}
              {pointsBadge(prediction?.scorer_points)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Medal className="h-4 w-4 text-brand-red" />
              Marcador exacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <Input disabled={isLocked} type="number" min={0} max={20} value={homeScore} onChange={(event) => setHomeScore(event.target.value)} className="h-10 text-center" />
              <span className="text-muted-foreground">-</span>
              <Input disabled={isLocked} type="number" min={0} max={20} value={awayScore} onChange={(event) => setAwayScore(event.target.value)} className="h-10 text-center" />
            </div>
            <div className="flex items-center justify-between gap-2">
              {statusBadge(prediction?.predicted_home_score !== null && prediction?.predicted_home_score !== undefined, prediction?.exact_score_points)}
              {pointsBadge(prediction?.exact_score_points)}
            </div>
          </CardContent>
        </Card>
      </div>

      {!isLocked && (
        <Button
          disabled={saving || (!outcome && !scorerId && homeScore === '' && awayScore === '')}
          onClick={savePrediction}
          className="w-full bg-brand-red text-white hover:bg-red-700 h-11 text-base font-semibold"
        >
          {saving ? 'Guardando predicción...' : 'Guardar predicción'}
        </Button>
      )}
    </div>
  )
}
