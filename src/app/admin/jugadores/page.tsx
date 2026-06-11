'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TeamFlag } from '@/components/team-flag'
import { createPlayerAction, getPlayersAdminData, togglePlayerActiveAction, updatePlayerAction } from './actions'

const POS_COLORS: Record<string, string> = {
  GK:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  DEF: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  MID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  MED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  DEL: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  FWD: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}
function posLabel(pos: string | null) {
  if (!pos) return '—'
  const p = pos.toUpperCase()
  if (p === 'GK')  return 'ARQ'
  if (p === 'MID') return 'MED'
  if (p === 'FWD') return 'DEL'
  return p
}
function posCls(pos: string | null) {
  return POS_COLORS[(pos ?? '').toUpperCase()] ?? 'bg-muted text-muted-foreground'
}

export default function AdminJugadoresPage() {
  const [teams, setTeams]     = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')

  // Form state
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [name, setName]             = useState('')
  const [shirtNumber, setShirtNumber] = useState('')
  const [position, setPosition]     = useState('')

  // Collapsible teams
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    const result = await getPlayersAdminData()
    setTeams(result.teams ?? [])
    setPlayers(result.players ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function createPlayer(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedTeamId || !name.trim()) return
    setSaving(true)
    await createPlayerAction({ teamId: selectedTeamId, name, shirtNumber, position })
    setName(''); setShirtNumber(''); setPosition('')
    setSaving(false)
    await load()
  }

  async function toggleActive(player: any) {
    await togglePlayerActiveAction(player.id, player.active)
    await load()
  }

  async function updatePlayer(player: any, updates: Record<string, any>) {
    await updatePlayerAction(player.id, updates)
    await load()
  }

  function toggleCollapse(teamId: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(teamId) ? next.delete(teamId) : next.add(teamId)
      return next
    })
  }

  // Group players by team
  const q = search.toLowerCase().trim()
  const byTeam: Record<string, any[]> = {}
  for (const p of players) {
    if (!byTeam[p.team_id]) byTeam[p.team_id] = []
    if (!q || p.name.toLowerCase().includes(q)) {
      byTeam[p.team_id].push(p)
    }
  }

  const teamsWithPlayers = teams.filter(t => (byTeam[t.id] ?? []).length > 0)
  const totalShown = Object.values(byTeam).reduce((s, arr) => s + arr.length, 0)

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando jugadores...</div>

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
            <p className="text-sm text-muted-foreground">
              {players.length.toLocaleString()} jugadores · {teams.length} selecciones
            </p>
          </div>
        </div>
      </div>

      {/* Add player form */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <UserPlus className="h-4 w-4 text-brand-red" /> Agregar jugador
        </h2>
        <form onSubmit={createPlayer} className="grid gap-2 sm:grid-cols-[1.5fr_1.5fr_0.5fr_0.8fr_auto]">
          <select
            value={selectedTeamId}
            onChange={e => setSelectedTeamId(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
            required
          >
            <option value="">Seleccionar selección...</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
            ))}
          </select>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del jugador" required className="h-9" />
          <Input value={shirtNumber} onChange={e => setShirtNumber(e.target.value)} type="number" min={1} max={99} placeholder="Nro." className="h-9" />
          <select
            value={position}
            onChange={e => setPosition(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
          >
            <option value="">Posición</option>
            <option value="GK">Arquero (GK)</option>
            <option value="DEF">Defensa (DEF)</option>
            <option value="MID">Mediocampista (MID)</option>
            <option value="DEL">Delantero (DEL)</option>
          </select>
          <Button disabled={saving} className="h-9 bg-brand-red text-white hover:bg-red-700 whitespace-nowrap">
            {saving ? 'Guardando...' : 'Agregar'}
          </Button>
        </form>
      </div>

      {/* Search + total */}
      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar jugador por nombre..."
          className="max-w-xs h-9"
        />
        <Badge variant="secondary">{totalShown.toLocaleString()} jugadores · {teamsWithPlayers.length} selecciones</Badge>
      </div>

      {/* Players grouped by team */}
      <div className="space-y-3">
        {teamsWithPlayers.map(team => {
          const teamPlayers = byTeam[team.id] ?? []
          const isCollapsed = collapsed.has(team.id)
          return (
            <div key={team.id} className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              {/* Team header — click to collapse/expand */}
              <button
                type="button"
                onClick={() => toggleCollapse(team.id)}
                className="flex w-full items-center gap-3 px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <TeamFlag code={team.flag_emoji} label={team.name_es} />
                <span className="font-bold text-sm flex-1 text-left">{team.name_es}</span>
                <Badge variant="outline" className="text-xs font-mono shrink-0">Grupo {team.group_name}</Badge>
                <span className="text-xs text-muted-foreground shrink-0">{teamPlayers.length} jug.</span>
                {isCollapsed
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronUp   className="h-4 w-4 text-muted-foreground shrink-0" />
                }
              </button>

              {/* Players rows */}
              {!isCollapsed && (
                <div className="divide-y">
                  {/* Column headers */}
                  <div className="grid grid-cols-[2rem_1fr_3rem_4.5rem_5rem_5rem] items-center gap-2 px-4 py-1.5 bg-muted/10">
                    <span className="text-[10px] font-bold text-muted-foreground text-right">#</span>
                    <span className="text-[10px] font-bold text-muted-foreground">Nombre</span>
                    <span className="text-[10px] font-bold text-muted-foreground text-center">Nro.</span>
                    <span className="text-[10px] font-bold text-muted-foreground text-center">Posición</span>
                    <span className="text-[10px] font-bold text-muted-foreground text-center">Cambiar</span>
                    <span className="text-[10px] font-bold text-muted-foreground text-center">Estado</span>
                  </div>
                  {teamPlayers.map(player => (
                    <div key={player.id} className={`grid grid-cols-[2rem_1fr_3rem_4.5rem_5rem_5rem] items-center gap-2 px-4 py-1.5 ${!player.active ? 'opacity-50' : ''}`}>
                      {/* Current shirt number */}
                      <span className="text-xs font-mono font-bold text-muted-foreground text-right">
                        {player.shirt_number ?? '—'}
                      </span>

                      {/* Name (editable on blur) */}
                      <Input
                        defaultValue={player.name}
                        onBlur={e => e.target.value !== player.name && updatePlayer(player, { name: e.target.value })}
                        className="h-7 text-sm border-transparent hover:border-input focus:border-input px-2 bg-transparent"
                      />

                      {/* Shirt number (editable) */}
                      <Input
                        defaultValue={player.shirt_number ?? ''}
                        type="number" min={1} max={99}
                        onBlur={e => updatePlayer(player, { shirt_number: e.target.value ? parseInt(e.target.value) : null })}
                        className="h-7 text-xs text-center border-transparent hover:border-input focus:border-input px-1 bg-transparent"
                      />

                      {/* Position badge */}
                      <div className="flex justify-center">
                        <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${posCls(player.position)}`}>
                          {posLabel(player.position)}
                        </span>
                      </div>

                      {/* Position selector */}
                      <select
                        defaultValue={player.position ?? ''}
                        onBlur={e => updatePlayer(player, { position: e.target.value || null })}
                        className="h-7 rounded border bg-background px-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-red"
                      >
                        <option value="">—</option>
                        <option value="GK">ARQ</option>
                        <option value="DEF">DEF</option>
                        <option value="MID">MED</option>
                        <option value="DEL">DEL</option>
                      </select>

                      {/* Active toggle */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(player)}
                        className={`h-7 text-xs px-2 ${player.active ? 'border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' : 'border-red-200 text-red-500'}`}
                      >
                        {player.active ? 'Activo' : 'Inactivo'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {teamsWithPlayers.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">
            {search ? `Sin resultados para "${search}"` : 'No hay jugadores cargados.'}
          </div>
        )}
      </div>
    </div>
  )
}
