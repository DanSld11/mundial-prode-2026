'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

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

export async function adminGetAllWallets() {
  const db = createServiceRoleClient()
  const { data } = await db
    .from('wallets')
    .select('*, profile:profiles(username)')
    .order('balance', { ascending: false })
  return data ?? []
}

export async function adminGiveCoinsAction(targetUserId: string | 'all', amount: number, description: string) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }
  if (!amount || amount <= 0) return { error: 'El monto debe ser mayor a 0' }

  const db = createServiceRoleClient()

  // Obtener usuarios destino
  let userIds: string[] = []
  if (targetUserId === 'all') {
    const { data } = await db.from('profiles').select('id')
    userIds = (data ?? []).map((p: any) => p.id)
  } else {
    userIds = [targetUserId]
  }

  let errors = 0
  for (const uid of userIds) {
    const { data: wallet } = await db.from('wallets').select('balance, total_deposited').eq('user_id', uid).single()
    if (!wallet) continue
    const newBalance   = wallet.balance + amount
    const newDeposited = wallet.total_deposited + amount
    const { error } = await db.from('wallets')
      .update({ balance: newBalance, total_deposited: newDeposited, updated_at: new Date().toISOString() })
      .eq('user_id', uid)
    if (error) { errors++; continue }
    await db.from('wallet_transactions').insert({
      user_id: uid,
      amount,
      balance_after: newBalance,
      type: 'admin_adjustment',
      description: description || `Recarga de ${amount} coins`,
    })
  }

  revalidatePath('/admin/wallet')
  revalidatePath('/dashboard/wallet')

  if (errors > 0) return { error: `${errors} errores al procesar` }
  return { success: true, count: userIds.length }
}

export async function adminGetAllPools() {
  const db = createServiceRoleClient()
  const { data } = await db
    .from('pools')
    .select('*, creator:profiles!pools_created_by_fkey(username)')
    .order('created_at', { ascending: false })

  const enriched = await Promise.all((data ?? []).map(async (pool: any) => {
    const { count } = await db.from('pool_members').select('*', { count: 'exact', head: true }).eq('pool_id', pool.id)
    return { ...pool, member_count: count ?? 0, pot: (pool.entry_fee ?? 0) * (count ?? 0) }
  }))
  return enriched
}

export async function adminPayoutPoolAction(poolId: string) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }
  const db = createServiceRoleClient()

  // Obtener pool
  const { data: pool } = await db.from('pools').select('*').eq('id', poolId).single()
  if (!pool) return { error: 'Polla no encontrada' }
  if (pool.status === 'paid') return { error: 'Esta polla ya fue pagada' }

  // Obtener miembros con puntos
  const { data: members } = await db
    .from('pool_members')
    .select('user_id, profile:profiles(total_points, username)')
    .eq('pool_id', poolId)

  const sorted = (members ?? []).sort(
    (a: any, b: any) => (b.profile?.total_points ?? 0) - (a.profile?.total_points ?? 0)
  )

  const pot        = pool.entry_fee * sorted.length
  const prize1     = Math.floor(pot * pool.prize_1st / 100)
  const prize2     = Math.floor(pot * pool.prize_2nd / 100)
  const prize3     = Math.floor(pot * pool.prize_3rd / 100)
  const prizes     = [prize1, prize2, prize3]

  // Pagar a los ganadores
  for (let i = 0; i < Math.min(sorted.length, 3); i++) {
    const uid   = sorted[i].user_id
    const prize = prizes[i]
    if (!prize) continue

    const { data: wallet } = await db.from('wallets').select('balance, total_won').eq('user_id', uid).single()
    if (!wallet) continue
    const newBalance = wallet.balance + prize
    const newWon     = (wallet.total_won ?? 0) + prize

    await db.from('wallets').update({
      balance: newBalance, total_won: newWon, updated_at: new Date().toISOString()
    }).eq('user_id', uid)

    await db.from('wallet_transactions').insert({
      user_id: uid, amount: prize, balance_after: newBalance,
      type: 'pool_prize',
      description: `Premio ${i + 1}° lugar — "${pool.name}"`,
      pool_id: poolId,
    })

    await db.from('pool_members').update({
      final_position: i + 1, prize_earned: prize, paid_out: true
    }).eq('pool_id', poolId).eq('user_id', uid)
  }

  await db.from('pools').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', poolId)

  revalidatePath('/admin/wallet')
  revalidatePath('/dashboard/pollas')
  return { success: true, paid: Math.min(sorted.length, 3) }
}

export async function adminUpdatePoolStatus(poolId: string, status: string) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }
  const db = createServiceRoleClient()
  const { error } = await db.from('pools').update({ status, updated_at: new Date().toISOString() }).eq('id', poolId)
  if (error) return { error: error.message }
  revalidatePath('/admin/wallet')
  return { success: true }
}
