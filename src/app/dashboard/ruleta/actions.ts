'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  let token = cookieStore.get('sb-access-token')?.value
  if (!token) {
    const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(/\/\/(.+?)\.supabase/)?.[1]
    if (projectRef) {
      const key = `sb-${projectRef}-auth-token`
      const raw = cookieStore.get(key)?.value ?? cookieStore.get(`${key}.0`)?.value
      if (raw) {
        try { const s = JSON.parse(decodeURIComponent(raw)); if (s?.access_token) token = s.access_token } catch {}
      }
    }
  }
  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  return user?.id ?? null
}

export async function getRuletaPageData() {
  const uid = await getAuthUserId()
  const db = createServiceRoleClient()

  const [configRes, accessRes, spinsRes, profileRes, walletRes] = await Promise.all([
    db.from('ruleta_config').select('*').eq('id', 1).single(),
    uid ? db.from('ruleta_access').select('enabled').eq('user_id', uid).maybeSingle() : Promise.resolve({ data: null }),
    uid ? db.from('ruleta_spins').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(20) : Promise.resolve({ data: [] }),
    uid ? db.from('profiles').select('role, username, total_points').eq('id', uid).single() : Promise.resolve({ data: null }),
    uid ? db.from('wallets').select('balance').eq('user_id', uid).maybeSingle() : Promise.resolve({ data: null }),
  ])

  const profile = profileRes.data
  const isAdmin = profile?.role === 'admin'
  const hasAccess = isAdmin || (accessRes.data?.enabled === true)

  return {
    uid,
    isAdmin,
    hasAccess,
    isActive: configRes.data?.is_active ?? false,
    priceCoins: configRes.data?.price_coins ?? 50,
    slots: configRes.data?.slots ?? [],
    spins: spinsRes.data ?? [],
    coinBalance: walletRes.data?.balance ?? 0,
    totalPoints: profile?.total_points ?? 0,
    username: profile?.username ?? '',
  }
}

export interface SlotDef {
  id: number
  type: 'points' | 'retry' | 'nothing'
  value: number
  color: string
}

export function slotLabel(slot: SlotDef): string {
  if (slot.type === 'points') return slot.value > 0 ? `+${slot.value} pts` : `${slot.value} pts`
  if (slot.type === 'retry') return 'Otra vez'
  return 'Piña 🍍'
}

export async function spinRuletaAction(isFreeRetry: boolean) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  const db = createServiceRoleClient()

  // Load config and validate
  const { data: config } = await db.from('ruleta_config').select('*').eq('id', 1).single()
  if (!config?.is_active) return { error: 'La ruleta no está activa' }

  const slots: SlotDef[] = config.slots ?? []
  if (slots.length === 0) return { error: 'Sin configuración de slots' }

  // Check access
  const { data: profile } = await db.from('profiles').select('role, total_points').eq('id', uid).single()
  const isAdmin = profile?.role === 'admin'
  if (!isAdmin) {
    const { data: access } = await db.from('ruleta_access').select('enabled').eq('user_id', uid).maybeSingle()
    if (!access?.enabled) return { error: 'No tenés acceso a la ruleta' }
  }

  const priceCoins = config.price_coins ?? 50

  // Check coins if not free retry
  let coinsSpent = 0
  if (!isFreeRetry) {
    const { data: wallet } = await db.from('wallets').select('balance').eq('user_id', uid).maybeSingle()
    if ((wallet?.balance ?? 0) < priceCoins) return { error: `Necesitás ${priceCoins} coins para girar` }
    coinsSpent = priceCoins
    // Deduct coins
    await db.from('wallets').update({ balance: (wallet?.balance ?? 0) - priceCoins }).eq('user_id', uid)
  }

  // Pick random slot
  const resultIndex = Math.floor(Math.random() * slots.length)
  const slot = slots[resultIndex]
  const label = slotLabel(slot)

  // Apply points change
  let pointsChange = 0
  if (slot.type === 'points') {
    const currentPoints = profile?.total_points ?? 0
    const rawChange = slot.value
    pointsChange = rawChange < 0 ? Math.max(rawChange, -currentPoints) : rawChange
    const newPoints = currentPoints + pointsChange
    await db.from('profiles').update({ total_points: newPoints }).eq('id', uid)
  }

  // Record spin (not for retry itself)
  if (slot.type !== 'retry') {
    await db.from('ruleta_spins').insert({
      user_id: uid,
      result_label: label,
      result_type: slot.type,
      points_change: pointsChange,
      coins_spent: coinsSpent,
      is_free_retry: isFreeRetry,
    })
  }

  revalidatePath('/dashboard/ruleta')
  return {
    success: true,
    resultIndex,
    slot,
    label,
    pointsChange,
    coinsSpent,
    isRetry: slot.type === 'retry',
  }
}
