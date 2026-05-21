'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react'
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
  value: string
  onChange: (id: string) => void
  disabled?: boolean
  placeholder?: string
}

function positionBadgeClass(pos: string | null | undefined) {
  if (!pos) return 'bg-muted text-muted-foreground'
  const p = pos.toUpperCase()
  if (p === 'GK' || p === 'ARQ') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
  if (p === 'DEF') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  if (p === 'MID' || p === 'MED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
}
function positionLabel(pos: string | null | undefined) {
  if (!pos) return ''
  const p = pos.toUpperCase()
  if (p === 'GK') return 'ARQ'
  if (p === 'MID') return 'MED'
  return p
}

export function PlayerPicker({
  players,
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar goleador...',
}: PlayerPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUp: false })

  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setMounted(true) }, [])

  // Close on outside click or scroll
  useEffect(() => {
    if (!open) return
    function close(e: Event) {
      if (triggerRef.current?.contains(e.target as Node)) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('scroll', close, true)
    }
  }, [open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  function calculateCoords() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportH = window.innerHeight
    const spaceBelow = viewportH - rect.bottom
    const spaceAbove = rect.top
    const dropdownH = 320
    const openUp = spaceBelow < dropdownH + 20 && spaceAbove > spaceBelow

    // Ensure dropdown doesn't go off-screen left/right
    const dropW = Math.max(rect.width, 280)
    const leftRaw = rect.left
    const left = Math.min(leftRaw, window.innerWidth - dropW - 8)

    setCoords({
      top: openUp ? rect.top - 4 : rect.bottom + 4,
      left: Math.max(8, left),
      width: dropW,
      openUp,
    })
  }

  function handleToggle() {
    if (disabled) return
    if (!open) {
      calculateCoords()
      setOpen(true)
    } else {
      setOpen(false)
      setQuery('')
    }
  }

  // Filter
  const normalise = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const q = normalise(query)
  const filtered = q
    ? players.filter(
        (p) =>
          normalise(p.name).includes(q) ||
          normalise(p.team?.name_es ?? '').includes(q) ||
          normalise(p.team?.code ?? '').includes(q),
      )
    : players

  // Group by team when not searching
  type Group = { label: string; flag?: string; players: Player[] }
  let groups: Group[] = []

  if (!q) {
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
    groups = [{ label: '', players: filtered }]
  }

  const selected = players.find((p) => p.id === value)

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

  const Chevron = coords.openUp ? ChevronUp : ChevronDown

  // Dropdown rendered via portal so it's never clipped by parent overflow
  const dropdown =
    mounted && open
      ? createPortal(
          <div
            style={{
              position: 'fixed',
              top: coords.openUp ? undefined : coords.top,
              bottom: coords.openUp ? window.innerHeight - coords.top : undefined,
              left: coords.left,
              width: coords.width,
              zIndex: 99999,
            }}
            className="overflow-hidden rounded-xl border bg-card shadow-2xl"
          >
            {/* Search bar */}
            <div className="flex items-center gap-2 border-b bg-card px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, equipo o código..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
              />
              {query ? (
                <button onClick={() => setQuery('')} className="rounded-full p-0.5 hover:bg-muted">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ) : (
                <span className="text-[10px] text-muted-foreground">{players.length} jugadores</span>
              )}
            </div>

            {/* Clear selection */}
            {value && (
              <button
                type="button"
                onClick={() => select('')}
                className="flex w-full items-center gap-2 border-b px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
              >
                <X className="h-3.5 w-3.5 shrink-0" />
                Quitar selección
              </button>
            )}

            {/* Results */}
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Sin resultados para &ldquo;{query}&rdquo;
                </div>
              ) : (
                groups.map((group) => (
                  <div key={group.label || '_search'}>
                    {group.label && (
                      <div className="sticky top-0 z-10 flex items-center gap-2 bg-muted/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                        {group.flag && <TeamFlag code={group.flag} label={group.label} />}
                        <span>{group.label}</span>
                        <span className="ml-auto font-normal normal-case text-muted-foreground/60">
                          {group.players.length} jug.
                        </span>
                      </div>
                    )}
                    {group.players.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => select(p.id)}
                        className={[
                          'flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 active:bg-muted',
                          p.id === value ? 'bg-red-50 dark:bg-red-950/30' : '',
                        ].join(' ')}
                      >
                        {/* Number badge */}
                        <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">
                          {p.shirt_number != null ? `#${p.shirt_number}` : ''}
                        </span>

                        {/* Name — full, no truncation */}
                        <span className={['flex-1 text-left font-medium', p.id === value ? 'brand-red font-semibold' : ''].join(' ')}>
                          {p.name}
                        </span>

                        {/* Position badge */}
                        {p.position && (
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${positionBadgeClass(p.position)}`}>
                            {positionLabel(p.position)}
                          </span>
                        )}

                        {/* Selected tick */}
                        {p.id === value && (
                          <span className="shrink-0 text-[11px] font-bold brand-red">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={[
          'flex h-11 w-full items-center gap-2 rounded-xl border bg-background px-3 text-sm transition-all',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-muted-foreground/40',
          open ? 'border-red-400 ring-2 ring-red-200 dark:ring-red-900/40' : 'border-input',
        ].join(' ')}
      >
        {selected ? (
          <>
            {selected.team && (
              <TeamFlag code={selected.team.flag_emoji} label={selected.team.name_es} />
            )}
            {selected.shirt_number != null && (
              <span className="shrink-0 font-mono text-xs text-muted-foreground">#{selected.shirt_number}</span>
            )}
            <span className="flex-1 truncate text-left font-semibold">{selected.name}</span>
            {selected.team && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                {selected.team.code}
              </span>
            )}
            {!disabled && (
              <span
                onClick={clear}
                className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
          </>
        ) : (
          <>
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-left text-muted-foreground">{placeholder}</span>
            <Chevron className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </button>

      {dropdown}
    </div>
  )
}
