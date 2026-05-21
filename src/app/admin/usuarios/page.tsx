import { createServerSupabaseClient } from '@/lib/supabase'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ResetPasswordModal } from './ResetPasswordModal'
import { Users, Trophy } from 'lucide-react'
import type { Profile } from '@/types'

export default async function AdminUsuariosPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, email, favorite_team, role, total_points, created_at')
    .order('created_at', { ascending: false })

  const users = (data ?? []) as (Profile & { email?: string })[]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Usuarios registrados</h2>
          <p className="text-sm text-muted-foreground">Gestioná jugadores, roles y contraseñas.</p>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
          <span className="font-bold tabular-nums">{users.length}</span>
          <span className="text-muted-foreground">usuarios totales</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
          <span className="font-bold tabular-nums">{users.filter(u => u.role === 'admin').length}</span>
          <span className="text-muted-foreground">admins</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
          <Trophy className="h-3.5 w-3.5 text-brand-gold" />
          <span className="font-bold tabular-nums">
            {users.length > 0 ? Math.max(...users.map(u => u.total_points ?? 0)) : 0}
          </span>
          <span className="text-muted-foreground">pts máx.</span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Lista de jugadores</CardTitle>
          <Badge variant="outline">Hora Perú</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead className="hidden md:table-cell">Equipo favorito</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Puntos</TableHead>
                  <TableHead className="hidden sm:table-cell">Registro</TableHead>
                  <TableHead className="text-center">Contraseña</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {user.favorite_team || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Jugador'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold tabular-nums">
                      {user.total_points ?? 0}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground sm:table-cell">
                      {formatPeruShortDateTime(user.created_at)}
                    </TableCell>
                    <TableCell className="text-center">
                      <ResetPasswordModal userId={user.id} username={user.username} />
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No hay usuarios registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
