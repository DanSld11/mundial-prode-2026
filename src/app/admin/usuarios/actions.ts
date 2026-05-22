'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createServiceRoleClient()

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
