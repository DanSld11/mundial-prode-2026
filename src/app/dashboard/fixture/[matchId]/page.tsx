'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, CheckCircle2, Goal, Medal, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TeamFlag } from '@/components/team-flag'

function getAccessToken() {
  return document.cookie.split('; ').find((row) => row.startsWith('sb-access-token='))?.split('=')[1]
}

export default function MatchPredictionPage() {
  const params = useParams<{ matchId: string }>()
  const matchId = params.matchId
  const [match, setMatch] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [prediction, setPrediction] = useState<any>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [outcome, setOutcome] = useState('')
  const [scorerId, setScorerId] = useState('')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')

  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ), [])

  function createAuthedClient(token: string) {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    )
  }

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
        const { data: userData } = await authedSupabase.auth.getUser(token)
        if (userData.user) {
          setUserId(userData.user.id)
          const { data: predictionData } = await authedSupabase
            .from('predictions')
            .select('*')
            .eq('user_id', userData.user.id)
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

  async function savePrediction(kind: 'outcome' | 'scorer' | 'score') {
    if (!userId || !match || isLocked) return

    setSaving(kind)

    const nextPrediction = {
      user_id: userId,
      match_id: matchId,
      predicted_outcome: prediction?.predicted_outcome ?? null,
      predicted_winner_id: prediction?.predicted_winner_id ?? null,
      predicted_scorer_id: prediction?.predicted_scorer_id ?? null,
      predicted_home_score: prediction?.predicted_home_score ?? null,
      predicted_away_score: prediction?.predicted_away_score ?? null,
    }

    if (kind === 'outcome') {
      nextPrediction.predicted_outcome = outcome || null
      nextPrediction.predicted_winner_id =
        outcome === 'home' ? match.home_team_id :
        outcome === 'away' ? match.away_team_id :
        null
    }

    if (kind === 'scorer') {
      nextPrediction.predicted_scorer_id = scorerId || null
    }

    if (kind === 'score') {
      nextPrediction.predicted_home_score = homeScore === '' ? null : parseInt(homeScore)
      nextPrediction.predicted_away_score = awayScore === '' ? null : parseInt(awayScore)
    }

    if (!accessToken) return

    const authedSupabase = createAuthedClient(accessToken)
    const { data, error } = await authedSupabase
      .from('predictions')
      .upsert(nextPrediction, { onConflict: 'user_id, match_id' })
      .select()
      .single()

    if (!error && data) setPrediction(data)
    setSaving(null)
  }

  function pointsBadge(points: number | undefined) {
    if (!isFinished) return null
    return <Badge variant={points ? 'default' : 'secondary'}>{points ?? 0} pts</Badge>
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
            {format(new Date(match.match_date), "EEEE d 'de' MMMM · HH:mm", { locale: es })}
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
              {prediction?.predicted_outcome && <span className="text-xs text-muted-foreground">Guardado</span>}
              {pointsBadge(prediction?.outcome_points)}
            </div>
            <Button disabled={isLocked || !outcome || saving === 'outcome'} onClick={() => savePrediction('outcome')} className="w-full bg-brand-red text-white hover:bg-red-700">
              {saving === 'outcome' ? 'Guardando...' : 'Guardar resultado'}
            </Button>
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
              {prediction?.predicted_scorer_id && <span className="text-xs text-muted-foreground">Guardado</span>}
              {pointsBadge(prediction?.scorer_points)}
            </div>
            <Button disabled={isLocked || !scorerId || saving === 'scorer'} onClick={() => savePrediction('scorer')} className="w-full bg-brand-red text-white hover:bg-red-700">
              {saving === 'scorer' ? 'Guardando...' : 'Guardar goleador'}
            </Button>
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
              {prediction?.predicted_home_score !== null && prediction?.predicted_home_score !== undefined && <span className="text-xs text-muted-foreground">Guardado</span>}
              {pointsBadge(prediction?.exact_score_points)}
            </div>
            <Button disabled={isLocked || homeScore === '' || awayScore === '' || saving === 'score'} onClick={() => savePrediction('score')} className="w-full bg-brand-red text-white hover:bg-red-700">
              {saving === 'score' ? 'Guardando...' : 'Guardar marcador'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
