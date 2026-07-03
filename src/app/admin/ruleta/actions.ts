'use server'

import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

export async function getAdminRuletaData() {
  const db = createServiceRoleClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [configRes, profilesRes, accessRes, spinsRes, freeSpinsRes] = await Promise.all([
    db.from('ruleta_config').select('*').eq('id', 1).single(),
    db.from('profiles').select('id, username, avatar_url').order('username'),
    db.from('ruleta_access').select('user_id, enabled'),
    db.from('ruleta_spins').select('id, user_id, result_label, result_type, points_change, coins_spent, created_at, profiles!ruleta_spins_user_id_fkey(username)')
      .order('created_at', { ascending: false }).limit(30),
    // Giro gratis usado esta semana por cada usuario (excluye los reseteados por admin)
    db.from('ruleta_spins').select('user_id, created_at')
      .eq('is_free_retry', false).eq('coins_spent', 0)
      .eq('weekly_reset', false)
      .gte('created_at', oneWeekAgo)
      .order('created_at', { ascending: false }),
  ])

  // Build map: userId → resetsAt (when their weekly free spin resets)
  const freeSpinMap: Record<string, string> = {}
  for (const spin of freeSpinsRes.data ?? []) {
    if (!freeSpinMap[spin.user_id]) {
      const resetsAt = new Date(new Date(spin.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      freeSpinMap[spin.user_id] = resetsAt
    }
  }

  return {
    config: configRes.data ?? { id: 1, is_active: false, price_coins: 50, slots: [] },
    profiles: profilesRes.data ?? [],
    access: accessRes.data ?? [],
    recentSpins: spinsRes.data ?? [],
    freeSpinMap,
  }
}

export async function resetUserWeeklySpinAction(userId: string) {
  const db = createServiceRoleClient()
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  // Marcar (no borrar) los giros gratis de la semana: el usuario recupera su
  // giro semanal pero el historial de points_change queda intacto para los totales.
  await db.from('ruleta_spins')
    .update({ weekly_reset: true })
    .eq('user_id', userId)
    .eq('is_free_retry', false)
    .eq('coins_spent', 0)
    .eq('weekly_reset', false)
    .gte('created_at', oneWeekAgo)
  revalidatePath('/admin/ruleta')
  return { success: true }
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
