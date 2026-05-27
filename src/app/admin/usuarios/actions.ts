'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  // Lee el JWT del cookie no-httpOnly que el login route setea
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null

  const admin = createServiceRoleClient()
  const { data: { user } } = await admin.auth.getUser(token)
  if (!user) return null

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}

export async function resetUserPasswordAction(userId: string, newPassword: string) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }
  if (!newPassword || newPassword.length < 6)
    return { error: 'La contraseña debe tener al menos 6 caracteres' }

  const admin = createServiceRoleClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export async function disableUserAction(userId: string) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }

  const admin = createServiceRoleClient()
  // ban_duration: very long period = effectively disabled
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: '876000h', // 100 años
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function enableUserAction(userId: string) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }

  const admin = createServiceRoleClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/usuarios')
  return { success: true }
}

export async function deleteUserAction(userId: string) {
  const caller = await assertAdmin()
  if (!caller) return { error: 'Sin permisos de administrador' }

  // No permitir que el admin se elimine a sí mismo
  if (caller.id === userId) return { error: 'No podés eliminar tu propia cuenta' }

  const admin = createServiceRoleClient()

  // Eliminar perfil primero (por si no hay CASCADE configurado)
  await admin.from('profiles').delete().eq('id', userId)

  // Eliminar de auth.users
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/admin/usuarios')
  return { success: true }
}
