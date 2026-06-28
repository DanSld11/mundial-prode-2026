'use client'

import { useState, useTransition } from 'react'
import { saveBracketPrediction } from './actions'
import { STAGE_LABELS, STAGE_ORDER } from './constants'
import { formatPeruDateLabel, formatPeruTime } from '@/lib/peru-time'
import { Trophy, Lock, Info, CheckCircle2, Calendar } from 'lucide-react'
import { toast } from 'sonner'

interface Team {
  id: string
  name_es: string
  code: string
  flag_emoji: string
}

interface Match {
  id: string
  match_number: number
  stage: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  predictions_locked: boolean
  home_team: Team | null
  away_team: Team | null
}

interface Prediction {
  slot_key: string
  team_id: string
  stage: string
  points_earned: number
}

interface Props {
  uid: string | null
  matches: Match[]
  predictions: Prediction[]
}

const STAGE_SHORT: Record<string, string> = {
  round_of_32:  'R32',
  round_of_16:  'Octavos',
  quarterfinal: 'Cuartos',
  semifinal:    'Semis',
  third_place:  '3er Puesto',
  final:        'Final',
}

const STAGE_COLOR: Record<string, string> = {
  round_of_32:  'from-slate-700 to-slate-800',
  round_of_16:  'from-blue-700 to-blue-800',
  quarterfinal: 'from-violet-700 to-violet-800',
  semifinal:    'from-orange-600 to-orange-700',
  third_place:  'from-emerald-700 to-emerald-800',
  final:        'from-yellow-500 to-amber-600',
}

