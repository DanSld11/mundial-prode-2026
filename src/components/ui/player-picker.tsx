'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, ChevronDown } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'

interface Player {
  id: string
  name: string
  shirt_number?: number | null
  position?: string | null
  team?: {
    id: string
    name_es: string
    code: string
    flag_emoji: string
  } | null
}

interface PlayerPickerProps {
  players: Player[]
  value: string            // selected player id
  onChange: (id: string) => void
  disabled?: boolean
  placeholder?: string
}

const POSITION_ORDER = ['ARQ', 'DEF', 'MED', 'DEL']
const POSITION_LABELS: Record<string, string> = {
  ARQ: 'Arqueros',
  GK:  'Arqueros',
  DEF: 'Defensas',
  MED: 'Mediocampistas',
  MID: 'Mediocampistas',
  DEL: 'Delanteros',
}

export function PlayerPicker({
  players,
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar jugador...',
}: PlayerPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selected = players.find((p) => p.id === value)

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Auto-focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10)
  }, [open])

  // Filter players by query
  const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const q = normalise(query)
  const filtered = q
    ? players.filter((p) =>
        normalise(p.name).includes(q) ||
        normalise(p.team?.name_es ?? '').includes(q) ||
        normalise(p.team?.code ?? '').includes(q)
      )
    : players

  // Group by team when not searching; group by position when searching
  type Group = { label: string; flag?: string; players: Player[] }
  let groups: Group[] = []

  if (!q) {
    // Group by team — home first (first half), away second (second half)
    const teamOrder: string[] = []
    const byTeam: Record<string, Player[]> = {}
    for (const p of filtered) {
      const key = p.team?.name_es ?? 'Sin equipo'
      if (!byTeam[key]) { byTeam[key] = []; teamOrder.push(key) }
      byTeam[key].push(p)
    }
    groups = teamOrder.map((teamName) => ({
      label: teamName,
      flag: byTeam[teamName][0]?.team?.flag_emoji,
      players: byTeam[teamName].sort((a, b) => (a.shirt_number ?? 99) - (b.shirt_number ?? 99)),
    }))
  } else {
    // When searching: show one flat list sorted by relevance
    groups = [{ label: '', players: filtered.sort((a, b) => (a.shirt_number ?? 99) - (b.shirt_number ?? 99)) }]
  }

  function select(id: string) {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          'flex h-10 w-full items-center gap-2 rounded-lg border bg-background px-3 text-sm transition-colors',
          disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-muted-foreground/40',
          open ? 'border-brand-red ring-2 ring-brand-red/20' : '',
        ].join(' ')}
      >
        {selected ? (
          <>
            {selected.team && <TeamFlag code={selected.team.flag_emoji} label={selected.team.name_es} />}
            {selected.shirt_number != null && (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{selected.shirt_number}</span>
            )}
            <span className="flex-1 truncate text-left font-semibold">{selected.name}</span>
            {selected.team && (
              <span className="shrink-0 text-xs text-muted-foreground">{selected.team.code}</span>
            )}
            {!disabled && (
              <span onClick={clear} className="ml-1 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
          </>
        ) : (
          <>
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left text-muted-foreground">{placeholder}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border bg-card shadow-xl">
          {/* Search input */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nombre, equipo..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            {query && (
              <button onClick={() => setQuery('')} className="rounded-full p-0.5 hover:bg-muted">
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Clear selection option */}
          {value && (
            <button
              type="button"
              onClick={() => select('')}
              className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
            >
              <X className="h-3.5 w-3.5" />
              Sin goleador
            </button>
          )}

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                Sin resultados para "{query}"
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label || 'search'}>
                  {group.label && (
                    <div className="sticky top-0 flex items-center gap-1.5 bg-muted/60 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                      {group.flag && <TeamFlag code={group.flag} label={group.label} />}
                      {group.label}
                    </div>
                  )}
                  {group.players.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => select(p.id)}
                      className={[
                        'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/50',
                        p.id === value ? 'bg-brand-red/10 font-semibold text-brand-red' : '',
                      ].join(' ')}
                    >
                      {p.shirt_number != null && (
                        <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{p.shirt_number}</span>
                      )}
                      <span className="flex-1 truncate text-left">{p.name}</span>
                      {p.position && (
                        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          p.position === 'GK'  || p.position === 'ARQ' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
                          p.position === 'DEF' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          p.position === 'MID' || p.position === 'MED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          'bg-brand-red/10 text-brand-red'
                        }`}>
                          {p.position === 'GK' ? 'ARQ' : p.position === 'MID' ? 'MED' : p.position}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
