'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { seedTeamsAction, seedMatchesAction, recalculateAllPointsAction } from './actions'

export default function AdminPage() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingRecalc, setLoadingRecalc] = useState(false)

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
          <CardContent className="flex gap-2">
            <Button variant="outline" size="sm" onClick={seedTeams} disabled={loadingTeams}>
              {loadingTeams ? 'Cargando...' : '48 Equipos'}
            </Button>
            <Button variant="outline" size="sm" onClick={seedMatches} disabled={loadingMatches}>
              {loadingMatches ? 'Cargando...' : '72 Partidos'}
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
            <CardDescription>Ver jugadores registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/usuarios"><Button variant="outline" size="sm">Ver lista</Button></a>
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
    </div>
  )
}
