import { createServerSupabaseClient } from '@/lib/supabase'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Profile } from '@/types'

export default async function AdminUsuariosPage() {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, favorite_team, role, total_points, created_at')
    .order('created_at', { ascending: false })

  const users = (data ?? []) as Profile[]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Usuarios registrados</h2>
        <p className="text-muted-foreground">Lista de jugadores, roles y puntos acumulados.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Total: {users.length}</CardTitle>
          <Badge variant="outline">Hora Perú</Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Equipo favorito</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Puntos</TableHead>
                  <TableHead>Registro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.favorite_team || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Jugador'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold tabular-nums">{user.total_points}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatPeruShortDateTime(user.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
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
