'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Users, ChevronDown, ChevronUp, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TeamFlag } from '@/components/team-flag'
import { createPlayerAction, getPlayersAdminData, togglePlayerActiveAction, updatePlayerAction } from './actions'

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

/* ── Inline edit row ── */
function PlayerRow({
  player, onUpdate, onToggle,
}: {
  player: any
  onUpdate: (id: string, updates: Record<string, any>) => Promise<void>
  onToggle: (player: any) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [eName, setEName]     = useState(player.name)
  const [eNum, setENum]       = useState(player.shirt_number ?? '')
  const [ePos, setEPos]       = useState(normPos(player.position))
  const [saving, setSaving]   = useState(false)

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

  function cancel() {
    setEName(player.name)
    setENum(player.shirt_number ?? '')
    setEPos(normPos(player.position))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-brand-red/30 bg-brand-red/5 px-2 py-1.5 col-span-1">
        <Input value={eNum} onChange={e => setENum(e.target.value)} type="number" min={1} max={99}
          className="h-7 w-10 text-center text-xs p-0" placeholder="#" />
        <Input value={eName} onChange={e => setEName(e.target.value)}
          className="h-7 flex-1 text-xs px-1.5" />
        <select value={ePos} onChange={e => setEPos(e.target.value)}
          className="h-7 rounded border bg-background px-1 text-xs focus:outline-none">
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
          className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground hover:bg-muted/80 shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted/40 ${!player.active ? 'opacity-40' : ''}`}>
      {/* Shirt number */}
      <span className="w-6 shrink-0 text-right font-mono text-xs font-bold text-muted-foreground">
        {player.shirt_number ?? '—'}
      </span>
      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium">{player.name}</span>
      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setEditing(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <Pencil className="h-3 w-3" />
        </button>
        <button
          onClick={() => onToggle(player)}
          className={`h-5 rounded px-1.5 text-[9px] font-bold border transition-colors ${
            player.active
              ? 'border-red-200 text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20'
              : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950/20'
          }`}
        >
          {player.active ? 'Desact.' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function AdminJugadoresPage() {
  const [teams, setTeams]     = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  // Add form
  const [selTeamId, setSelTeamId]   = useState('')
  const [newName, setNewName]       = useState('')
  const [newNum, setNewNum]         = useState('')
  const [newPos, setNewPos]         = useState('')

  const load = useCallback(async () => {
    const result = await getPlayersAdminData()
    setTeams(result.teams ?? [])
    setPlayers(result.players ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selTeamId || !newName.trim()) return
    setSaving(true)
    await createPlayerAction({ teamId: selTeamId, name: newName, shirtNumber: newNum, position: newPos })
    setNewName(''); setNewNum(''); setNewPos('')
    setSaving(false)
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
    setCollapsed(prev => { const n = new Set(prev); n.has(teamId) ? n.delete(teamId) : n.add(teamId); return n })
  }

  // Filter & group
  const q = search.toLowerCase().trim()
  const byTeam: Record<string, any[]> = {}
  for (const p of players) {
    if (!byTeam[p.team_id]) byTeam[p.team_id] = []
    if (!q || p.name.toLowerCase().includes(q)) byTeam[p.team_id].push(p)
  }
  const teamsWithPlayers = teams.filter(t => (byTeam[t.id] ?? []).length > 0)
  const totalShown = Object.values(byTeam).reduce((s, a) => s + a.length, 0)

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-red border-t-transparent" />
      Cargando planteles...
    </div>
  )

  return (
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Planteles</h1>
          <p className="text-sm text-muted-foreground">
            {players.length.toLocaleString()} jugadores · {teams.length} selecciones
          </p>
        </div>
      </div>

      {/* Add player */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
          <UserPlus className="h-4 w-4 text-brand-red" /> Agregar jugador
        </p>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
          <select value={selTeamId} onChange={e => setSelTeamId(e.target.value)} required
            className="h-9 flex-1 min-w-[180px] rounded-lg border bg-background px-3 text-sm">
            <option value="">Selección...</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>)}
          </select>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nombre" required className="h-9 flex-1 min-w-[160px]" />
          <Input value={newNum} onChange={e => setNewNum(e.target.value)} type="number" min={1} max={99} placeholder="Nro." className="h-9 w-20" />
          <select value={newPos} onChange={e => setNewPos(e.target.value)}
            className="h-9 w-32 rounded-lg border bg-background px-3 text-sm">
            <option value="">Posición</option>
            <option value="GK">Arquero</option>
            <option value="DEF">Defensa</option>
            <option value="MID">Mediocampista</option>
            <option value="DEL">Delantero</option>
          </select>
          <Button disabled={saving} className="h-9 bg-brand-red text-white hover:bg-red-700">
            {saving ? 'Guardando...' : 'Agregar'}
          </Button>
        </form>
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3">
        <Input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Buscar jugador..." className="h-9 max-w-72" />
        <span className="text-sm text-muted-foreground">
          {totalShown.toLocaleString()} jugadores · {teamsWithPlayers.length} selecciones
        </span>
        {!search && (
          <button onClick={() => setCollapsed(new Set(teams.map(t => t.id)))}
            className="ml-auto text-xs text-muted-foreground underline hover:text-foreground">
            Colapsar todo
          </button>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-2">
        {teamsWithPlayers.map(team => {
          const all = byTeam[team.id] ?? []
          const isOpen = !collapsed.has(team.id)

          // group by normalised position
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
              <button type="button" onClick={() => toggleCollapse(team.id)}
                className="flex w-full items-center gap-3 px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left">
                <TeamFlag code={team.flag_emoji} label={team.name_es} />
                <span className="font-bold text-sm flex-1">{team.name_es}</span>
                <span className="hidden sm:inline-block text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                  Grupo {team.group_name}
                </span>
                <span className="text-xs font-semibold shrink-0">{activeCount} jug.</span>
                {inactiveCount > 0 && (
                  <span className="text-[10px] text-muted-foreground shrink-0">({inactiveCount} inact.)</span>
                )}
                {isOpen
                  ? <ChevronUp   className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                }
              </button>

              {/* Squad — visible when open */}
              {isOpen && (
                <div className="px-4 py-3 space-y-4">
                  {POS_ORDER.map(pos => {
                    const group = byPos[pos]
                    if (!group || group.length === 0) return null
                    return (
                      <div key={pos}>
                        {/* Position header */}
                        <div className="mb-1.5 flex items-center gap-2">
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${POS_BADGE[pos]}`}>
                            {posShort(pos)}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground">{POS_LABEL[pos]}</span>
                          <span className="text-[10px] text-muted-foreground">({group.length})</span>
                        </div>
                        {/* 2-column player grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                          {group.map(player => (
                            <PlayerRow
                              key={player.id}
                              player={player}
                              onUpdate={handleUpdate}
                              onToggle={handleToggle}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {teamsWithPlayers.length === 0 && (
          <div className="rounded-2xl border bg-card py-16 text-center text-sm text-muted-foreground">
            {search ? `Sin resultados para "${search}"` : 'No hay jugadores cargados.'}
          </div>
        )}
      </div>
    </div>
  )
}
