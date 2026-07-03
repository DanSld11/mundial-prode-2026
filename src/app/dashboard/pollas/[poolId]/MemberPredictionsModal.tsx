'use client'

import { useState } from 'react'
import { getMemberPredictionsAction } from '../actions'
import { Modal } from '@/components/ui/modal'
import { Medal, Trophy, Target, CheckCircle2, XCircle, Users } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'

interface Props {
  poolId: string
  memberId: string
  username: string
  children: React.ReactNode
}

interface MatchPred {
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

interface GroupPred {
  group_name: string
  position: number
  team_id: string
  points_earned: number | null
}

interface GroupResult {
  group_name: string
  position: number
  team_id: string
  scored_at: string | null
}

interface TeamInfo {
  id: string
  name_es: string
  flag_emoji: string
  code: string
}

const POS_LABELS: Record<number, string> = { 1: '1°', 2: '2°', 3: '3°' }

interface Breakdown {
  partidos: number
  grupos: number
  especiales: number
  llaves: number
  ruleta: number
  ajustes: number
  total: number
}

export function MemberPredictionsModal({ poolId, memberId, username, children }: Props) {
  const [open, setOpen] = useState(false)
  const [matchPreds, setMatchPreds] = useState<MatchPred[] | null>(null)
  const [groupPreds, setGroupPreds] = useState<GroupPred[]>([])
  const [groupResults, setGroupResults] = useState<GroupResult[]>([])
  const [teams, setTeams] = useState<TeamInfo[]>([])
  const [scoredGroupNames, setScoredGroupNames] = useState<string[]>([])
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'partidos' | 'grupos'>('partidos')

  async function handleOpen() {
    setOpen(true)
    if (matchPreds !== null) return
    setLoading(true)
    const data = await getMemberPredictionsAction(poolId, memberId) as any
    if (data) {
      setMatchPreds(data.matchPreds ?? [])
      setGroupPreds(data.groupPreds ?? [])
      setGroupResults(data.groupResults ?? [])
      setTeams(data.teams ?? [])
      setScoredGroupNames(data.scoredGroupNames ?? [])
      setBreakdown(data.breakdown ?? null)
    } else {
      setMatchPreds([])
    }
    setLoading(false)
  }

  const totalMatchPts  = matchPreds?.reduce((s, p) => s + (p.points_earned ?? 0), 0) ?? 0
  const exactCount     = matchPreds?.filter((p) => p.is_exact_score).length ?? 0
  const totalGroupPts  = groupPreds.filter(p => scoredGroupNames.includes(p.group_name)).reduce((s, p) => s + (p.points_earned ?? 0), 0)
  const totalPts       = breakdown?.total ?? (totalMatchPts + totalGroupPts)

  const fmtPts = (n: number) => (n > 0 ? `+${n}` : `${n}`)
  const breakdownRows = breakdown ? [
    { label: '⚽ Partidos', value: breakdown.partidos },
    { label: '👥 Grupos', value: breakdown.grupos },
    { label: '⭐ Especiales', value: breakdown.especiales },
    { label: '🏆 Llaves', value: breakdown.llaves },
    { label: '🎰 Ruleta', value: breakdown.ruleta },
    { label: '🛠️ Ajustes admin', value: breakdown.ajustes },
  ].filter(r => r.value !== 0) : []

  // Build group scoring summary
  const scoredGroups = scoredGroupNames.map(gName => {
    const preds = groupPreds.filter(p => p.group_name === gName)
    const results = groupResults.filter(r => r.group_name === gName)
    const officialMap: Record<number, string> = {}
    for (const r of results) officialMap[r.position] = r.team_id
    const predMap: Record<number, { team_id: string; pts: number | null }> = {}
    for (const p of preds) predMap[p.position] = { team_id: p.team_id, pts: p.points_earned ?? null }
    const groupTotal = preds.reduce((s, p) => s + (p.points_earned ?? 0), 0)
    return { gName, officialMap, predMap, groupTotal, hasPreds: preds.length > 0 }
  }).sort((a, b) => a.gName.localeCompare(b.gName))

  return (
    <>
      <button onClick={handleOpen} className="w-full block cursor-pointer">
        {children}
      </button>

      <Modal
        open={open}
        onClose={() => { setOpen(false); setMatchPreds(null) }}
        title={`Predicciones de ${username}`}
        className="max-h-[85vh] overflow-y-auto"
      >
        {loading ? (
          <div className="space-y-2 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mini stats */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                <Trophy className="mx-auto h-4 w-4 text-brand-red mb-1" />
                <p className="text-lg font-extrabold tabular-nums">{totalPts}</p>
                <p className="text-[10px] text-muted-foreground">total pts</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                <Target className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
                <p className="text-lg font-extrabold tabular-nums">
                  {matchPreds?.filter((p) => p.outcome_points > 0).length ?? 0}
                </p>
                <p className="text-[10px] text-muted-foreground">ganador</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                <Medal className="mx-auto h-4 w-4 text-brand-gold mb-1" />
                <p className="text-lg font-extrabold tabular-nums">{exactCount}</p>
                <p className="text-[10px] text-muted-foreground">exactos</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-2.5 text-center">
                <Users className="mx-auto h-4 w-4 text-blue-500 mb-1" />
                <p className="text-lg font-extrabold tabular-nums">{totalGroupPts}</p>
                <p className="text-[10px] text-muted-foreground">grupos</p>
              </div>
            </div>

            {/* Desglose de puntos por fuente */}
            {breakdown && breakdownRows.length > 0 && (
              <div className="rounded-xl border bg-muted/20 overflow-hidden">
                <div className="px-3 py-2 border-b bg-muted/30">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Desglose de puntos</p>
                </div>
                <div className="divide-y divide-border/60">
                  {breakdownRows.map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-1.5 text-xs">
                      <span className="font-medium">{label}</span>
                      <span className={`font-extrabold tabular-nums ${value > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {fmtPts(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2 text-xs bg-muted/30">
                    <span className="font-bold">Total</span>
                    <span className="font-extrabold tabular-nums">{breakdown.total} pts</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl border bg-muted/40 p-1">
              {(['partidos', 'grupos'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all capitalize ${
                    tab === t ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'partidos' ? `Partidos (${matchPreds?.length ?? 0})` : `Grupos (${scoredGroups.length})`}
                </button>
              ))}
            </div>

            {/* Partidos tab */}
            {tab === 'partidos' && (
              !matchPreds || matchPreds.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Aún no hay predicciones de partidos finalizados.
                </div>
              ) : (
                <div className="space-y-3">
                  {matchPreds.map((pred) => {
                    const homeTeam   = pred.match?.home_team
                    const awayTeam   = pred.match?.away_team
                    const actualHome = pred.match?.home_score
                    const actualAway = pred.match?.away_score
                    const pts = pred.points_earned
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

                        <div className="grid grid-cols-3 divide-x divide-border text-xs">
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
              )
            )}

            {/* Grupos tab */}
            {tab === 'grupos' && (
              scoredGroups.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Aún no se ha puntuado ningún grupo.
                </div>
              ) : (
                <div className="space-y-3">
                  {scoredGroups.map(({ gName, officialMap, predMap, groupTotal, hasPreds }) => (
                    <div key={gName} className="rounded-xl border border-border overflow-hidden">
                      {/* Group header */}
                      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
                        <span className="text-xs font-extrabold uppercase tracking-wider">Grupo {gName}</span>
                        {hasPreds ? (
                          <span className={`text-xs font-extrabold tabular-nums ${groupTotal > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                            {groupTotal > 0 ? `+${groupTotal} pts` : '0 pts'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">sin predicción</span>
                        )}
                      </div>

                      {/* Per-position rows */}
                      <div className="divide-y divide-border">
                        {[1, 2, 3].map(pos => {
                          const officialTeam = teams.find(t => t.id === officialMap[pos])
                          const userPred = predMap[pos]
                          const userTeam = teams.find(t => t.id === userPred?.team_id)
                          const pts = userPred?.pts ?? null
                          const isCorrect = pts != null && pts > 0

                          return (
                            <div key={pos} className="flex items-center gap-2 px-3 py-2 text-xs">
                              <span className="w-5 shrink-0 font-bold text-muted-foreground">{POS_LABELS[pos]}</span>

                              {/* Official */}
                              {officialTeam ? (
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  <TeamFlag code={officialTeam.flag_emoji} label={officialTeam.name_es} className="h-3.5 w-5 shrink-0" />
                                  <span className="font-medium truncate">{officialTeam.name_es}</span>
                                </div>
                              ) : (
                                <span className="flex-1 text-muted-foreground/40 italic text-[10px]">—</span>
                              )}

                              {/* User prediction result */}
                              {userPred ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  {isCorrect
                                    ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    : <XCircle className="h-3 w-3 text-zinc-400 dark:text-zinc-600" />
                                  }
                                  <span className={`font-semibold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                                    {userTeam?.code ?? '?'}
                                  </span>
                                  {isCorrect && pts != null && (
                                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">+{pts}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="shrink-0 text-[10px] text-muted-foreground/40 italic">no apostó</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Grand total groups */}
                  <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-950/30 px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">Total pronósticos de grupos</span>
                    <span className="text-base font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">
                      {totalGroupPts > 0 ? `+${totalGroupPts}` : totalGroupPts} pts
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
