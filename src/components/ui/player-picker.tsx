'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'

interface Player {
  id: string
  name: string
  shirt_number?: number | null
  position?: string | null
  team?: { id: string; name_es: string; code: string; flag_emoji: string } | null
}

interface PlayerPickerProps {
  players: Player[]
  value: string
  onChange: (id: string) => void
  disabled?: boolean
  placeholder?: string
}

function posBadge(pos: string | null | undefined) {
  const p = (pos ?? '').toUpperCase()
  if (p === 'GK' || p === 'ARQ') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
  if (p === 'DEF') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
  if (p === 'MID' || p === 'MED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
  if (p === 'DEL' || p === 'FWD') return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
  return 'bg-muted text-muted-foreground'
}
function posLabel(pos: string | null | undefined) {
  const p = (pos ?? '').toUpperCase()
  if (p === 'GK') return 'ARQ'
  if (p === 'MID') return 'MED'
  if (p === 'FWD') return 'DEL'
  return p
}

export function PlayerPicker({
  players,
  value,
  onChange,
  disabled = false,
  placeholder = 'Buscar goleador...',
}: PlayerPickerProps) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [mounted, setMounted] = useState(false)
  const [coords, setCoords]   = useState({ top: 0, bottom: 0, left: 0, width: 0, openUp: false })

  const triggerRef       = useRef<HTMLButtonElement>(null)
  const dropdownRef      = useRef<HTMLDivElement>(null)
  const inputRef         = useRef<HTMLInputElement>(null)
  // Prevents closing the dropdown right after the mobile keyboard is dismissed
  const ignoringCloseRef = useRef(false)

  useEffect(() => { setMounted(true) }, [])

  // Close on outside click — check BOTH trigger and dropdown refs
  useEffect(() => {
    if (!open) return
    function handlePointerDown(e: PointerEvent) {
      if (ignoringCloseRef.current) return          // keyboard was just dismissed — ignore
      const target = e.target as Node
      if (triggerRef.current?.contains(target))  return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  // Auto-focus search only on desktop (mouse/trackpad); on mobile the keyboard pops up
  // automatically and closing it would trigger an outside-click that shuts the dropdown
  useEffect(() => {
    if (!open) return
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (isDesktop) setTimeout(() => inputRef.current?.focus(), 40)
  }, [open])

  // When the search input loses focus (e.g. keyboard dismissed on mobile),
  // ignore outside-click events for 400 ms so the dropdown stays open
  const handleInputBlur = useCallback(() => {
    ignoringCloseRef.current = true
    setTimeout(() => { ignoringCloseRef.current = false }, 400)
  }, [])

  function computeCoords() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const vh   = window.innerHeight
    const vw   = window.innerWidth
    const maxH = 340
    const openUp = rect.bottom + maxH + 8 > vh && rect.top > maxH

    const rawLeft = rect.left
    const width   = Math.max(rect.width, 300)
    const left    = Math.min(rawLeft, vw - width - 8)

    setCoords({
      top:    rect.bottom + 4,          // distance from top of viewport (used when !openUp)
      bottom: vh - rect.top + 4,        // distance from bottom of viewport (used when openUp)
      left:   Math.max(8, left),
      width,
      openUp,
    })
  }

  function handleToggle() {
    if (disabled) return
    if (open) {
      setOpen(false)
      setQuery('')
    } else {
      computeCoords()
      setOpen(true)
    }
  }

  // Filter helpers
  const norm  = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const q     = norm(query)
  const list  = q
    ? players.filter(p =>
        norm(p.name).includes(q) ||
        norm(p.team?.name_es ?? '').includes(q) ||
        norm(p.team?.code ?? '').includes(q)
      )
    : players

  // Grouping
  type Group = { label: string; flag?: string; players: Player[] }
  let groups: Group[]
  if (!q) {
    const order: string[] = []
    const byTeam: Record<string, Player[]> = {}
    for (const p of list) {
      const k = p.team?.name_es ?? 'Sin equipo'
      if (!byTeam[k]) { byTeam[k] = []; order.push(k) }
      byTeam[k].push(p)
    }
    groups = order.map(k => ({
      label:   k,
      flag:    byTeam[k][0]?.team?.flag_emoji,
      players: byTeam[k].sort((a, b) => (a.shirt_number ?? 99) - (b.shirt_number ?? 99)),
    }))
  } else {
    groups = [{ label: '', players: list }]
  }

  const selected = players.find(p => p.id === value)

  function pick(id: string) { onChange(id); setOpen(false); setQuery('') }
  function clear(e: React.MouseEvent) { e.stopPropagation(); onChange(''); setQuery('') }

  const Chevron = coords.openUp ? ChevronUp : ChevronDown

  // Portal dropdown
  const portal = mounted && open ? createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top:    coords.openUp ? undefined  : coords.top,
        bottom: coords.openUp ? coords.bottom : undefined,
        left:   coords.left,
        width:  coords.width,
        zIndex: 99999,
        maxHeight: '340px',
      }}
      className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-2xl"
    >
      {/* Search bar */}
      <div className="flex shrink-0 items-center gap-2 border-b bg-card px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onBlur={handleInputBlur}
          placeholder="Nombre, equipo o código..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
        {query
          ? <button onClick={() => setQuery('')} className="shrink-0 rounded-full p-0.5 hover:bg-muted"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
          : <span className="shrink-0 text-[10px] text-muted-foreground">{players.length} jugadores</span>
        }
      </div>

      {/* Clear option */}
      {value && (
        <button
          type="button"
          onClick={() => pick('')}
          className="flex shrink-0 w-full items-center gap-2 border-b px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50"
        >
          <X className="h-3.5 w-3.5 shrink-0" /> Quitar selección
        </button>
      )}

      {/* Results — scrollable */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {list.length === 0
          ? <div className="px-4 py-8 text-center text-sm text-muted-foreground">Sin resultados para &ldquo;{query}&rdquo;</div>
          : groups.map(group => (
            <div key={group.label || '_q'}>
              {group.label && (
                <div className="sticky top-0 z-10 flex items-center gap-2 bg-muted/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur">
                  {group.flag && <TeamFlag code={group.flag} label={group.label} />}
                  <span className="flex-1">{group.label}</span>
                  <span className="font-normal normal-case opacity-60">{group.players.length} jug.</span>
                </div>
              )}
              {group.players.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onPointerDown={e => { e.preventDefault(); pick(p.id) }}
                  className={[
                    'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted/60 active:bg-muted',
                    p.id === value ? 'bg-red-50 dark:bg-red-950/30' : '',
                  ].join(' ')}
                >
                  <span className="w-7 shrink-0 text-right font-mono text-xs text-muted-foreground">
                    {p.shirt_number != null ? `#${p.shirt_number}` : ''}
                  </span>
                  <span className={['flex-1 font-medium', p.id === value ? 'font-semibold brand-red' : ''].join(' ')}>
                    {p.name}
                  </span>
                  {p.position && (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${posBadge(p.position)}`}>
                      {posLabel(p.position)}
                    </span>
                  )}
                  {p.id === value && <span className="shrink-0 text-[11px] font-bold brand-red">✓</span>}
                </button>
              ))}
            </div>
          ))
        }
      </div>
    </div>,
    document.body,
  ) : null

  return (
    <div className="relative">
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
            {selected.team && <TeamFlag code={selected.team.flag_emoji} label={selected.team.name_es} />}
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
              <span onClick={clear} className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full hover:bg-muted">
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
      {portal}
    </div>
  )
}
