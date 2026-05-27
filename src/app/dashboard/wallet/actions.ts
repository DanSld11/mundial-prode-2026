'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'

export async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const admin = createServiceRoleClient()
  const { data: { user } } = await admin.auth.getUser(token)
  return user?.id ?? null
}

export async function getWalletData() {
  const uid = await getAuthUserId()
  if (!uid) return null
  const db = createServiceRoleClient()

  const [walletRes, txRes] = await Promise.all([
    db.from('wallets').select('*').eq('user_id', uid).single(),
    db.from('wallet_transactions')
      .select('*, pool:pools(name)')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  return {
    wallet: walletRes.data,
    transactions: txRes.data ?? [],
  }
}

export async function getMyAdminNotifications() {
  const uid = await getAuthUserId()
  if (!uid) return []
  const db = createServiceRoleClient()
  const { data } = await db
    .from('wallet_transactions')
    .select('id, amount, description, balance_after, created_at')
    .eq('user_id', uid)
    .eq('type', 'admin_adjustment')
    .order('created_at', { ascending: false })
    .limit(30)
  return data ?? []
}