export default function BracketClient({ uid, matches, predictions: initialPreds }: Props) {
  const [preds, setPreds] = useState<Map<string, string>>(
    new Map(initialPreds.map((p) => [p.slot_key, p.team_id])),
  )
  const [activeStage, setActiveStage] = useState<string>(() => {
    const stages = STAGE_ORDER.filter((s) => matches.some((m) => m.stage === s))
    return stages[0] ?? 'round_of_32'
  })
  const [, startTransition] = useTransition()

  const stagesWithMatches = STAGE_ORDER.filter((s) => matches.some((m) => m.stage === s))

  function isMatchLocked(match: Match): boolean {
    return match.predictions_locked || new Date(match.match_date) <= new Date()
  }

  function handlePick(match: Match, teamId: string) {
    if (!uid) { toast.error('Debés iniciar sesión para hacer predicciones'); return }
    if (isMatchLocked(match)) { toast.error('Este partido ya no acepta predicciones'); return }
    if (!match.home_team || !match.away_team) { toast.error('Los equipos aún no están definidos'); return }

    const current = preds.get(match.id)
    const newTeamId = current === teamId ? null : teamId

    setPreds((prev) => {
      const next = new Map(prev)
      if (newTeamId) next.set(match.id, newTeamId)
      else next.delete(match.id)
      return next
    })

    startTransition(async () => {
      const res = await saveBracketPrediction(match.id, match.stage, newTeamId)
      if (res.error) {
        toast.error(res.error)
        setPreds((prev) => {
          const next = new Map(prev)
          if (current) next.set(match.id, current)
          else next.delete(match.id)
          return next
        })
      }
    })
  }

  const visibleMatches = matches.filter((m) => m.stage === activeStage)
  const stageColor = STAGE_COLOR[activeStage] ?? 'from-slate-700 to-slate-800'

  // Stats for current stage
  const pickedCount = visibleMatches.filter(m => preds.has(m.id)).length
  const totalWithTeams = visibleMatches.filter(m => m.home_team && m.away_team).length

  return (
    <div className="space-y-4 pb-8">
      {/* Hero header */}
      <div className={`rounded-2xl bg-gradient-to-br ${stageColor} p-5 text-white shadow-lg transition-all duration-300`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Fase Eliminatoria</p>
            <h1 className="text-xl font-extrabold leading-tight">{STAGE_LABELS[activeStage]}</h1>
          </div>
        </div>

        {/* Stage tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide mt-3">
          {stagesWithMatches.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeStage === stage
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {STAGE_SHORT[stage] ?? stage}
            </button>
          ))}
        </div>

        {/* Progress */}
        {totalWithTeams > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: `${(pickedCount / totalWithTeams) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-white/80 shrink-0">
              {pickedCount}/{totalWithTeams} predicciones
            </span>
          </div>
        )}
      </div>

      {/* Info banner */}
      {uid && totalWithTeams > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-3 py-2 text-xs text-blue-800 dark:text-blue-300">
          <Info className="h-3.5 w-3.5 shrink-0" />
          <span>Tocá un equipo para predecir el ganador. Las predicciones se cierran al inicio del partido.</span>
        </div>
      )}

      {stagesWithMatches.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
          <div className="text-4xl">⏳</div>
          <p className="font-bold text-lg">Fase eliminatoria próximamente</p>
          <p className="text-sm text-muted-foreground">Los partidos se cargarán una vez terminada la fase de grupos.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleMatches.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No hay partidos en esta fase aún.
            </div>
          ) : (
            visibleMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                picked={preds.get(match.id)}
                locked={isMatchLocked(match)}
                uid={uid}
                onPick={handlePick}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ── Match Card ── */
function MatchCard({
  match, picked, locked, uid, onPick,
}: {
  match: Match
  picked: string | undefined
  locked: boolean
  uid: string | null
  onPick: (match: Match, teamId: string) => void
}) {
  const finished  = match.status === 'finished'
  const hasTeams  = !!match.home_team && !!match.away_team
  const homeWon   = finished && match.home_score != null && match.away_score != null && match.home_score > match.away_score
  const awayWon   = finished && match.home_score != null && match.away_score != null && match.away_score > match.home_score
  const pickedHome = picked === match.home_team?.id
  const pickedAway = picked === match.away_team?.id
  const gotItRight = finished && hasTeams && picked && (
    (homeWon && pickedHome) || (awayWon && pickedAway)
  )

  return (
    <div className={`rounded-2xl border bg-card overflow-hidden shadow-sm transition-all ${
      gotItRight ? 'border-emerald-300 dark:border-emerald-700' : 'border-border'
    }`}>
      {/* Match meta bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Partido {match.match_number}
          </span>
          {gotItRight && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-2.5 w-2.5" /> Acertaste
            </span>
          )}
          {finished && !gotItRight && picked && (
            <span className="text-[10px] font-bold text-red-500">✗ Fallaste</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {finished ? (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              Finalizado
            </span>
          ) : locked ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              <Lock className="h-2.5 w-2.5" /> Cerrado
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatPeruDateLabel(match.match_date)} · {formatPeruTime(match.match_date)}
            </span>
          )}
        </div>
      </div>

      {/* Teams area */}
      {hasTeams ? (
        <div className="p-4">
          {finished ? (
            /* Finished match — score display */
            <div className="flex items-center gap-3">
              <FinishedTeamSide team={match.home_team!} won={homeWon} picked={pickedHome} side="left" />

              <div className="flex-shrink-0 text-center px-3">
                <div className={`text-2xl font-extrabold tabular-nums leading-none ${homeWon || awayWon ? '' : 'text-muted-foreground'}`}>
                  {match.home_score} <span className="text-muted-foreground/50">–</span> {match.away_score}
                </div>
                {!homeWon && !awayWon && (
                  <p className="text-[10px] text-muted-foreground mt-1">prórroga/penales</p>
                )}
              </div>

              <FinishedTeamSide team={match.away_team!} won={awayWon} picked={pickedAway} side="right" />
            </div>
          ) : (
            /* Upcoming match — betting buttons */
            <div className="flex items-center gap-2">
              <TeamPickButton
                team={match.home_team!}
                picked={pickedHome}
                locked={locked}
                disabled={!uid}
                side="left"
                onClick={() => onPick(match, match.home_team!.id)}
              />

              <div className="shrink-0 flex flex-col items-center gap-1">
                <span className="text-xs font-black text-muted-foreground">VS</span>
                {!locked && !picked && uid && (
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">Elegí<br/>ganador</span>
                )}
              </div>

              <TeamPickButton
                team={match.away_team!}
                picked={pickedAway}
                locked={locked}
                disabled={!uid}
                side="right"
                onClick={() => onPick(match, match.away_team!.id)}
              />
            </div>
          )}
        </div>
      ) : (
        /* TBD teams */
        <div className="p-4">
          <div className="flex items-center gap-3">
            <TBDSide />
            <div className="shrink-0">
              <span className="text-xs font-bold text-muted-foreground">VS</span>
            </div>
            <TBDSide />
          </div>
        </div>
      )}
    </div>
  )
}

function TeamPickButton({
  team, picked, locked, disabled, side, onClick,
}: {
  team: Team
  picked: boolean
  locked: boolean
  disabled: boolean
  side: 'left' | 'right'
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={locked || disabled}
      className={[
        'flex-1 flex items-center rounded-xl border-2 px-3 py-3 transition-all duration-150 min-w-0',
        side === 'left' ? 'flex-row gap-3' : 'flex-row-reverse gap-3',
        picked
          ? 'border-brand-red bg-brand-red/5 dark:bg-brand-red/10 shadow-sm scale-[1.02]'
          : locked || disabled
          ? 'border-border opacity-50 cursor-not-allowed'
          : 'border-border hover:border-brand-red/40 hover:bg-muted/30 cursor-pointer',
      ].join(' ')}
    >
      {/* Flag */}
      <span className="text-3xl shrink-0 leading-none">{team.flag_emoji}</span>

      {/* Name */}
      <div className={`min-w-0 ${side === 'right' ? 'text-right' : 'text-left'}`}>
        <p className={`text-sm font-extrabold leading-tight truncate ${picked ? 'text-brand-red' : ''}`}>
          {team.code}
        </p>
        <p className="text-[10px] text-muted-foreground truncate leading-tight">{team.name_es}</p>
      </div>

      {/* Picked indicator */}
      {picked && (
        <span className={`text-brand-red text-sm font-bold shrink-0 ${side === 'right' ? 'mr-auto' : 'ml-auto'}`}>✓</span>
      )}
    </button>
  )
}

function FinishedTeamSide({
  team, won, picked, side,
}: {
  team: Team
  won: boolean
  picked: boolean
  side: 'left' | 'right'
}) {
  return (
    <div className={[
      'flex-1 flex items-center gap-2 rounded-xl px-3 py-2 min-w-0',
      side === 'left' ? 'flex-row' : 'flex-row-reverse',
      won ? 'bg-emerald-50 dark:bg-emerald-950/20' : '',
    ].join(' ')}>
      <span className="text-2xl shrink-0 leading-none">{team.flag_emoji}</span>
      <div className={`min-w-0 ${side === 'right' ? 'text-right' : 'text-left'}`}>
        <p className={`text-sm font-extrabold truncate leading-tight ${won ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
          {team.code}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">{team.name_es}</p>
        {picked && (
          <p className={`text-[9px] font-bold leading-tight ${won ? 'text-emerald-600' : 'text-red-500'}`}>
            {won ? '✓ Tu pick' : '✗ Tu pick'}
          </p>
        )}
      </div>
    </div>
  )
}

function TBDSide() {
  return (
    <div className="flex-1 flex items-center gap-3 rounded-xl border-2 border-dashed border-muted px-3 py-3 opacity-40">
      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
      <div className="min-w-0">
        <div className="h-3 w-16 rounded bg-muted mb-1" />
        <div className="h-2.5 w-20 rounded bg-muted" />
      </div>
    </div>
  )
}
