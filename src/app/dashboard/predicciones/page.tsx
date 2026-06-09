'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, CheckCircle2, Trophy, Clock, Star, Filter, Lock } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { getAccessToken, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'

type FilterType = 'todas' | 'pendientes' | 'acertadas' | 'exactas'

const OUTCOME_LABELS: Record<string, string> = {
  home: 'Local',
  away: 'Visitante',
  draw: 'Empate',
}

export default function PrediccionesPage() {
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('todas')

  useEffect(() => {
    const token = getAccessToken()
    if (!token) { setLoading(false); return }
    const s = createAuthedClient(token)
    getCurrentUserId(token).then((userId) => {
      if (userId) {
        s.from('predictions')
          .select('*, predicted_scorer:players(name, shirt_number), match:matches(*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code))')
          .eq('user_id', userId)
          .then(({ data: p }) => {
            // Sort by match date (upcoming first → played last)
            const sorted = (p ?? []).sort((a, b) => {
              const da = a.match?.match_date ?? ''
              const db = b.match?.match_date ?? ''
              return da < db ? -1 : da > db ? 1 : 0
            })
            setPredictions(sorted)
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return (
    <div className="space-y-5">
      <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted/60" />)}
      </div>
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />)}
      </div>
    </div>
  )

  const total = predictions.length
  const correct = predictions.filter(p => p.points_earned > 0).length
  const exact = predictions.filter(p => p.exact_score_points > 0 || p.is_exact_score).length
  const pending = predictions.filter(p => p.match?.status !== 'finished').length

  const filtered = predictions.filter(p => {
    if (filter === 'pendientes') return p.match?.status !== 'finished'
    if (filter === 'acertadas') return p.points_earned > 0
    if (filter === 'exactas') return p.exact_score_points > 0 || p.is_exact_score
    return true
  })

  const FILTERS: { key: FilterType; label: string; count: number; color: string }[] = [
    { key: 'todas',     label: 'Todas',     count: total,   color: '' },
    { key: 'pendientes',label: 'Pendientes',count: pending, color: 'text-amber-600' },
    { key: 'acertadas', label: 'Acertadas', count: correct, color: 'text-emerald-600' },
    { key: 'exactas',   label: 'Exactas',   count: exact,   color: 'text-brand-gold' },
  ]

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Mis Predicciones</h1>
            <p className="text-sm text-muted-foreground">Tus pronósticos y puntos acumulados</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total',      value: total,   icon: Target,       color: 'text-muted-foreground', bg: 'bg-muted/40' },
          { label: 'Acertadas',  value: correct, icon: CheckCircle2, color: 'text-emerald-600',      bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Exactas',    value: exact,   icon: Trophy,       color: 'text-amber-500',        bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Pendientes', value: pending, icon: Clock,        color: 'text-blue-500',         bg: 'bg-blue-50 dark:bg-blue-950/30' },
        ].map(s => (
          <Card key={s.label} className={`border-0 shadow-sm ${s.bg}`}>
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={`h-6 w-6 shrink-0 ${s.color}`} />
              <div>
                <div className="text-2xl font-extrabold tabular-nums">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Filter className="h-4 w-4 self-center text-muted-foreground shrink-0" />
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={[
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              filter === f.key
                ? 'border-brand-red bg-brand-red text-white shadow-sm'
                : 'border-border bg-card hover:bg-muted/50',
            ].join(' ')}
          >
            <span>{f.label}</span>
            <span className={[
              'rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums',
              filter === f.key ? 'bg-white/20 text-white' : f.color || 'bg-muted text-muted-foreground',
            ].join(' ')}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Predictions list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center shadow-sm">
          <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">Sin predicciones aquí</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            {filter === 'todas' ? 'Andá a Partidos para hacer tus predicciones.' : 'Probá otro filtro.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => {
            const isFinished = p.match?.status === 'finished'
            const isExact = p.exact_score_points > 0 || p.is_exact_score
            const hasPoints = p.points_earned > 0
            const actualOutcome = isFinished
              ? (p.match?.home_score > p.match?.away_score ? 'home'
                : p.match?.away_score > p.match?.home_score ? 'away' : 'draw')
              : null
            const outcomeCorrect = isFinished && p.predicted_outcome === actualOutcome

            return (
              <Card
                key={p.id}
                className={[
                  'overflow-hidden shadow-sm transition-all',
                  isExact ? 'ring-2 ring-brand-gold/50' : '',
                ].join(' ')}
              >
                <CardContent className="p-0">
                  {/* Status bar */}
                  <div className={[
                    'flex items-center justify-between px-3 py-1.5 text-xs font-medium',
                    isExact ? 'bg-brand-gold/10 text-amber-700 dark:text-amber-400'
                    : hasPoints ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : isFinished ? 'bg-muted/30 text-muted-foreground'
                    : 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
                  ].join(' ')}>
                    <div className="flex items-center gap-1.5">
                      {isExact ? <><Trophy className="h-3 w-3" /><span>¡Marcador exacto!</span></>
                      : hasPoints ? <><CheckCircle2 className="h-3 w-3" /><span>Predicción acertada</span></>
                      : isFinished ? <span>Sin puntos</span>
                      : new Date(p.match?.match_date) < new Date() ? <><Lock className="h-3 w-3" /><span>Bloqueado (En juego)</span></>
                      : <><Clock className="h-3 w-3" /><span>Pendiente</span></>}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.match?.group_name && (
                        <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                          Grupo {p.match.group_name}
                        </span>
                      )}
                      {isFinished && (
                        <span className={`font-extrabold tabular-nums text-sm ${hasPoints ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                          {hasPoints ? `+${p.points_earned} pts` : '0 pts'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="p-3">
                    {/* Teams + scores */}
                    <div className="flex items-center justify-center gap-3">
                      {/* Home */}
                      <div className="flex min-w-0 flex-1 flex-col items-end gap-1 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="truncate text-sm font-bold leading-tight">{p.match?.home_team?.name_es}</span>
                          <TeamFlag code={p.match?.home_team?.flag_emoji} label={p.match?.home_team?.name_es} className="h-4 w-5 shrink-0" />
                        </div>
                        <span className="text-[10px] uppercase text-muted-foreground">{p.match?.home_team?.code}</span>
                      </div>

                      {/* Score block */}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className={`flex h-9 w-8 items-center justify-center rounded-lg text-lg font-extrabold tabular-nums ${
                            isFinished && p.match?.home_score === p.predicted_home_score
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                              : 'bg-secondary'
                          }`}>
                            {p.predicted_home_score ?? '?'}
                          </span>
                          <span className="text-muted-foreground">–</span>
                          <span className={`flex h-9 w-8 items-center justify-center rounded-lg text-lg font-extrabold tabular-nums ${
                            isFinished && p.match?.away_score === p.predicted_away_score
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                              : 'bg-secondary'
                          }`}>
                            {p.predicted_away_score ?? '?'}
                          </span>
                        </div>
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Predicción</span>
                      </div>

                      {/* Away */}
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
                        <div className="flex items-center gap-1.5 justify-start">
                          <TeamFlag code={p.match?.away_team?.flag_emoji} label={p.match?.away_team?.name_es} className="h-4 w-5 shrink-0" />
                          <span className="truncate text-sm font-bold leading-tight">{p.match?.away_team?.name_es}</span>
                        </div>
                        <span className="text-[10px] uppercase text-muted-foreground">{p.match?.away_team?.code}</span>
                      </div>
                    </div>

                    {/* Actual result (if finished) */}
                    {isFinished && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Resultado real:</span>
                        <span className="rounded bg-muted/50 px-2 py-0.5 text-xs font-bold tabular-nums">
                          {p.match?.home_score} – {p.match?.away_score}
                        </span>
                      </div>
                    )}

                    {/* Details row */}
                    <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
                      {p.predicted_outcome && (
                        <Badge
                          variant={outcomeCorrect ? 'default' : 'outline'}
                          className={`text-[10px] ${outcomeCorrect ? 'bg-emerald-500 hover:bg-emerald-500' : ''}`}
                        >
                          {OUTCOME_LABELS[p.predicted_outcome] ?? p.predicted_outcome}
                          {outcomeCorrect && ' ✓'}
                        </Badge>
                      )}
                      {p.predicted_scorer && (
                        <Badge variant="outline" className="text-[10px]">
                          <Star className="mr-1 h-2.5 w-2.5 text-brand-gold" />
                          {p.predicted_scorer.name}
                          {p.predicted_scorer.shirt_number != null && (
                            <span className="ml-1 text-muted-foreground">#{p.predicted_scorer.shirt_number}</span>
                          )}
                          {p.scorer_points > 0 && ' ✓'}
                        </Badge>
                      )}
                    </div>
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
