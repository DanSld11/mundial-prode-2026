import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Trophy, ShieldCheck, UserX } from 'lucide-react'
import { ResetPasswordModal, ToggleUserStatus } from './UserActions'

export const dynamic = 'force-dynamic'

export default async function AdminUsuariosPage() {
  const supabase = await createServerSupabaseClient()

  // 1. Obtener perfiles de la tabla profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, favorite_team, role, total_points, created_at')
    .order('created_at', { ascending: false })

  // 2. Obtener datos de auth.users (email + estado ban) con service role
  let authUsersMap: Record<string, { email: string; banned: boolean }> = {}
  try {
    const admin = createServiceRoleClient()
    const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
    for (const u of authData?.users ?? []) {
      authUsersMap[u.id] = {
        email: u.email ?? '—',
        banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
      }
    }
  } catch {
    // Si service role no está configurada, seguimos sin email/estado
  }

  // 3. Combinar
  const users = (profiles ?? []).map(p => ({
    ...p,
    email: authUsersMap[p.id]?.email ?? '—',
    isDisabled: authUsersMap[p.id]?.banned ?? false,
  }))

  const totalAdmins   = users.filter(u => u.role === 'admin').length
  const totalDisabled = users.filter(u => u.isDisabled).length
  const maxPoints     = users.length > 0 ? Math.max(...users.map(u => u.total_points ?? 0)) : 0

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

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-bold tabular-nums">{users.length}</span>
          <span className="text-muted-foreground">usuarios</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-bold tabular-nums">{totalAdmins}</span>
          <span className="text-muted-foreground">admins</span>
        </div>
        {totalDisabled > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm shadow-sm dark:border-red-800/50 dark:bg-red-950/20">
            <UserX className="h-3.5 w-3.5 text-red-500" />
            <span className="font-bold tabular-nums text-red-700 dark:text-red-400">{totalDisabled}</span>
            <span className="text-red-600 dark:text-red-500">deshabilitados</span>
          </div>
        )}
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm shadow-sm">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" />
          <span className="font-bold tabular-nums">{maxPoints}</span>
          <span className="text-muted-foreground">pts máx.</span>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Lista de jugadores</CardTitle>
          <Badge variant="outline">{users.length} registrados</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No hay usuarios registrados aún.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Usuario</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Pts</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Estado</th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">Registro</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-b last:border-0 transition-colors hover:bg-muted/20 ${user.isDisabled ? 'opacity-60' : ''}`}
                    >
                      {/* Usuario */}
                      <td className="px-4 py-3">
                        <div className="font-medium leading-tight">{user.username}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground md:hidden">{user.email}</div>
                      </td>

                      {/* Email */}
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {user.email}
                      </td>

                      {/* Rol */}
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[11px]">
                          {user.role === 'admin' ? 'Admin' : 'Jugador'}
                        </Badge>
                      </td>

                      {/* Puntos */}
                      <td className="px-4 py-3 text-center font-bold tabular-nums">
                        {user.total_points ?? 0}
                      </td>

                      {/* Estado */}
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {user.isDisabled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Deshabilitado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {formatPeruShortDateTime(user.created_at)}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ResetPasswordModal userId={user.id} username={user.username} />
                          <ToggleUserStatus
                            userId={user.id}
                            username={user.username}
                            isDisabled={user.isDisabled}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
