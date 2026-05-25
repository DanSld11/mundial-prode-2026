'use server'

import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

async function assertAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  if (!user) return null
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? user : null
}

export async function adminGetPackPrice() {
  const db = createServiceRoleClient()
  const { data } = await db.from('system_settings').select('value').eq('key', 'pack_price').single()
  return data?.value ? parseInt(data.value as string) : 100
}

export async function adminUpdatePackPrice(price: number) {
  if (!await assertAdmin()) return { error: 'Sin permisos' }
  const db = createServiceRoleClient()
  
  await db.from('system_settings')
    .update({ value: price.toString() })
    .eq('key', 'pack_price')
    
  revalidatePath('/dashboard/album')
  revalidatePath('/admin/album')
  return { success: true }
}
