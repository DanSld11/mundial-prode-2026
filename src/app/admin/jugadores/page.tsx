'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Users, ChevronDown, ChevronUp, Pencil, Check, X, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TeamFlag } from '@/components/team-flag'
import { createPlayerAction, getPlayersAdminData, togglePlayerActiveAction, updatePlayerAction } from './actions'
import { toast } from 'sonner'

/* ── Position config ── */
const POS_ORDER = ['GK', 'DEF', 'MID', 'DEL']
const POS_LABEL: Record<string, string> = { GK: 'Arqueros', DEF: 'Defensas', MID: 'Mediocampistas', DEL: 'Delanteros' }
const POS_BADGE: Record<string, string> = {
  GK:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  DEF: 'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  MID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  DEL: 'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',
}
function normPos(pos: string | null): string {
  const p = (pos ?? '').toUpperCase()
  if (p === 'ARQ') return 'GK'
  if (p === 'MED') return 'MID'
  if (p === 'FWD') return 'DEL'
  return POS_ORDER.includes(p) ? p : 'DEL'
}
function posShort(pos: string | null) {
  const p = normPos(pos)
  return p === 'GK' ? 'ARQ' : p === 'MID' ? 'MED' : p
}

/* ── Player row ── */
function PlayerRow({ player, onUpdate, onToggle }: {
  player: any
  onUpdate: (id: string, updates: Record<string, any>) => Promise<void>
  onToggle: (player: any) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [eName, setEName]     = useState(player.name)
  const [eNum, setENum]       = useState(player.shirt_number ?? '')
  const [ePos, setEPos]       = useState(normPos(player.position))
  const [saving, setSaving]   = useState(false)
  const [toggling, setToggling] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) nameRef.current?.focus() }, [editing])

  async function save() {
    setSaving(true)
    await onUpdate(player.id, {
      name: eName.trim(),
      shirt_number: eNum !== '' ? parseInt(String(eNum)) : null,
      position: ePos || null,
    })
    setSaving(false)
    setEditing(false)
  }

  async function toggle() {
    setToggling(true)
    await onToggle(player)
    setToggling(false)
  }

  function cancel() {
    setEName(player.name); setENum(player.shirt_number ?? ''); setEPos(normPos(player.position))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-brand-red/30 bg-brand-red/5 px-2 py-1.5">
        <Input ref={nameRef} value={eName} onChange={e => setEName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          className="h-7 flex-1 text-xs px-1.5 min-w-0" />
        <Input value={eNum} onChange={e => setENum(e.target.value)} type="number" min={1} max={99}
          className="h-7 w-12 text-center text-xs p-0 shrink-0" placeholder="#" />
        <select value={ePos} onChange={e => setEPos(e.target.value)}
          className="h-7 shrink-0 rounded border bg-background px-1 text-xs focus:outline-none">
          <option value="GK">ARQ</option>
          <option value="DEF">DEF</option>
          <option value="MID">MED</option>
          <option value="DEL">DEL</option>
        </select>
        <button onClick={save} disabled={saving}
          className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-white hover:bg-emerald-600 shrink-0">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={cancel}
          className="flex h-6 w-6 items-center justify-center rounded bg-muted hover:bg-muted/80 shrink-0">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40 ${!player.active ? 'opacity-40' : ''}`}>
      <span className="w-6 shrink-0 text-right font-mono text-xs font-bold text-muted-foreground">
        {player.shirt_number ?? '—'}
      </span>
      <span className={`flex-1 truncate text-sm ${!player.active ? 'line-through' : 'font-medium'}`}>
        {player.name}
      </span>
      {/* Always-visible actions */}
      <div className="flex shrink-0 items-center gap-1">
        <button onClick={() => setEditing(true)}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted">
          <Pencil className="h-3 w-3" />
        </button>
        <button onClick={toggle} disabled={toggling}
          className={`h-6 min-w-[44px] rounded px-1.5 text-[10px] font-bold border transition-colors ${
            player.active
              ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20'
              : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950/20'
          }`}>
          {toggling ? '...' : player.active ? 'Desact.' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

/* ── Inline quick-add form per team ── */
function QuickAddRow({ teamId, onAdd }: { teamId: string; onAdd: (name: string, num: string, pos: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [num, setNum]   = useState('')
  const [pos, setPos]   = useState('DEL')
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    await onAdd(name.trim(), num, pos)
    setName(''); setNum('')
    setSaving(false)
    nameRef.current?.focus()
  }

  return (
    <form onSubmit={submit}
      className="flex items-center gap-1.5 rounded-lg border border-dashed border-brand-red/40 bg-brand-red/5 px-2 py-1.5 mt-1">
      <Plus className="h-3.5 w-3.5 shrink-0 text-brand-red/60" />
      <Input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
        placeholder="Nombre del jugador" required
        className="h-7 flex-1 text-xs px-1.5 min-w-0 bg-transparent border-0 shadow-none focus-visible:ring-0" />
      <Input value={num} onChange={e => setNum(e.target.value)} type="number" min={1} max={99}
        placeholder="#" className="h-7 w-12 text-center text-xs p-0 shrink-0" />
      <select value={pos} onChange={e => setPos(e.target.value)}
        className="h-7 shrink-0 rounded border bg-background px-1 text-xs focus:outline-none">
        <option value="GK">ARQ</option>
        <option value="DEF">DEF</option>
        <option value="MID">MED</option>
        <option value="DEL">DEL</option>
      </select>
      <button type="submit" disabled={saving || !name.trim()}
        className="flex h-6 w-6 items-center justify-center rounded bg-brand-red text-white hover:bg-red-700 disabled:opacity-40 shrink-0">
        {saving ? <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" /> : <Check className="h-3.5 w-3.5" />}
      </button>
    </form>
  )
}

/* ── Main page ── */
export default function AdminJugadoresPage() {
  const [teams, setTeams]     = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [teamSearch, setTeamSearch] = useState('')
  // Start collapsed — open only teams the user interacts with
  const [collapsed, setCollapsed]   = useState<Set<string>>(new Set())
  const [addingTeam, setAddingTeam] = useState<string | null>(null)
  const firstLoadRef = useRef(true)

  const load = useCallback(async () => {
    const result = await getPlayersAdminData()
    setTeams(result.teams ?? [])
    setPlayers(result.players ?? [])
    if (firstLoadRef.current) {
      setCollapsed(new Set((result.teams ?? []).map((t: any) => t.id)))
      firstLoadRef.current = false
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(teamId: string, name: string, num: string, pos: string) {
    const res = await createPlayerAction({ teamId, name, shirtNumber: num, position: pos })
    if ((res as any)?.error) { toast.error((res as any).error); return }
    toast.success(`${name} agregado`)
    await load()
  }

  async function handleUpdate(id: string, updates: Record<string, any>) {
    await updatePlayerAction(id, updates)
    await load()
  }

  async function handleToggle(player: any) {
    await togglePlayerActiveAction(player.id, player.active)
    await load()
  }

  function toggleCollapse(teamId: string) {
    setCollapsed(prev => {
      const n = new Set(prev)
      n.has(teamId) ? n.delete(teamId) : n.add(teamId)
      return n
    })
  }

  // Filter players
  const q = search.toLowerCase().trim()
  const byTeam: Record<string, any[]> = {}
  for (const p of players) {
    if (!byTeam[p.team_id]) byTeam[p.team_id] = []
    if (!q || p.name.toLowerCase().includes(q)) byTeam[p.team_id].push(p)
  }

  // Filter teams
  const tq = teamSearch.toLowerCase().trim()
  const visibleTeams = teams.filter(t => {
    if (q && !(byTeam[t.id] ?? []).length) return false
    if (tq && !t.name_es.toLowerCase().includes(tq) && !t.code.toLowerCase().includes(tq)) return false
    return true
  })

  const totalShown = Object.values(byTeam).reduce((s, a) => s + a.length, 0)

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
      Cargando planteles...
    </div>
  )

  return (
    <div className="space-y-4 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Planteles</h1>
          <p className="text-sm text-muted-foreground">{players.length.toLocaleString()} jugadores · {teams.length} selecciones</p>
        </div>
        <button onClick={() => {
          const allCollapsed = visibleTeams.every(t => collapsed.has(t.id))
          if (allCollapsed) {
            setCollapsed(prev => { const n = new Set(prev); visibleTeams.forEach(t => n.delete(t.id)); return n })
          } else {
            setCollapsed(prev => { const n = new Set(prev); visibleTeams.forEach(t => n.add(t.id)); return n })
          }
        }} className="ml-auto text-xs text-muted-foreground underline hover:text-foreground shrink-0">
          {visibleTeams.every(t => collapsed.has(t.id)) ? 'Expandir todo' : 'Colapsar todo'}
        </button>
      </div>

      {/* Search bar — players + teams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar jugador..." className="h-9 pl-8" />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={teamSearch} onChange={e => {
            setTeamSearch(e.target.value)
            // Auto-expand teams matching the filter
            if (e.target.value.trim()) {
              const tq2 = e.target.value.toLowerCase()
              const matches = teams.filter(t => t.name_es.toLowerCase().includes(tq2) || t.code.toLowerCase().includes(tq2))
              setCollapsed(prev => { const n = new Set(prev); matches.forEach(t => n.delete(t.id)); return n })
            }
          }} placeholder="Filtrar por selección..." className="h-9 pl-8" />
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground px-1">
        {totalShown.toLocaleString()} jugadores · {visibleTeams.length} selecciones mostradas
      </p>

      {/* Teams */}
      <div className="space-y-2">
        {visibleTeams.map(team => {
          const all = byTeam[team.id] ?? []
          const isOpen = !collapsed.has(team.id)
          const isAdding = addingTeam === team.id

          const byPos: Record<string, any[]> = {}
          for (const p of all) {
            const pos = normPos(p.position)
            if (!byPos[pos]) byPos[pos] = []
            byPos[pos].push(p)
          }

          const activeCount   = all.filter(p => p.active).length
          const inactiveCount = all.length - activeCount

          return (
            <div key={team.id} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              {/* Team header */}
              <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/20">
                <button type="button" onClick={() => toggleCollapse(team.id)}
                  className="flex flex-1 items-center gap-2 text-left min-w-0">
                  <TeamFlag code={team.flag_emoji} label={team.name_es} />
                  <span className="font-bold text-sm truncate">{team.name_es}</span>
                  <span className="hidden sm:inline text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                    G{team.group_name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{activeCount} act.</span>
                  {inactiveCount > 0 && (
                    <span className="text-[10px] text-muted-foreground shrink-0">· {inactiveCount} inact.</span>
                  )}
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
                          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />}
                </button>
                {/* Quick-add button always visible */}
                <button
                  onClick={() => {
                    if (!isOpen) toggleCollapse(team.id)
                    setAddingTeam(isAdding ? null : team.id)
                  }}
                  title="Agregar jugador a este equipo"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isAdding
                      ? 'bg-brand-red text-white border-brand-red'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}>
                  {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Squad */}
              {isOpen && (
                <div className="px-3 py-3 space-y-3">
                  {/* Quick-add row */}
                  {isAdding && (
                    <QuickAddRow
                      teamId={team.id}
                      onAdd={async (name, num, pos) => {
                        await handleCreate(team.id, name, num, pos)
                      }}
                    />
                  )}

                  {POS_ORDER.map(pos => {
                    const group = byPos[pos]
                    if (!group || group.length === 0) return null
                    return (
                      <div key={pos}>
                        <div className="mb-1 flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${POS_BADGE[pos]}`}>
                            {posShort(pos)}
                          </span>
                          <span className="text-xs text-muted-foreground">{POS_LABEL[pos]} ({group.length})</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                          {group.map(player => (
                            <PlayerRow key={player.id} player={player} onUpdate={handleUpdate} onToggle={handleToggle} />
                          ))}
                        </div>
                      </div>
                    )
                  })}

                  {all.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">Sin jugadores — usa el + para agregar</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {visibleTeams.length === 0 && (
          <div className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground">
            {search || teamSearch ? 'Sin resultados para tu búsqueda' : 'No hay jugadores cargados.'}
          </div>
        )}
      </div>
    </div>
  )
}
