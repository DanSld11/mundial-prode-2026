'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Link from 'next/link'

export default function AdminPage() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)

  async function seedTeams() {
    setLoadingTeams(true)
    try {
      const res = await fetch('/api/seed?action=teams')
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else toast.success('48 equipos insertados')
    } catch (e: any) { toast.error(e.message) }
    setLoadingTeams(false)
  }

  async function seedMatches() {
    setLoadingMatches(true)
    try {
      const res = await fetch('/api/seed?action=matches')
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else toast.success('72 partidos insertados')
    } catch (e: any) { toast.error(e.message) }
    setLoadingMatches(false)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Partidos</CardTitle><CardDescription>Carga resultados y gestiona el fixture.</CardDescription></CardHeader>
          <CardContent><Link href="/admin/partidos"><Button className="w-full">Ir a partidos</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Equipos</CardTitle><CardDescription>Administra los equipos participantes.</CardDescription></CardHeader>
          <CardContent><Link href="/admin/equipos"><Button className="w-full">Ir a equipos</Button></Link></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Usuarios</CardTitle><CardDescription>Ver estadísticas y gestionar jugadores.</CardDescription></CardHeader>
          <CardContent><Link href="/admin/usuarios"><Button className="w-full">Ir a usuarios</Button></Link></CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Seeding de Datos</CardTitle>
          <CardDescription>Poblar la base de datos con 48 equipos y 72 partidos.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <Button onClick={seedTeams} disabled={loadingTeams}>{loadingTeams ? 'Insertando...' : 'Insertar 48 Equipos'}</Button>
          <Button onClick={seedMatches} disabled={loadingMatches}>{loadingMatches ? 'Insertando...' : 'Insertar 72 Partidos'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
