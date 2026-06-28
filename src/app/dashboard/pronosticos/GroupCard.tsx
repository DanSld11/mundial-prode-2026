'use client'

import { useState, useTransition } from 'react'
import { Loader2, Lock, CheckCircle2, XCircle } from 'lucide-react'
import { saveGroupPredictionAction } from './actions'
import { toast } from 'sonner'
import { TeamFlag } from '@/components/team-flag'

interface Team {
  id: string
  name_es: string
  flag_emoji: string
  code: string
  group_name: string
}

interface GroupPred {
  group_name: string
  position: number
  team_id: string
  points_earned?: number | null
}

interface OfficialResult {
  group_name: string
  position: number
  team_id: string
  scored_at?: string | null
}

interface Props {
  groupName: string
  teams: Team[]
  predictions: GroupPred[]
  locked: boolean
  officialResults: OfficialResult[]
  isScored: boolean
}

const POS_STYLE: Record<number, string> = {
  1: 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950 border-yellow-400 shadow-yellow-400/30',
  2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 border-slate-400 shadow-slate-400/20',
  3: 'bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950 border-orange-400 shadow-orange-400/30',
}

const POS_LABELS: Record<number, string> = { 1: '1°', 2: '2°', 3: '3°' }

export default function GroupCard({ groupName, teams, predictions, locked, officialResults, isScored }: Props) {
  const initial: Record<number, string> = {}
  for (const p of predictions) initial[p.position] = p.team_id

  const [selected, setSelected] = useState<Record<number, string>>(initial)
  const [saving, setSaving] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function posOfTeam(teamId: string): number {
    const entry = Object.entries(selected).find(([, tid]) => tid === teamId)
    return entry ? Number(entry[0]) : 0
  }

  async function handleClick(pos: number, teamId: string) {
    if (locked) return
    const currentPosOfTeam = posOfTeam(teamId)
    const currentTeamAtPos = selected[pos]

    if (currentPosOfTeam === pos) {
      const prev = { ...selected }
      setSelected(s => { const n = { ...s }; delete n[pos]; return n })
      setSaving(`${pos}-${teamId}`)
      const res = await saveGroupPredictionAction(groupName, pos, null)
      setSaving(null)
      if (res?.error) { toast.error(res.error); setSelected(prev) }
      return
    }

    const next = { ...selected }
    if (currentPosOfTeam) {
      delete next[currentPosOfTeam]
      await saveGroupPredictionAction(groupName, currentPosOfTeam, null)
    }
    if (currentTeamAtPos) delete next[pos]

    next[pos] = teamId
    setSelected(next)
    setSaving(`${pos}-${teamId}`)
    const res = await saveGroupPredictionAction(groupName, pos, teamId)
    setSaving(null)
    if (res?.error) {
      toast.error(res.error)
      setSelected({ ...selected })
    }
  }

  // Build official result map: position → team_id
  const officialMap: Record<number, string> = {}
  for (const r of officialResults) officialMap[r.position] = r.team_id

  // Build prediction map: position → {team_id, points_earned}
  const predMap: Record<number, { team_id: string; points_earned: number | null }> = {}
  for (const p of predictions) predMap[p.position] = { team_id: p.team_id, points_earned: p.points_earned ?? null }

  // Total points this user earned in this group
  const totalGroupPoints = predictions.reduce((s, p) => s + (p.points_earned ?? 0), 0)
  const hasAnyGroupPred = predictions.length > 0

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-muted/40 dark:bg-zinc-800/60">
        <h3 className="font-extrabold text-sm tracking-widest text-foreground uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
          Grupo {groupName}
        </h3>
        <div className="flex items-center gap-2">
          {isScored && hasAnyGroupPred && totalGroupPoints > 0 && (
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">
              +{totalGroupPoints} pts
            </span>
          )}
          {locked && <Lock className="h-3 w-3 text-amber-500" />}
          <div className="flex gap-1 text-[10px] font-bold text-muted-foreground">
            <span className="w-7 text-center">1°</span>
            <span className="w-7 text-center">2°</span>
            <span className="w-7 text-center">3°</span>
          </div>
        </div>
      </div>

      {/* Team rows */}
      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        {teams.map(team => {
          const assignedPos = posOfTeam(team.id)
          return (
            <div
              key={team.id}
              className={[
                'flex items-center gap-3 px-4 py-2.5 transition-colors',
                assignedPos
                  ? 'bg-emerald-50 dark:bg-emerald-950/30'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
              ].join(' ')}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <TeamFlag code={team.flag_emoji} label={team.name_es} className="h-5 w-7 shrink-0" />
                <span className="text-sm font-medium truncate text-zinc-900 dark:text-zinc-100">{team.name_es}</span>
              </div>

              <div className="flex gap-1 shrink-0">
                {[1, 2, 3].map(pos => {
                  const isThis = assignedPos === pos
                  const isSavingThis = saving === `${pos}-${team.id}`
                  const takenByOther = selected[pos] && selected[pos] !== team.id

                  return (
                    <button
                      key={pos}
                      type="button"
                      disabled={locked}
                      onClick={() => handleClick(pos, team.id)}
                      title={isThis ? `Quitar de ${pos}°` : `Poner en ${pos}°`}
                      className={[
                        'w-7 h-7 rounded-lg text-[11px] font-extrabold border transition-all shadow-sm',
                        locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                        isSavingThis ? 'opacity-60' : '',
                        isThis
                          ? POS_STYLE[pos]
                          : takenByOther
                            ? 'opacity-25 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 border-zinc-300 dark:border-zinc-600'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                      ].join(' ')}
                    >
                      {isSavingThis
                        ? <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                        : `${pos}°`}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scored results panel */}
      {isScored && (
        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Resultado oficial
          </p>
          <div className="space-y-1.5">
            {[1, 2, 3].map(pos => {
              const officialTeamId = officialMap[pos]
              const officialTeam = teams.find(t => t.id === officialTeamId)
              const userPred = predMap[pos]
              const userTeam = teams.find(t => t.id === userPred?.team_id)
              const pts = userPred?.points_earned ?? null
              const isCorrect = pts != null && pts > 0

              return (
                <div key={pos} className="flex items-center gap-2 text-xs">
                  <span className="w-5 shrink-0 font-bold text-muted-foreground">{POS_LABELS[pos]}</span>

                  {/* Official team */}
                  {officialTeam ? (
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <TeamFlag code={officialTeam.flag_emoji} label={officialTeam.name_es} className="h-3.5 w-5 shrink-0" />
                      <span className="font-medium truncate">{officialTeam.name_es}</span>
                    </div>
                  ) : (
                    <span className="flex-1 text-muted-foreground/50 italic text-[10px]">sin definir</span>
                  )}

                  {/* User prediction vs official */}
                  {userPred ? (
                    <div className="flex items-center gap-1 shrink-0">
                      {isCorrect
                        ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        : <XCircle className="h-3 w-3 text-zinc-400 dark:text-zinc-600" />
                      }
                      <span className={`font-semibold text-[11px] ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                        {userTeam?.code ?? '?'}
                      </span>
                      {isCorrect && pts != null && (
                        <span className="font-extrabold text-[11px] text-emerald-600 dark:text-emerald-400">+{pts}</span>
                      )}
                    </div>
                  ) : (
                    <span className="shrink-0 text-[10px] text-muted-foreground/40 italic">—</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Group total */}
          {hasAnyGroupPred && (
            <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Tu total en este grupo</span>
              <span className={`text-sm font-extrabold tabular-nums ${totalGroupPoints > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {totalGroupPoints > 0 ? `+${totalGroupPoints} pts` : '0 pts'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
