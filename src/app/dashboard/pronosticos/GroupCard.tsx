'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
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
}

interface Props {
  groupName: string
  teams: Team[]
  predictions: GroupPred[]
  locked: boolean
}

const POSITION_LABELS: Record<number, string> = {
  1: '1°',
  2: '2°',
  3: '3°',
}

/* ─── Custom flag dropdown ─────────────────────────────────────────────── */
interface FlagSelectProps {
  teams: Team[]
  value: string
  allSelected: Record<number, string>
  pos: number
  disabled: boolean
  onChange: (teamId: string) => void
}

function FlagSelect({ teams, value, allSelected, pos, disabled, onChange }: FlagSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const chosen = teams.find(t => t.id === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 rounded-xl border border-border bg-background text-foreground px-3 text-sm font-medium flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50 transition-colors hover:bg-muted/30 dark:bg-muted/20"
      >
        {chosen ? (
          <>
            <TeamFlag code={chosen.flag_emoji} label={chosen.name_es} className="h-4 w-6 shrink-0" />
            <span className="truncate flex-1 text-left">{chosen.name_es}</span>
          </>
        ) : (
          <span className="flex-1 text-left text-muted-foreground">— Elegir equipo —</span>
        )}
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown list */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-popover border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Clear option */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="w-full px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted text-left transition-colors"
          >
            — Elegir equipo —
          </button>
          <div className="divide-y divide-border/40">
            {teams.map(t => {
              const usedAt = Object.entries(allSelected).find(
                ([p, tid]) => tid === t.id && Number(p) !== pos
              )
              const isSelected = value === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={!!usedAt}
                  onClick={() => { if (!usedAt) { onChange(t.id); setOpen(false) } }}
                  className={[
                    'w-full px-3 py-2.5 text-sm flex items-center gap-2.5 text-left transition-colors',
                    usedAt ? 'opacity-40 cursor-not-allowed' : 'hover:bg-muted cursor-pointer',
                    isSelected ? 'bg-brand-red/10 font-semibold' : '',
                  ].join(' ')}
                >
                  <TeamFlag code={t.flag_emoji} label={t.name_es} className="h-4 w-6 shrink-0" />
                  <span className="truncate flex-1">{t.name_es}</span>
                  {usedAt && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      ya en {POSITION_LABELS[Number(usedAt[0])]}
                    </span>
                  )}
                  {isSelected && !usedAt && (
                    <Check className="h-3.5 w-3.5 text-brand-red shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── GroupCard ────────────────────────────────────────────────────────── */
export default function GroupCard({ groupName, teams, predictions, locked }: Props) {
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

  return (
    <div className="rounded-3xl border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-brand-red/10" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-border bg-muted/40">
        <h3 className="font-extrabold text-sm tracking-widest text-foreground uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-red" />
          Grupo {groupName}
        </h3>
        <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
          {teams.length} equipos
        </span>
      </div>

      {/* Positions */}
      <div className="divide-y divide-border/50 relative z-10">
        {[1, 2, 3].map(pos => {
          const chosen = teams.find(t => t.id === selected[pos])
          const isSaving = saving === pos

          return (
            <div key={pos} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors">
              {/* Position badge */}
              <span className={[
                'w-9 h-9 flex items-center justify-center rounded-xl text-sm font-extrabold shrink-0 shadow-md border border-white/10',
                pos === 1 ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 text-yellow-950 shadow-yellow-500/20'
                  : pos === 2 ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-slate-400/20'
                  : 'bg-gradient-to-br from-orange-300 via-orange-400 to-orange-600 text-orange-950 shadow-orange-500/20',
              ].join(' ')}>
                {pos}°
              </span>

              {/* Selector */}
              <div className="flex-1 min-w-0">
                {locked ? (
                  <div className="flex items-center gap-2.5 text-sm font-semibold bg-muted/50 px-3 py-2 rounded-xl border border-border">
                    {chosen ? (
                      <>
                        <TeamFlag code={chosen.flag_emoji} label={chosen.name_es} className="h-4 w-6 shrink-0" />
                        <span className="truncate">{chosen.name_es}</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Sin seleccionar</span>
                    )}
                  </div>
                ) : (
                  <FlagSelect
                    teams={teams}
                    value={selected[pos] ?? ''}
                    allSelected={selected}
                    pos={pos}
                    disabled={locked}
                    onChange={(teamId) => handleChange(pos, teamId)}
                  />
                )}
              </div>

              {/* Saving indicator */}
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
