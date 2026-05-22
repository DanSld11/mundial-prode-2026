'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TeamFlag } from '@/components/team-flag'
import { createPlayerAction, getPlayersAdminData, togglePlayerActiveAction, updatePlayerAction } from './actions'

export default function AdminJugadoresPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [name, setName] = useState('')
  const [shirtNumber, setShirtNumber] = useState('')
  const [position, setPosition] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    setName('')
    setShirtNumber('')
    setPosition('')
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

  const visiblePlayers = selectedTeamId ? players.filter((p) => p.team_id === selectedTeamId) : players

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando jugadores...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
            <p className="text-sm text-muted-foreground">Gestiona planteles por selección para predicción de goleador.</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-brand-red" />
            Nuevo jugador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createPlayer} className="grid gap-3 md:grid-cols-[1.4fr_1.4fr_0.6fr_1fr_auto]">
            <select value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm" required>
              <option value="">Seleccionar equipo...</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.group_name} · {team.name_es}</option>
              ))}
            </select>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del jugador" required />
            <Input value={shirtNumber} onChange={(e) => setShirtNumber(e.target.value)} type="number" min={1} max={99} placeholder="Nro." />
            <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Posición" />
            <Button disabled={saving} className="bg-brand-red text-white hover:bg-red-700">
              {saving ? 'Guardando...' : 'Agregar'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-semibold">Plantel cargado</h2>
              <Badge variant="secondary">{visiblePlayers.length} jugadores</Badge>
            </div>
          </div>
          <div className="divide-y">
            {visiblePlayers.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No hay jugadores cargados para este filtro.</div>
            ) : (
              visiblePlayers.map((player) => (
                <div key={player.id} className="grid gap-3 p-4 md:grid-cols-[1.2fr_1.4fr_0.6fr_1fr_auto] md:items-center">
                  <div className="flex items-center gap-2">
                    <TeamFlag code={player.team?.flag_emoji} label={player.team?.name_es} />
                    <span className="text-sm font-semibold">{player.team?.name_es}</span>
                  </div>
                  <Input defaultValue={player.name} onBlur={(e) => e.target.value !== player.name && updatePlayer(player, { name: e.target.value })} />
                  <Input defaultValue={player.shirt_number ?? ''} type="number" min={1} max={99} onBlur={(e) => updatePlayer(player, { shirt_number: e.target.value ? parseInt(e.target.value) : null })} />
                  <Input defaultValue={player.position ?? ''} onBlur={(e) => updatePlayer(player, { position: e.target.value || null })} />
                  <Button type="button" variant="outline" size="sm" onClick={() => toggleActive(player)}>
                    {player.active ? 'Activo' : 'Inactivo'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
