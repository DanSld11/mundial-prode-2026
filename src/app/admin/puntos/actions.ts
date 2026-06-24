'use server'

import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

export async function getAdminPuntosData() {
  const db = createServiceRoleClient()
  const [profilesRes, adjustmentsRes] = await Promise.all([
    db.from('profiles').select('id, username, total_points, avatar_url').order('username'),
    db.from('user_notifications')
      .select('id, user_id, title, message, points_change, created_at, profiles!user_notifications_user_id_fkey(username)')
      .eq('type', 'point_adjustment')
      .order('created_at', { ascending: false })
      .limit(30),
  ])
  return {
    profiles: profilesRes.data ?? [],
    adjustments: adjustmentsRes.data ?? [],
  }
}

export async function adjustUserPointsAction(
  userId: string,
  amount: number,
  reason: string,
) {
  if (!userId || !reason.trim()) return { error: 'Faltan datos' }
  if (amount === 0) return { error: 'El ajuste no puede ser 0' }

  const db = createServiceRoleClient()

  // Get current points
  const { data: profile } = await db.from('profiles').select('total_points, username').eq('id', userId).single()
  if (!profile) return { error: 'Usuario no encontrado' }

  const currentPoints = profile.total_points ?? 0
  const newPoints = Math.max(0, currentPoints + amount)
  const actualChange = newPoints - currentPoints

  // Update points
  const { error: updateErr } = await db.from('profiles').update({ total_points: newPoints }).eq('id', userId)
  if (updateErr) return { error: updateErr.message }

  // Create notification banner for user
  const sign = actualChange > 0 ? '+' : ''
  await db.from('user_notifications').insert({
    user_id: userId,
    type: 'point_adjustment',
    title: actualChange > 0 ? '🎉 ¡Recibiste puntos!' : '⚠️ Ajuste de puntos',
    message: reason.trim(),
    points_change: actualChange,
  })

  revalidatePath('/admin/puntos')
  return { success: true, username: profile.username, change: actualChange, newTotal: newPoints }
}
