'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, Clock, History, Lock, MapPin, Wifi } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruDateLabel, formatPeruTime, peruDateKey } from '@/lib/peru-time'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'
import { cacheGet, cacheSet } from '@/lib/local-cache'

const CACHE_KEY_MATCHES = 'fixture:matches'
const CACHE_KEY_PREDS   = 'fixture:predictions'

function MatchCountdown({ matchDate }: { matchDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function update() {
      const diff = new Date(matchDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft(''); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTimeLeft(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`)
    }
    update()
    const id = setInterval(update, 1_000)
    return () => clearInterval(id)
  }, [matchDate])
  if (!timeLeft) return null
  return (
    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
      <Clock className="h-2.5 w-2.5" />
      {timeLeft}
    </span>
  )
}

function groupByDate(matchList: any[]) {
  const byDate: Record<string, any[]> = {}
  matchList.forEach((m: any) => {
    const d = peruDateKey(m.match_date)
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(m)
  })
  return byDate
}

export default function PartidosPage() {
  const [matches, setMatches]         = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const [liveIndicator, setLiveIndicator] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string>('todos')
  const [showPast, setShowPast]       = useState(false)
  const [notifPerm, setNotifPerm]     = useState<NotificationPermission | 'unsupported'>('default')
  const [now, setNow] = useState(() => Date.now())

  const prevMatchesRef = useRef<Map<string, any>>(new Map())
  const predsRef       = useRef<Map<string, any>>(new Map())
  const userIdRef      = useRef<string | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1_000)
    return () => clearInterval(id)
  }, [])

  // Keep predsRef in sync so realtime handler always sees latest predictions
  useEffect(() => {
    predsRef.current = new Map(predictions.map((p: any) => [p.match_id, p]))
  }, [predictions])

  // Read initial notification permission
  useEffect(() => {
    if (!('Notification' in window)) { setNotifPerm('unsupported'); return }
    setNotifPerm(Notification.permission)
  }, [])

  function fireNotification(match: any, pred: any) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    const home  = match.home_team?.name_es ?? ''
    const away  = match.away_team?.name_es ?? ''
    const score = `${match.home_score ?? 0} - ${match.away_score ?? 0}`
    let body = `${home} ${score} ${away}`
    if (pred) {
      if ((pred.points_earned ?? 0) > 0) {
        body += `\n✅ Tu predicción sumó +${pred.points_earned} pts${pred.is_exact_score ? ' ¡Exacto!' : ''}`
      } else {
        body += '\n😔 Esta vez no sumaste puntos'
      }
    } else {
      body += '\nNo tenías predicción para este partido'
    }
    try {
      new Notification('⚽ Partido finalizado', { body, icon: '/favicon.ico' })
    } catch (_) {/* safari silently fails */}
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setNotifPerm(result)
  }

  const refreshPredictions = useCallback(async (userId: string) => {
    const token = getAccessToken()
    if (!token) return new Map()
    const s = createAuthedClient(token)
    const { data: p } = await s.from('predictions').select('*').eq('user_id', userId)
    const preds = p ?? []
    setPredictions(preds)
    cacheSet(CACHE_KEY_PREDS, preds, 60_000)
    return new Map(preds.map((pr: any) => [pr.match_id, pr]))
  }, [])

  useEffect(() => {
    const cachedMatches = cacheGet<any[]>(CACHE_KEY_MATCHES)
    const cachedPreds   = cacheGet<any[]>(CACHE_KEY_PREDS)
    if (cachedMatches) {
      setMatches(cachedMatches)
      setLoading(false)
      prevMatchesRef.current = new Map(cachedMatches.map((m: any) => [m.id, m]))
    }
    if (cachedPreds) setPredictions(cachedPreds)

    const supabase = createAnonClient()

    async function refreshMatches() {
      const { data } = await supabase
        .from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)')
        .eq('stage', 'group')
        .order('match_date', { ascending: true })
      const m = data ?? []
      setMatches(m)
      setLoading(false)
      cacheSet(CACHE_KEY_MATCHES, m)
      return m
    }

    refreshMatches().then(m => {
      prevMatchesRef.current = new Map(m.map((match: any) => [match.id, match]))
    })

    const token = getAccessToken()
    if (token) {
      const s = createAuthedClient(token)
      getCurrentUserId(token).then((userId) => {
        userIdRef.current = userId
        if (userId) {
          s.from('predictions').select('*').eq('user_id', userId).then(({ data: p }) => {
            const preds = p ?? []
            setPredictions(preds)
            cacheSet(CACHE_KEY_PREDS, preds, 60_000)
          })
        }
      })
    }

    const channel = supabase
      .channel('fixture-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, () => {
        setLiveIndicator(true)
        refreshMatches().then(async (newMatches) => {
          // Refresh predictions to get updated points_earned
          const userId = userIdRef.current
          let latestPreds = predsRef.current
          if (userId) {
            const freshPreds = await refreshPredictions(userId)
            latestPreds = freshPreds
          }

          // Notify for any match that just became 'finished'
          newMatches.forEach((m: any) => {
            const prev = prevMatchesRef.current.get(m.id)
            if (m.status === 'finished' && prev?.status !== 'finished') {
              fireNotification(m, latestPreds.get(m.id))
            }
          })
          prevMatchesRef.current = new Map(newMatches.map((m: any) => [m.id, m]))
          setTimeout(() => setLiveIndicator(false), 2_000)
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [refreshPredictions])

  if (loading) return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-muted/60" />
          <div className="space-y-2"><div className="h-5 w-28 rounded bg-muted/60" /><div className="h-3 w-48 rounded bg-muted/60" /></div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-6">
        {[1, 2, 3].map(d => (
          <div key={d} className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
            {[1, 2, 3].map(m => (
              <div key={m} className="rounded-xl border bg-card p-4 shadow-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-12 rounded-md bg-muted/60" />
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 justify-end"><div className="h-4 w-24 rounded bg-muted/60" /><div className="h-5 w-7 rounded bg-muted/60" /></div>
                    <div className="h-5 w-16 rounded-md bg-muted/60" />
                    <div className="flex items-center gap-2 flex-1"><div className="h-5 w-7 rounded bg-muted/60" /><div className="h-4 w-24 rounded bg-muted/60" /></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )

  const predictionsMap = new Map(predictions.map((p: any) => [p.match_id, p]))

  const openMatches     = matches.filter((m: any) => !m.predictions_locked && new Date(m.match_date).getTime() > now)
  const completedPreds  = openMatches.filter((m: any) => predictionsMap.has(m.id)).length
  const totalOpen       = openMatches.length
  const progressPct     = totalOpen > 0 ? Math.round((completedPreds / totalOpen) * 100) : 100

  const availableGroups = Array.from(new Set(matches.map((m: any) => m.group_name))).sort()
  const filteredMatches = activeGroup === 'todos' ? matches : matches.filter((m: any) => m.group_name === activeGroup)

  // Split upcoming (not finished) and past (finished) — upcoming always first
  const upcomingFiltered = filteredMatches.filter((m: any) => m.status !== 'finished')
  const pastFiltered     = filteredMatches.filter((m: any) => m.status === 'finished')

  const upcomingByDate = groupByDate(upcomingFiltered)
  const pastByDate     = groupByDate(pastFiltered)

  function renderMatchCard(match: any) {
    const pred       = predictionsMap.get(match.id)
    const isLocked   = match.predictions_locked || new Date(match.match_date).getTime() <= now
    const isFinished = match.status === 'finished'
    const homeFlag   = match.home_team?.flag_emoji
    const awayFlag   = match.away_team?.flag_emoji

    return (
      <Card key={match.id} className={`overflow-hidden border shadow-sm transition-shadow hover:shadow-md ${isFinished ? 'opacity-80' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center justify-between gap-2 sm:w-28 sm:justify-start">
              <Badge variant="secondary" className="w-12 shrink-0 justify-center font-mono text-xs">G{match.group_name}</Badge>
              <span className="text-xs text-muted-foreground sm:hidden">{formatPeruTime(match.match_date)}</span>
            </div>
            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <div className="flex min-w-0 items-center justify-end gap-2">
                <span className="truncate text-right text-sm font-semibold leading-tight">{match.home_team?.name_es}</span>
                <TeamFlag code={homeFlag} label={match.home_team?.name_es} className="shrink-0" />
              </div>
              <div className="min-w-14 px-2 text-center sm:min-w-16 sm:px-3">
                {isFinished ? (
                  <span className="text-lg font-bold tabular-nums">{match.home_score} - {match.away_score}</span>
                ) : (
                  <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                    {formatPeruTime(match.match_date)}
                  </span>
                )}
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <TeamFlag code={awayFlag} label={match.away_team?.name_es} className="shrink-0" />
                <span className="truncate text-left text-sm font-semibold leading-tight">{match.away_team?.name_es}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground sm:w-40 sm:shrink-0 sm:justify-start">
              <MapPin className="h-3 w-3" />{match.city}
            </div>
          </div>
          <div className="mt-3 flex flex-col items-start justify-between gap-2 border-t pt-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {pred ? (
                <span className="flex items-center gap-1">
                  Predicción guardada
                  {(pred.points_earned ?? 0) > 0 && (
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] py-0">
                      +{pred.points_earned} pts{pred.is_exact_score ? ' ✓ exacto' : ''}
                    </Badge>
                  )}
                  {isFinished && (pred.points_earned ?? 0) === 0 && (
                    <span className="text-muted-foreground/60">· 0 pts</span>
                  )}
                </span>
              ) : isLocked ? (
                <span>Predicciones cerradas</span>
              ) : (
                <span>Resultado, goleador y marcador exacto</span>
              )}
              {!isLocked && !isFinished && (new Date(match.match_date).getTime() - now) < 86_400_000 && (
                <MatchCountdown matchDate={match.match_date} />
              )}
            </div>
            <Link
              href={`/dashboard/partidos/${match.id}`}
              className={`inline-flex h-8 w-full items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors sm:w-auto ${
                pred ? 'border bg-background hover:bg-muted' : 'bg-brand-red text-white hover:bg-red-700'
              }`}
            >
              Entrar al encuentro
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5 sm:space-y-7">

      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Partidos</h1>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${liveIndicator ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                <Wifi className="h-2.5 w-2.5" />
                {liveIndicator ? 'Actualizando...' : 'En vivo'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Fase de grupos oficial · 11-27 junio 2026 · Hora Perú</p>
          </div>

          {/* Notification permission button */}
          {notifPerm !== 'unsupported' && (
            notifPerm === 'granted' ? (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Bell className="h-3.5 w-3.5" />
                Notif. activas
              </div>
            ) : notifPerm === 'denied' ? (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground" title="Activa las notificaciones desde la configuración de tu navegador">
                <BellOff className="h-3.5 w-3.5" />
                Bloqueadas
              </div>
            ) : (
              <button
                onClick={requestNotifPermission}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand-red/30 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-brand-red hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors"
              >
                <Bell className="h-3.5 w-3.5" />
                Activar alertas
              </button>
            )
          )}
        </div>
      </div>

      {/* Aviso de bloqueo automático */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-900/20">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Las apuestas se cierran automáticamente al inicio de cada partido.</span>{' '}
          Una vez que el partido comience, no podrás realizar ni modificar tu predicción.
        </p>
      </div>

      {/* Banner de progreso */}
      {matches.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${progressPct === 100 ? 'text-emerald-500' : 'text-brand-red'}`} />
              <span className="text-sm font-semibold">
                {progressPct === 100
                  ? '¡Todas las predicciones completadas!'
                  : `${completedPreds} de ${totalOpen} predicciones completadas`}
              </span>
            </div>
            <span className="text-sm font-bold tabular-nums text-muted-foreground">{progressPct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-brand-red'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {totalOpen === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No hay partidos abiertos para predecir en este momento.</p>
          )}
        </div>
      )}

      {/* Filtros por grupo */}
      {availableGroups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveGroup('todos')}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${activeGroup === 'todos' ? 'bg-brand-red text-white shadow-sm' : 'border bg-card text-muted-foreground hover:border-brand-red/50 hover:text-foreground'}`}
          >
            Todos
          </button>
          {availableGroups.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${activeGroup === g ? 'bg-brand-red text-white shadow-sm' : 'border bg-card text-muted-foreground hover:border-brand-red/50 hover:text-foreground'}`}
            >
              Grupo {g}
            </button>
          ))}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-muted-foreground">No hay partidos cargados</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Ejecutá el seed desde el panel de admin.</p>
        </div>
      ) : (
        <div className="mx-auto max-w-5xl space-y-6">

          {/* ── PRÓXIMOS PARTIDOS ── */}
          {upcomingFiltered.length === 0 && pastFiltered.length > 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              Todos los partidos {activeGroup !== 'todos' ? `del Grupo ${activeGroup}` : ''} han finalizado.
            </div>
          ) : (
            Object.entries(upcomingByDate).map(([dateKey, dayMatches]) => (
              <div key={dateKey}>
                <h2 className="mb-2 pl-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {formatPeruDateLabel(dayMatches[0].match_date)}
                </h2>
                <div className="grid gap-3">
                  {dayMatches.map(renderMatchCard)}
                </div>
              </div>
            ))
          )}

          {/* ── PARTIDOS TERMINADOS ── */}
          {pastFiltered.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => setShowPast(v => !v)}
                className="flex w-full items-center justify-between rounded-2xl border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-muted/40"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <History className="h-4 w-4" />
                  Partidos terminados
                  <Badge variant="secondary" className="font-mono text-xs">{pastFiltered.length}</Badge>
                </div>
                {showPast
                  ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>

              {showPast && (
                <div className="space-y-6">
                  {Object.entries(pastByDate)
                    .sort(([a], [b]) => b.localeCompare(a)) // más recientes primero
                    .map(([dateKey, dayMatches]) => (
                      <div key={dateKey}>
                        <h2 className="mb-2 pl-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                          {formatPeruDateLabel(dayMatches[0].match_date)}
                        </h2>
                        <div className="grid gap-3">
                          {dayMatches.map(renderMatchCard)}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  )
}
