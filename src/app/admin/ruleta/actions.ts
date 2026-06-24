'use server'

import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

export async function getAdminRuletaData() {
  const db = createServiceRoleClient()
  const [configRes, profilesRes, accessRes, spinsRes] = await Promise.all([
    db.from('ruleta_config').select('*').eq('id', 1).single(),
    db.from('profiles').select('id, username, avatar_url').order('username'),
    db.from('ruleta_access').select('user_id, enabled'),
    db.from('ruleta_spins').select('id, user_id, result_label, result_type, points_change, coins_spent, created_at, profiles!ruleta_spins_user_id_fkey(username)')
      .order('created_at', { ascending: false }).limit(30),
  ])
  return {
    config: configRes.data ?? { id: 1, is_active: false, price_coins: 50, slots: [] },
    profiles: profilesRes.data ?? [],
    access: accessRes.data ?? [],
    recentSpins: spinsRes.data ?? [],
  }
}

export async function updateRuletaConfigAction(updates: {
  is_active?: boolean
  price_coins?: number
  slots?: any[]
}) {
  const db = createServiceRoleClient()
  await db.from('ruleta_config').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', 1)
  revalidatePath('/admin/ruleta')
  return { success: true }
}

export async function toggleRuletaAccessAction(userId: string, enabled: boolean) {
  const db = createServiceRoleClient()
  await db.from('ruleta_access').upsert({ user_id: userId, enabled }, { onConflict: 'user_id' })
  revalidatePath('/admin/ruleta')
  return { success: true }
}
