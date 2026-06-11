'use client'

import { useState } from 'react'
import { getMemberPredictionsAction } from '../actions'
import { Modal } from '@/components/ui/modal'
import { Medal, Trophy, Target, CheckCircle2, XCircle } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'

interface Props {
  poolId: string
  memberId: string
  username: string
  children: React.ReactNode
}

interface Prediction {
  id: string
  predicted_home_score: number | null
  predicted_away_score: number | null
  predicted_outcome: string | null
  predicted_scorer_id: string | null
  predicted_scorer: { name: string; shirt_number: number | null } | null
  points_earned: number
  is_exact_score: boolean
  outcome_points: number
  exact_score_points: number
  scorer_points: number
  match: {
    id: string
    home_score: number | null
    away_score: number | null
    status: string
    match_date: string
    home_team: { name_es: string; code: string; flag_emoji: string }
    away_team: { name_es: string; code: string; flag_emoji: string }
  }
}

const OUTCOME_LABELS: Record<string, string> = {
  home: 'Local gana',
  draw: 'Empate',
  away: 'Visitante gana',
}

export function MemberPredictionsModal({ poolId, memberId, username, children }: Props) {
  const [open, setOpen] = useState(false)
  const [preds, setPreds] = useState<Prediction[] | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleOpen() {
    setOpen(true)
    if (preds !== null) return
    setLoading(true)
    const data = await getMemberPredictionsAction(poolId, memberId)
    setPreds((data as any) ?? [])
    setLoading(false)
  }

  const totalPts = preds?.reduce((s, p) => s + (p.points_earned ?? 0), 0) ?? 0
  const exactCount = preds?.filter((p) => p.is_exact_score).length ?? 0

  return (
    <>
      <button onClick={handleOpen} className="w-full block cursor-pointer">
        {children}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Predicciones de ${username}`}
        className="max-h-[85vh] overflow-y-auto"
      >

          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
              ))}
            </div>
          ) : !preds || preds.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay predicciones jugadas de partidos finalizados.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mini stats */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                  <Trophy className="mx-auto h-4 w-4 text-brand-red mb-1" />
                  <p className="text-lg font-extrabold tabular-nums">{totalPts}</p>
                  <p className="text-[10px] text-muted-foreground">puntos</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                  <Target className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
                  <p className="text-lg font-extrabold tabular-nums">
                    {preds.filter((p) => p.outcome_points > 0).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">ganador</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                  <span className="block text-base leading-none mb-1">👟</span>
                  <p className="text-lg font-extrabold tabular-nums">
                    {preds.filter((p) => p.scorer_points > 0).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">goleador</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                  <Medal className="mx-auto h-4 w-4 text-brand-gold mb-1" />
                  <p className="text-lg font-extrabold tabular-nums">{exactCount}</p>
                  <p className="text-[10px] text-muted-foreground">exactos</p>
                </div>
              </div>

              {/* Prediction list */}
              <div className="space-y-3">
                {preds.map((pred) => {
                  const homeTeam   = pred.match?.home_team
                  const awayTeam   = pred.match?.away_team
                  const actualHome = pred.match?.home_score
                  const actualAway = pred.match?.away_score
                  const pts = pred.points_earned

                  // Derive winner team for display
                  const outcomeTeam =
                    pred.predicted_outcome === 'home' ? homeTeam :
                    pred.predicted_outcome === 'away' ? awayTeam : null

                  return (
                    <div
                      key={pred.id}
                      className={`rounded-xl border overflow-hidden ${
                        pred.is_exact_score
                          ? 'border-brand-gold/40'
                          : pred.outcome_points > 0
                          ? 'border-emerald-200 dark:border-emerald-800/40'
                          : 'border-border'
                      }`}
                    >
                      {/* Match header */}
                      <div className={`flex items-center justify-between px-3 py-2 text-xs font-bold ${
                        pred.is_exact_score
                          ? 'bg-brand-gold/10'
                          : pred.outcome_points > 0
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                          : 'bg-muted/30'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <TeamFlag code={homeTeam?.flag_emoji ?? ''} label={homeTeam?.name_es ?? ''} className="h-4 w-5" />
                          <span>{homeTeam?.code ?? '?'}</span>
                          <span className="text-muted-foreground font-normal">vs</span>
                          <TeamFlag code={awayTeam?.flag_emoji ?? ''} label={awayTeam?.name_es ?? ''} className="h-4 w-5" />
                          <span>{awayTeam?.code ?? '?'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {pred.is_exact_score && <span className="text-sm">🎯</span>}
                          {pts > 0 && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                              +{pts}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 3 predictions row */}
                      <div className="grid grid-cols-3 divide-x divide-border text-xs">

                        {/* 1. Ganador / Empate */}
                        <div className="px-2.5 py-2 space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Ganador</p>
                          {pred.predicted_outcome ? (
                            <div className="flex items-center gap-1">
                              {pred.outcome_points > 0
                                ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                : <XCircle className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                              }
                              {pred.predicted_outcome === 'draw' ? (
                                <span className="font-semibold">Empate</span>
                              ) : (
                                <div className="flex items-center gap-1 min-w-0">
                                  <TeamFlag code={outcomeTeam?.flag_emoji ?? ''} label={outcomeTeam?.name_es ?? ''} className="h-3.5 w-4.5 shrink-0" />
                                  <span className="font-semibold truncate">{outcomeTeam?.code ?? '?'}</span>
                                </div>
                              )}
                              {pred.outcome_points > 0 && (
                                <span className="ml-auto shrink-0 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-70">+{pred.outcome_points}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 italic">—</span>
                          )}
                        </div>

                        {/* 2. Goleador */}
                        <div className="px-2.5 py-2 space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Goleador</p>
                          {pred.predicted_scorer ? (
                            <div className="flex items-center gap-1">
                              {pred.scorer_points > 0
                                ? <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                                : <XCircle className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                              }
                              <span className="font-semibold truncate">{pred.predicted_scorer.name}</span>
                              {pred.scorer_points > 0 && (
                                <span className="ml-auto shrink-0 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-70">+{pred.scorer_points}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 italic">—</span>
                          )}
                        </div>

                        {/* 3. Marcador exacto */}
                        <div className="px-2.5 py-2 space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Marcador</p>
                          {pred.predicted_home_score != null ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {pred.is_exact_score
                                ? <span className="text-sm leading-none">🎯</span>
                                : <XCircle className="h-3 w-3 shrink-0 text-muted-foreground/40" />
                              }
                              <span className={`font-bold tabular-nums ${pred.is_exact_score ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                {pred.predicted_home_score}–{pred.predicted_away_score}
                              </span>
                              <span className="text-muted-foreground/50 tabular-nums">
                                ({actualHome ?? '?'}–{actualAway ?? '?'})
                              </span>
                              {pred.exact_score_points > 0 && (
                                <span className="ml-auto shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-400 opacity-70">+{pred.exact_score_points}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/50 italic">—</span>
                          )}
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
      </Modal>
    </>
  )
}
