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
  points_earned: number
  is_exact_score: boolean
  outcome_points: number
  exact_score_points: number
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
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border bg-muted/30 p-3 text-center">
                  <Trophy className="mx-auto h-4 w-4 text-brand-red mb-1" />
                  <p className="text-lg font-extrabold tabular-nums">{totalPts}</p>
                  <p className="text-[10px] text-muted-foreground">puntos</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3 text-center">
                  <Target className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
                  <p className="text-lg font-extrabold tabular-nums">
                    {preds.filter((p) => p.outcome_points > 0).length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">aciertos</p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-3 text-center">
                  <Medal className="mx-auto h-4 w-4 text-brand-gold mb-1" />
                  <p className="text-lg font-extrabold tabular-nums">{exactCount}</p>
                  <p className="text-[10px] text-muted-foreground">exactos</p>
                </div>
              </div>

              {/* Prediction list */}
              <div className="space-y-2">
                {preds.map((pred) => {
                  const home = pred.match?.home_team?.code ?? '?'
                  const away = pred.match?.away_team?.code ?? '?'
                  const actualHome = pred.match?.home_score
                  const actualAway = pred.match?.away_score
                  const isCorrect = pred.outcome_points > 0
                  const pts = pred.points_earned

                  return (
                    <div
                      key={pred.id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                        pred.is_exact_score
                          ? 'border-brand-gold/40 bg-brand-gold/5'
                          : isCorrect
                          ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20'
                          : 'border-border bg-muted/20'
                      }`}
                    >
                      <div className="shrink-0">
                        {pred.is_exact_score ? (
                          <span className="text-base">🎯</span>
                        ) : isCorrect ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/50" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">
                          {home} vs {away}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Predijo: {pred.predicted_home_score ?? '?'}–{pred.predicted_away_score ?? '?'}
                          {' · '}
                          Real: {actualHome ?? '?'}–{actualAway ?? '?'}
                        </p>
                      </div>

                      {pts > 0 && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          +{pts}
                        </span>
                      )}
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
