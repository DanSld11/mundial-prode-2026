'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function AdminPage() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)

  async function seedTeams() {
    setLoadingTeams(true)
    try {
      const res = await fetch('/api/seed?action=teams')
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else toast.success(`Insertados: ${data.count}/48 equipos${data.errors ? ' (con errores)' : ''}`)
    } catch (e: any) { toast.error(e.message) }
    setLoadingTeams(false)
  }

  async function seedMatches() {
    setLoadingMatches(true)
    try {
      const res = await fetch('/api/seed?action=matches')
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else toast.success(`Insertados: ${data.count}/72 partidos${data.errors ? ' (con errores)' : ''}`)
    } catch (e: any) { toast.error(e.message) }
    setLoadingMatches(false)
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
      </div>
    </div>
  )
}
