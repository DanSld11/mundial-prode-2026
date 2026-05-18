import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SeedButtons } from './seed-buttons'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Partidos</CardTitle>
            <CardDescription>Carga resultados y gestiona el fixture.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/partidos">
              <Button className="w-full">Ir a partidos</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Equipos</CardTitle>
            <CardDescription>Administra los equipos participantes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/equipos">
              <Button className="w-full">Ir a equipos</Button>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>Ver estadísticas y gestionar jugadores.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/usuarios">
              <Button className="w-full">Ir a usuarios</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seeding de Datos</CardTitle>
          <CardDescription>
            Poblar la base de datos con los 48 equipos y 72 partidos de la fase de grupos.
            ¡Solo usar una vez!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SeedButtons />
        </CardContent>
      </Card>
    </div>
  )
}
