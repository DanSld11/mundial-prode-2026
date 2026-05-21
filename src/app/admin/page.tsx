'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { seedTeamsAction, seedMatchesAction, seedPlayersAction, recalculateAllPointsAction } from './actions'
import { createAnonClient } from '@/lib/auth-client'
import { formatPeruLongDateTime } from '@/lib/peru-time'

export default function AdminPage() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [loadingRecalc, setLoadingRecalc] = useState(false)
  const [recentMatches, setRecentMatches] = useState<any[]>([])

  useEffect(() => {
    const supabase = createAnonClient()
    supabase
      .from('matches')
      .select('id, status, home_score, away_score, updated_at, group_name, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji)')
      .eq('status', 'finished')
      .order('updated_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setRecentMatches(data ?? []))
  }, [])

  async function seedTeams() {
    setLoadingTeams(true)
    const result = await seedTeamsAction()
    if (result.error) toast.error(result.error)
    else toast.success(`Insertados ${result.count} equipos`)
    setLoadingTeams(false)
  }

  async function seedMatches() {
    setLoadingMatches(true)
    const result = await seedMatchesAction()
    if (result.error) toast.error(result.error)
    else toast.success(`Insertados ${result.count} partidos`)
    setLoadingMatches(false)
  }

  async function seedPlayers() {
    setLoadingPlayers(true)
    const result = await seedPlayersAction()
    if (result.error) toast.error(result.error)
    else toast.success(`¡${result.count} jugadores de los 48 planteles cargados!`)
    setLoadingPlayers(false)
  }

  async function recalculatePoints() {
    setLoadingRecalc(true)
    const result = await recalculateAllPointsAction()
    if (result.error) toast.error(result.error)
    else toast.success(`Puntos recalculados en ${result.count ?? 0} partidos finalizados`)
    setLoadingRecalc(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel Admin</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestioná el torneo y los datos.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del Mundial</CardTitle>
            <CardDescription>Cargar equipos y fixture oficial.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={seedTeams} disabled={loadingTeams}>
              {loadingTeams ? 'Cargando...' : '48 Equipos'}
            </Button>
            <Button variant="outline" size="sm" onClick={seedMatches} disabled={loadingMatches}>
              {loadingMatches ? 'Cargando...' : '72 Partidos'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={seedPlayers}
              disabled={loadingPlayers}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
            >
              {loadingPlayers ? 'Cargando planteles...' : '🌍 ~700 Jugadores'}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Partidos</CardTitle>
            <CardDescription>Cargar resultados y puntuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/partidos"><Button variant="outline" size="sm">Gestionar</Button></a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Usuarios</CardTitle>
            <CardDescription>Ver jugadores y resetear contraseñas.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/usuarios"><Button variant="outline" size="sm">Gestionar</Button></a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jugadores</CardTitle>
            <CardDescription>Cargar planteles por selección.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/jugadores"><Button variant="outline" size="sm">Gestionar</Button></a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Puntuación</CardTitle>
            <CardDescription>Editar puntos de predicciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/puntuacion"><Button variant="outline" size="sm">Configurar</Button></a>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recalcular puntos</CardTitle>
            <CardDescription>Repara predicciones después de editar resultados o goleadores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={recalculatePoints} disabled={loadingRecalc}>
              {loadingRecalc ? 'Recalculando...' : 'Recalcular ahora'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity log */}
      <div>
        <h2 className="mb-3 text-base font-semibold">Historial de resultados cargados</h2>
        {recentMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay partidos finalizados aún.</p>
        ) : (
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Partido</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Resultado</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground hidden sm:table-cell">Grupo</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground hidden md:table-cell">Actualizado</th>
                </tr>
              </thead>
              <tbody>
                {recentMatches.map((m: any) => (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0">{m.home_team?.flag_emoji}</span>
                        <span className="truncate max-w-[100px] font-medium">{m.home_team?.name_es}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="truncate max-w-[100px] font-medium">{m.away_team?.name_es}</span>
                        <span className="shrink-0">{m.away_team?.flag_emoji}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold tabular-nums">
                      {m.home_score} - {m.away_score}
                    </td>
                    <td className="px-4 py-2.5 text-center hidden sm:table-cell">
                      <Badge variant="secondary">G{m.group_name}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground hidden md:table-cell">
                      {m.updated_at ? formatPeruLongDateTime(m.updated_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
