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
    // Prevent selecting a team already used in another position
    const alreadyAt = Object.entries(selected).find(
      ([pos, tid]) => tid === teamId && Number(pos) !== position
    )
    if (alreadyAt) {
      toast.error(`${teams.find(t => t.id === teamId)?.name_es} ya está en la posición ${POSITION_LABELS[Number(alreadyAt[0])]}`)
      return
    }

    const prev = selected[position]
    setSelected(s => ({ ...s, [position]: teamId }))
    setSaving(position)

    const res = await saveGroupPredictionAction(groupName, position, teamId || null)
    setSaving(null)

    if (res?.error) {
      toast.error(res.error)
      setSelected(s => ({ ...s, [position]: prev }))
    }
  }

  async function handleClear(position: number) {
    setSelected(s => { const n = { ...s }; delete n[position]; return n })
    setSaving(position)
    await saveGroupPredictionAction(groupName, position, null)
    setSaving(null)
  }

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <h3 className="font-bold text-sm tracking-wide text-muted-foreground uppercase">
          Grupo {groupName}
        </h3>
        <span className="text-xs text-muted-foreground">{teams.length} equipos</span>
      </div>

      {/* Positions */}
      <div className="divide-y">
        {[1, 2, 3].map(pos => {
          const chosen = teams.find(t => t.id === selected[pos])
          const isSaving = saving === pos

          return (
            <div key={pos} className="flex items-center gap-3 px-4 py-3">
              {/* Position badge */}
              <span className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0
                bg-brand-red/10 text-brand-red">
                {POSITION_LABELS[pos]}
              </span>

              {/* Select */}
              <div className="flex-1 min-w-0">
                {locked ? (
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {chosen
                      ? <><span>{chosen.flag_emoji}</span><span>{chosen.name_es}</span></>
                      : <span className="text-muted-foreground italic">Sin seleccionar</span>}
                  </div>
                ) : (
                  <select
                    disabled={locked}
                    value={selected[pos] ?? ''}
                    onChange={e => handleChange(pos, e.target.value)}
                    className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50"
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
