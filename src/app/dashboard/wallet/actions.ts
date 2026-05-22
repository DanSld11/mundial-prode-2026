'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'

export async function getAuthUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
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
