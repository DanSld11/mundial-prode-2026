'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, CheckCircle2, Clock, MapPin, Wifi } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruDateLabel, formatPeruTime, peruDateKey } from '@/lib/peru-time'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'
import { cacheGet, cacheSet } from '@/lib/local-cache'

const CACHE_KEY_MATCHES = 'fixture:matches'
const CACHE_KEY_PREDS = 'fixture:predictions'


/** Countdown para partidos que arrancan en menos de 24 horas */
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

export default function FixturePage() {
  const [matches, setMatches] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liveIndicator, setLiveIndicator] = useState(false)
  const [activeGroup, setActiveGroup] = useState<string>('todos')

  useEffect(() => {
    // Show cached data immediately (optimistic)
    const cachedMatches = cacheGet<any[]>(CACHE_KEY_MATCHES)
    const cachedPreds = cacheGet<any[]>(CACHE_KEY_PREDS)
    if (cachedMatches) { setMatches(cachedMatches); setLoading(false) }
    if (cachedPreds) setPredictions(cachedPreds)

    const supabase = createAnonClient()

    function refreshMatches() {
      return supabase.from('matches')
        .select('*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)')
        .eq('stage', 'group')
        .order('match_date', { ascending: true })
        .then(({ data }) => {
          const m = data ?? []
          setMatches(m)
          setLoading(false)
          cacheSet(CACHE_KEY_MATCHES, m)
        })
    }

    refreshMatches()

    const token = getAccessToken()
    if (token) {
      const s = createAuthedClient(token)
      getCurrentUserId(token).then((userId) => {
        if (userId) {
          s.from('predictions').select('*').eq('user_id', userId).then(({ data: p }) => {
            const preds = p ?? []
            setPredictions(preds)
            cacheSet(CACHE_KEY_PREDS, preds, 60_000)
          })
        }
      })
    }

    // Realtime: refresh when any match result is updated
    const channel = supabase
      .channel('fixture-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, () => {
        setLiveIndicator(true)
        refreshMatches().then(() => setTimeout(() => setLiveIndicator(false), 2000))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-muted/60" />
          <div className="space-y-2"><div className="h-5 w-28 rounded bg-muted/60" /><div className="h-3 w-48 rounded bg-muted/60" /></div>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-6">
        {[1,2,3].map(d => (
          <div key={d} className="space-y-2">
            <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
            {[1,2,3].map(m => (
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

  // Progreso de predicciones (solo partidos que aún no empezaron y no están bloqueados)
  const openMatches = matches.filter((m: any) => !m.predictions_locked && new Date(m.match_date) > new Date())
  const completedPreds = openMatches.filter((m: any) => predictionsMap.has(m.id)).length
  const totalOpen = openMatches.length
  const progressPct = totalOpen > 0 ? Math.round((completedPreds / totalOpen) * 100) : 100

  // Grupos disponibles para el filtro
  const availableGroups = Array.from(new Set(matches.map((m: any) => m.group_name))).sort()
  const filteredMatches = activeGroup === 'todos' ? matches : matches.filter((m: any) => m.group_name === activeGroup)
  const filteredByDate: Record<string, any[]> = {}
  filteredMatches.forEach((m: any) => {
    const d = peruDateKey(m.match_date)
    if (!filteredByDate[d]) filteredByDate[d] = []
    filteredByDate[d].push(m)
  })

  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Fixture</h1>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${liveIndicator ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                <Wifi className="h-2.5 w-2.5" />
                {liveIndicator ? 'Actualizando...' : 'En vivo'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Fase de grupos oficial · 11-27 junio 2026 · Hora Perú</p>
          </div>
        </div>
      </div>

      {/* Banner de progreso de predicciones */}
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
          {Object.entries(filteredByDate).map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              <h2 className="mb-2 pl-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {formatPeruDateLabel(dayMatches[0].match_date)}
              </h2>
              <div className="grid gap-3">
                {dayMatches.map((match: any) => {
                  const pred = predictionsMap.get(match.id)
                  const isLocked = match.predictions_locked || new Date(match.match_date) < new Date()
                  const isFinished = match.status === 'finished'
                  const homeFlag = match.home_team?.flag_emoji
                  const awayFlag = match.away_team?.flag_emoji

                  return (
                    <Card key={match.id} className="overflow-hidden border shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-center justify-between gap-2 sm:w-28 sm:justify-start">
                            <Badge variant="secondary" className="w-12 shrink-0 justify-center font-mono text-xs">G{match.group_name}</Badge>
                            <span className="text-xs text-muted-foreground sm:hidden">
                              {formatPeruTime(match.match_date)}
                            </span>
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
                        <div className="mt-3 flex flex-col items-center justify-between gap-2 border-t pt-3 sm:flex-row">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {pred ? (
                              <span>
                                Predicción guardada
                                {pred.points_earned > 0 ? ` · +${pred.points_earned} pts` : ''}
                              </span>
                            ) : isLocked ? (
                              <span>Predicciones cerradas</span>
                            ) : (
                              <span>Resultado, goleador y marcador exacto</span>
                            )}
                            {/* Countdown si faltan menos de 24h y el partido no cerró */}
                            {!isLocked && !isFinished && (new Date(match.match_date).getTime() - Date.now()) < 86_400_000 && (
                              <MatchCountdown matchDate={match.match_date} />
                            )}
                          </div>
                          <Link
                            href={`/dashboard/fixture/${match.id}`}
                            className={`inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
                              pred
                                ? 'border bg-background hover:bg-muted'
                                : 'bg-brand-red text-white hover:bg-red-700'
                            }`}
                          >
                            Entrar al encuentro
                          </Link>
                          {pred && pred.points_earned > 0 && (
                            <div className="sm:hidden">
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs">+{pred.points_earned} pts{pred.is_exact_score ? ' exacto' : ''}</Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
