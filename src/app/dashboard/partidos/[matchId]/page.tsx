'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Goal,
  Lock,
  Medal,
  Share2,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { PlayerPicker } from '@/components/ui/player-picker'
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
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [matchStats, setMatchStats] = useState<{
    total: number
    outcomes: { home: number; draw: number; away: number }
    scorers: { id: string; name: string; count: number }[]
    exactScores: number
  } | null>(null)

  const supabase = useMemo(() => createAnonClient(), [])

  useEffect(() => {
    async function load() {
      const { data: matchData } = await supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(id,name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(id,name_es,flag_emoji,code)')
        .eq('id', matchId)
        .single()
      setMatch(matchData)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = matchData as any
      if (!md) { setLoading(false); return }
      const teamIds = [md.home_team_id, md.away_team_id].filter(Boolean) as string[]
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
        const uid = await getCurrentUserId(token)
        if (uid) {
          setUserId(uid)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: predictionData } = await (authedSupabase as any)
            .from('predictions')
            .select('*')
            .eq('user_id', uid)
            .eq('match_id', matchId)
            .single() as { data: any }
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

      // Load aggregate stats (only if match is finished)
      if (matchData?.status === 'finished') {
        fetch(`/api/match-stats/${matchId}`)
          .then((r) => r.json())
          .then((data) => { if (!data.error) setMatchStats(data) })
          .catch(() => {})
      }
    }
    load()
  }, [matchId, supabase])

  // La predicción se bloquea solo si: el admin la cerró O ya empezó el partido
  // Los usuarios pueden editar su predicción hasta que comience el partido
  const isMatchLocked = !!match && (match.predictions_locked || new Date(match.match_date) < new Date())
  const isUserConfirmed = !!prediction  // ya tiene una predicción guardada (editable si no está bloqueado)
  const isLocked = isMatchLocked        // solo el partido bloquea, no el haber confirmado antes
  const isFinished = match?.status === 'finished'

  const homePlayers = players.filter((p) => p.team_id === match?.home_team_id)
  const awayPlayers = players.filter((p) => p.team_id === match?.away_team_id)
  const selectedScorerName = players.find((p) => p.id === scorerId)?.name ?? null

  const outcomeOptions = match
    ? [
        { value: 'home', label: `Gana ${match.home_team?.name_es}`, flag: match.home_team?.flag_emoji, name: match.home_team?.name_es },
        { value: 'draw', label: 'Empate', flag: null, name: null },
        { value: 'away', label: `Gana ${match.away_team?.name_es}`, flag: match.away_team?.flag_emoji, name: match.away_team?.name_es },
      ]
    : []

  const outcomeLabel = outcomeOptions.find((o) => o.value === outcome)?.label ?? outcome

  const hasAnything = !!(outcome || scorerId || homeScore !== '' || awayScore !== '')
  // "Bold prediction" indicator — high score (≥3 goals per team or ≥5 total) or score entered
  const isBoldPrediction = (
    (homeScore !== '' && awayScore !== '' && (parseInt(homeScore) + parseInt(awayScore)) >= 5) ||
    (homeScore !== '' && parseInt(homeScore) >= 3) ||
    (awayScore !== '' && parseInt(awayScore) >= 3)
  )

  async function sharePrediction() {
    const text = [
      `⚽ Mi predicción: ${match?.home_team?.name_es} vs ${match?.away_team?.name_es}`,
      outcome ? `Resultado: ${outcomeLabel}` : null,
      selectedScorerName ? `Goleador: ${selectedScorerName}` : null,
      homeScore !== '' && awayScore !== '' ? `Marcador: ${homeScore} - ${awayScore}` : null,
      `\n🏆 Mundial Perú 2026`,
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      navigator.share({ text, title: 'Mi predicción — Mundial Perú 2026' }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text).catch(() => {})
      // Toast via parent component isn't accessible here but the copy works
    }
  }

  async function confirmSave() {
    setShowConfirmModal(false)
    setErrorMessage('')
    setSaving(true)

    if (!accessToken || !userId || !match) {
      setErrorMessage('No se pudo identificar tu sesión.')
      setSaving(false)
      return
    }

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
      .upsert(nextPrediction, { onConflict: 'user_id,match_id' })
      .select()
      .single()

    if (error) {
      setErrorMessage(error.message)
    } else if (data) {
      setPrediction(data)  // esto activa isUserConfirmed → bloquea el form
    }
    setSaving(false)
  }

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando encuentro...</div>
  if (!match) return <div className="py-20 text-center text-sm text-muted-foreground">Partido no encontrado.</div>

  return (
    <>
      <div className="mx-auto max-w-5xl space-y-5">
        <Link
          href="/dashboard/partidos"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a partidos
        </Link>

        {/* Cabecera del partido */}
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
        </section>

        {/* Mensajes de estado */}
        {errorMessage && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Banner: predicción ya guardada pero editable */}
        {isUserConfirmed && !isFinished && !isMatchLocked && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Predicción guardada — podés editarla
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70">
                Podés cambiar tu pronóstico hasta que empiece el partido.
              </p>
            </div>
            <button
              onClick={sharePrediction}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartir
            </button>
          </div>
        )}

        {/* Banner: predicción confirmada y partido bloqueado */}
        {isUserConfirmed && !isFinished && isMatchLocked && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Predicción confirmada
              </p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-400/70">
                El partido ya comenzó. Tu predicción está bloqueada.
              </p>
            </div>
            <button
              onClick={sharePrediction}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartir
            </button>
            <Lock className="h-4 w-4 shrink-0 text-emerald-500" />
          </div>
        )}

        {/* Banner: partido cerrado por tiempo/admin */}
        {isMatchLocked && !isUserConfirmed && (
          <div className="flex items-center gap-3 rounded-xl border bg-muted/50 px-4 py-3">
            <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Las predicciones para este partido ya están cerradas.
            </p>
          </div>
        )}

        {/* Cards de predicción */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Resultado */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-brand-red" />
                Resultado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {outcomeOptions.map((option) => {
                  const isSelected = outcome === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isLocked}
                      onClick={() => !isLocked && setOutcome(option.value)}
                      className={[
                        'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all',
                        isSelected
                          ? 'border-brand-red bg-brand-red text-white shadow-md'
                          : 'border-border bg-background text-foreground hover:border-muted-foreground/40 hover:bg-muted/60',
                        isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                      ].join(' ')}
                    >
                      {option.flag && (
                        <TeamFlag
                          code={option.flag}
                          label={option.name ?? ''}
                          className={isSelected ? 'opacity-90' : ''}
                        />
                      )}
                      <span className="flex-1">{option.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                      )}
                    </button>
                  )
                })}
              </div>
              {/* Estado para partidos finalizados */}
              {isFinished && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {prediction?.predicted_outcome ? 'Resultado predicho' : 'Sin predicción'}
                  </span>
                  <Badge variant={prediction?.outcome_points > 0 ? 'default' : 'secondary'}>
                    {prediction?.outcome_points ?? 0} pts
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goleador */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Goal className="h-4 w-4 text-brand-red" />
                Jugador que anota
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <PlayerPicker
                players={players}
                value={scorerId}
                onChange={(id) => !isLocked && setScorerId(id)}
                disabled={isLocked}
                placeholder="Buscar goleador..."
              />
              {players.length === 0 && !isLocked && (
                <p className="text-xs text-muted-foreground">El admin aún no cargó jugadores.</p>
              )}
              {isFinished && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {prediction?.predicted_scorer_id ? 'Goleador predicho' : 'Sin predicción'}
                  </span>
                  <Badge variant={prediction?.scorer_points > 0 ? 'default' : 'secondary'}>
                    {prediction?.scorer_points ?? 0} pts
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Marcador exacto */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Medal className="h-4 w-4 text-brand-red" />
                Marcador exacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <Input
                  disabled={isLocked}
                  type="number"
                  min={0}
                  max={20}
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  className={[
                    'h-14 text-center text-2xl font-bold tabular-nums',
                    isLocked ? 'bg-muted/30' : '',
                  ].join(' ')}
                  placeholder="0"
                />
                <span className="text-xl font-bold text-muted-foreground">-</span>
                <Input
                  disabled={isLocked}
                  type="number"
                  min={0}
                  max={20}
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  className={[
                    'h-14 text-center text-2xl font-bold tabular-nums',
                    isLocked ? 'bg-muted/30' : '',
                  ].join(' ')}
                  placeholder="0"
                />
              </div>
              {isFinished && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {prediction?.predicted_home_score != null ? 'Marcador predicho' : 'Sin predicción'}
                  </span>
                  <Badge variant={prediction?.exact_score_points > 0 ? 'default' : 'secondary'}>
                    {prediction?.exact_score_points ?? 0} pts
                    {prediction?.is_exact_score ? ' · exacto' : ''}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen de puntos totales (partidos finalizados) */}
        {isFinished && prediction && (
          <div className={[
            'flex items-center justify-between rounded-xl border px-5 py-4 shadow-sm',
            (prediction.points_earned ?? 0) > 0
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
              : 'border-border bg-muted/30',
          ].join(' ')}>
            <div>
              <p className={[
                'font-semibold',
                (prediction.points_earned ?? 0) > 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-muted-foreground',
              ].join(' ')}>
                {(prediction.points_earned ?? 0) > 0 ? '¡Sumaste puntos!' : 'Sin puntos esta vez'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Resultado {prediction.outcome_points > 0 ? '✓' : '✗'} ·
                Goleador {prediction.scorer_points > 0 ? '✓' : '✗'} ·
                Marcador {prediction.exact_score_points > 0 ? '✓' : '✗'}
              </p>
            </div>
            <span className={[
              'text-3xl font-extrabold tabular-nums',
              (prediction.points_earned ?? 0) > 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground',
            ].join(' ')}>
              +{prediction.points_earned ?? 0} pts
            </span>
          </div>
        )}

        {/* Bold prediction indicator */}
        {!isLocked && isBoldPrediction && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <span className="text-xl">⚡</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300">¡Predicción atrevida!</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70">Estás apostando por un marcador goleador. Si acertás, ¡la gloria es tuya!</p>
            </div>
          </div>
        )}

        {/* Botón guardar — solo si puede editar */}
        {!isLocked && (
          <Button
            disabled={saving || !hasAnything}
            onClick={() => setShowConfirmModal(true)}
            className="w-full bg-brand-red text-white hover:bg-red-700 h-12 text-base font-semibold"
          >
            {saving ? 'Guardando...' : 'Confirmar predicción'}
          </Button>
        )}

        {/* Estadísticas agregadas — solo partidos finalizados */}
        {isFinished && matchStats && matchStats.total > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-brand-red" />
                ¿Qué predijeron todos?
                <span className="ml-auto text-xs font-normal text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />{matchStats.total} predicciones
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resultado predicho */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Resultado</p>
                {(['home', 'draw', 'away'] as const).map((key) => {
                  const count = matchStats.outcomes[key] ?? 0
                  const pct = matchStats.total > 0 ? Math.round((count / matchStats.total) * 100) : 0
                  const label = key === 'home' ? match.home_team?.name_es : key === 'away' ? match.away_team?.name_es : 'Empate'
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span className="w-32 shrink-0 truncate text-muted-foreground">{label}</span>
                      <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                        <div
                          className="h-2 rounded-full bg-brand-red transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 shrink-0 text-right font-semibold tabular-nums">{pct}%</span>
                    </div>
                  )
                })}
              </div>

              {/* Goleadores más elegidos */}
              {matchStats.scorers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goleadores más elegidos</p>
                  {matchStats.scorers.map((s) => {
                    const pct = Math.round((s.count / matchStats.total) * 100)
                    return (
                      <div key={s.id} className="flex items-center gap-2 text-sm">
                        <span className="w-32 shrink-0 truncate text-muted-foreground">{s.name}</span>
                        <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                          <div
                            className="h-2 rounded-full bg-brand-red/60 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right font-semibold tabular-nums">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Marcadores exactos */}
              <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <span className="text-muted-foreground">Acertaron el marcador exacto</span>
                <span className="font-bold">{matchStats.exactScores} / {matchStats.total}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de confirmación */}
      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="¿Confirmás tu predicción?"
        className="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Revisá tu pronóstico antes de confirmar.{' '}
            <span className="font-semibold text-foreground">
              Podés modificarlo hasta que comience el partido.
            </span>
          </p>

          {/* Partido */}
          <div className="rounded-lg bg-muted/40 px-4 py-3 text-center text-sm font-semibold">
            {match.home_team?.name_es} vs {match.away_team?.name_es}
          </div>

          {/* Resumen de predicción */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                Resultado
              </span>
              {outcome ? (
                <span className="font-semibold text-foreground">{outcomeLabel}</span>
              ) : (
                <span className="italic text-muted-foreground/60">Sin selección</span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Goal className="h-4 w-4" />
                Goleador
              </span>
              {selectedScorerName ? (
                <span className="font-semibold text-foreground">{selectedScorerName}</span>
              ) : (
                <span className="italic text-muted-foreground/60">Sin selección</span>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Medal className="h-4 w-4" />
                Marcador exacto
              </span>
              {homeScore !== '' && awayScore !== '' ? (
                <span className="font-bold tabular-nums text-foreground">
                  {homeScore} - {awayScore}
                </span>
              ) : (
                <span className="italic text-muted-foreground/60">Sin selección</span>
              )}
            </div>
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Podés volver a editar tu predicción en cualquier momento antes de que empiece el partido.
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirmModal(false)}
            >
              Volver a editar
            </Button>
            <Button
              className="flex-1 bg-brand-red text-white hover:bg-red-700 font-semibold"
              onClick={confirmSave}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
