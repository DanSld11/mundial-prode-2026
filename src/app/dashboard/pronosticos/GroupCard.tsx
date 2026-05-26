'use client'

import { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { saveGroupPredictionAction } from './actions'
import { toast } from 'sonner'

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
}

interface Props {
  groupName: string
  teams: Team[]          // only the 3 teams of this group
  predictions: GroupPred[]
  locked: boolean
}

const POSITION_LABELS: Record<number, string> = {
  1: '1°',
  2: '2°',
  3: '3°',
}

export default function GroupCard({ groupName, teams, predictions, locked }: Props) {
  // Build initial state: position → teamId
  const initial: Record<number, string> = {}
  for (const p of predictions) initial[p.position] = p.team_id

  const [selected, setSelected] = useState<Record<number, string>>(initial)
  const [saving, setSaving] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  async function handleChange(position: number, teamId: string) {
    if (teamId !== '') {
      const alreadyAt = Object.entries(selected).find(
        ([pos, tid]) => tid === teamId && Number(pos) !== position
      )
      if (alreadyAt) {
        toast.error(`${teams.find(t => t.id === teamId)?.name_es} ya está en la posición ${POSITION_LABELS[Number(alreadyAt[0])]}`)
        return
      }
    }

    const prev = selected[position]
    
    if (teamId === '') {
      setSelected(s => { const n = { ...s }; delete n[position]; return n })
    } else {
      setSelected(s => ({ ...s, [position]: teamId }))
    }
    
    setSaving(position)

    const res = await saveGroupPredictionAction(groupName, position, teamId || null)
    setSaving(null)

    if (res?.error) {
      toast.error(res.error)
      if (prev) {
        setSelected(s => ({ ...s, [position]: prev }))
      } else {
        setSelected(s => { const n = { ...s }; delete n[position]; return n })
      }
    }
  }

  async function handleClear(position: number) {
    setSelected(s => { const n = { ...s }; delete n[position]; return n })
    setSaving(position)
    await saveGroupPredictionAction(groupName, position, null)
    setSaving(null)
  }

  return (
    <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-brand-red/10"></div>
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent">
        <h3 className="font-extrabold text-sm tracking-widest text-foreground uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-red"></span>
          Grupo {groupName}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-md border border-border/50 backdrop-blur-sm">
          {teams.length} equipos
        </span>
      </div>

      {/* Positions */}
      <div className="divide-y divide-border/30 relative z-10">
        {[1, 2, 3].map(pos => {
          const chosen = teams.find(t => t.id === selected[pos])
          const isSaving = saving === pos

          return (
            <div key={pos} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              {/* Position badge */}
              <span className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-extrabold shrink-0 shadow-md border border-white/10
                ${pos === 1 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-950 shadow-yellow-500/20' 
                : pos === 2 ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-slate-400/20' 
                : 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-orange-950 shadow-orange-500/20'}`}>
                {pos}°
              </span>

              {/* Select */}
              <div className="flex-1 min-w-0">
                {locked ? (
                  <div className="flex items-center gap-3 text-sm font-semibold bg-background/50 px-3 py-2 rounded-xl border border-border/50">
                    {chosen
                      ? <><span className="text-lg">{chosen.flag_emoji}</span><span>{chosen.name_es}</span></>
                      : <span className="text-muted-foreground italic">Sin seleccionar</span>}
                  </div>
                ) : (
                  <select
                    disabled={locked}
                    value={selected[pos] ?? ''}
                    onChange={e => handleChange(pos, e.target.value)}
                    className="w-full h-11 rounded-xl border border-border/50 bg-background/80 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50 transition-all hover:bg-background cursor-pointer appearance-none shadow-sm"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.6rem center', backgroundSize: '0.9em' }}
                  >
                    <option value="">— Elegir equipo —</option>
                    {teams.map(t => {
                      const usedAt = Object.entries(selected).find(
                        ([p, tid]) => tid === t.id && Number(p) !== pos
                      )
                      return (
                        <option key={t.id} value={t.id} disabled={!!usedAt}>
                          {t.flag_emoji} {t.name_es}{usedAt ? ` (en ${POSITION_LABELS[Number(usedAt[0])]})` : ''}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>

              {/* Status indicator */}
              <div className="w-6 shrink-0 flex items-center justify-center">
                {isSaving
                  ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  : chosen && !locked
                    ? <Check className="h-4 w-4 text-emerald-500" />
                    : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
