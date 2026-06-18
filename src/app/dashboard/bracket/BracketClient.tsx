'use client'

import { useState, useTransition } from 'react'
import { saveBracketPrediction, STAGE_LABELS, STAGE_ORDER } from './actions'
import { formatPeruDateLabel, formatPeruTime } from '@/lib/peru-time'
import { Trophy, Lock, Info, CheckCircle2 } from 'lucide-react'
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
  round_of_32: '32vos',
  round_of_16: 'Octavos',
  quarterfinal: 'Cuartos',
  semifinal: 'Semis',
  third_place: '3er Puesto',
  final: 'Final',
}

export default function BracketClient({ uid, matches, predictions: initialPreds }: Props) {
  const [preds, setPreds] = useState<Map<string, string>>(
    new Map(initialPreds.map((p) => [p.slot_key, p.team_id])),
  )
  const [activeStage, setActiveStage] = useState<string>(() => {
    // Default to the first stage that has matches
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

    // Optimistic update
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
        // Revert
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

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Bracket Eliminatorio</h1>
            <p className="text-sm text-muted-foreground">Predice el ganador de cada partido</p>
          </div>
        </div>
      </div>

      {/* Info */}
      {uid && (
        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-xs text-blue-800 dark:text-blue-300">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Seleccioná el equipo que creés que ganará cada partido. Las predicciones se cierran cuando el partido empieza.</span>
        </div>
      )}

      {stagesWithMatches.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center space-y-2">
          <p className="font-semibold text-lg">Fase eliminatoria próximamente</p>
          <p className="text-sm text-muted-foreground">Los partidos se cargarán una vez terminada la fase de grupos.</p>
        </div>
      ) : (
        <>
          {/* Stage Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {stagesWithMatches.map((stage) => (
              <button
                key={stage}
                onClick={() => setActiveStage(stage)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  activeStage === stage
                    ? 'bg-brand-red text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                {STAGE_SHORT[stage] ?? stage}
              </button>
            ))}
          </div>

          {/* Stage label */}
          <h2 className="text-lg font-bold">{STAGE_LABELS[activeStage]}</h2>

          {/* Matches */}
          <div className="space-y-3">
            {visibleMatches.map((match) => {
              const locked = isMatchLocked(match)
              const picked = preds.get(match.id)
              const finished = match.status === 'finished'
              const hasTeams = !!match.home_team && !!match.away_team

              return (
                <div
                  key={match.id}
                  className="rounded-xl border bg-card overflow-hidden shadow-sm"
                >
                  {/* Match header */}
                  <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Partido {match.match_number}
                    </span>
                    <div className="flex items-center gap-2">
                      {finished ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Finalizado
                        </span>
                      ) : locked ? (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Lock className="h-2.5 w-2.5" /> Cerrado
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {formatPeruDateLabel(match.match_date)} · {formatPeruTime(match.match_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="px-4 py-3">
                    {finished && hasTeams ? (
                      /* Finished: show score */
                      <div className="flex items-center justify-between gap-2">
                        <TeamDisplay team={match.home_team!} picked={picked === match.home_team!.id} winner={match.home_score! > match.away_score!} />
                        <div className="text-center shrink-0">
                          <span className="font-bold text-lg tabular-nums">
                            {match.home_score} – {match.away_score}
                          </span>
                          {picked && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {picked === match.home_team!.id || picked === match.away_team!.id
                                ? picked === (match.home_score! > match.away_score! ? match.home_team!.id : match.away_team!.id)
                                  ? '✅ Acertaste'
                                  : '❌ Fallaste'
                                : ''}
                            </p>
                          )}
                        </div>
                        <TeamDisplay team={match.away_team!} picked={picked === match.away_team!.id} winner={match.away_score! > match.home_score!} />
                      </div>
                    ) : hasTeams ? (
                      /* Upcoming: clickable team buttons */
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePick(match, match.home_team!.id)}
                          disabled={locked || !uid}
                          className={`flex-1 flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                            picked === match.home_team!.id
                              ? 'border-brand-red bg-brand-red/10 text-brand-red font-bold shadow-sm'
                              : locked || !uid
                              ? 'opacity-50 cursor-not-allowed border-border'
                              : 'hover:border-brand-red/40 hover:bg-muted/40 border-border'
                          }`}
                        >
                          <span className="text-lg">{match.home_team!.flag_emoji}</span>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold truncate">{match.home_team!.code}</p>
                            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{match.home_team!.name_es}</p>
                          </div>
                          {picked === match.home_team!.id && <span className="ml-auto text-brand-red">✓</span>}
                        </button>

                        <span className="shrink-0 text-xs font-bold text-muted-foreground">VS</span>

                        <button
                          onClick={() => handlePick(match, match.away_team!.id)}
                          disabled={locked || !uid}
                          className={`flex-1 flex items-center gap-2 rounded-lg border px-3 py-2 transition-all ${
                            picked === match.away_team!.id
                              ? 'border-brand-red bg-brand-red/10 text-brand-red font-bold shadow-sm'
                              : locked || !uid
                              ? 'opacity-50 cursor-not-allowed border-border'
                              : 'hover:border-brand-red/40 hover:bg-muted/40 border-border'
                          }`}
                        >
                          <span className="text-lg">{match.away_team!.flag_emoji}</span>
                          <div className="min-w-0 text-left">
                            <p className="text-xs font-bold truncate">{match.away_team!.code}</p>
                            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">{match.away_team!.name_es}</p>
                          </div>
                          {picked === match.away_team!.id && <span className="ml-auto text-brand-red">✓</span>}
                        </button>
                      </div>
                    ) : (
                      /* Teams TBD */
                      <div className="flex items-center gap-2">
                        <TBDTeam />
                        <span className="shrink-0 text-xs font-bold text-muted-foreground">VS</span>
                        <TBDTeam />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function TeamDisplay({ team, picked, winner }: { team: Team; picked: boolean; winner: boolean }) {
  return (
    <div className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-2 ${winner ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
      <span className="text-2xl">{team.flag_emoji}</span>
      <span className={`text-xs font-bold ${picked ? 'text-brand-red' : ''}`}>{team.code}</span>
      {picked && <span className="text-[9px] font-semibold text-brand-red">Tu pick</span>}
    </div>
  )
}

function TBDTeam() {
  return (
    <div className="flex-1 flex items-center gap-2 rounded-lg border border-dashed border-muted px-3 py-2 opacity-50">
      <div className="h-6 w-6 rounded-full bg-muted" />
      <span className="text-xs text-muted-foreground">Por definir</span>
    </div>
  )
}
