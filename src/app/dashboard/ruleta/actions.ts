'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

import { SlotDef, slotLabel } from './constants'
export type { SlotDef }

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

async function getWeeklyFreeSpinStatus(db: ReturnType<typeof createServiceRoleClient>, uid: string) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data } = await db
    .from('ruleta_spins')
    .select('id, created_at')
    .eq('user_id', uid)
    .eq('is_free_retry', false)
    .eq('coins_spent', 0)
    .gte('created_at', oneWeekAgo)
    .limit(1)

  if (data && data.length > 0) {
    // Already used weekly free spin — compute when it resets
    const usedAt = new Date(data[0].created_at)
    const resetsAt = new Date(usedAt.getTime() + 7 * 24 * 60 * 60 * 1000)
    return { hasFreeSpin: false, resetsAt }
  }
  return { hasFreeSpin: true, resetsAt: null }
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

  const weeklyStatus = uid ? await getWeeklyFreeSpinStatus(db, uid) : { hasFreeSpin: false, resetsAt: null }

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
    hasWeeklyFreeSpin: weeklyStatus.hasFreeSpin,
    weeklyFreeSpinResetsAt: weeklyStatus.resetsAt?.toISOString() ?? null,
  }
}

export async function spinRuletaAction(isFreeRetry: boolean) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  const db = createServiceRoleClient()

  const { data: config } = await db.from('ruleta_config').select('*').eq('id', 1).single()
  if (!config?.is_active) return { error: 'La ruleta no está activa' }

  const slots: SlotDef[] = config.slots ?? []
  if (slots.length === 0) return { error: 'Sin configuración de slots' }

  const { data: profile } = await db.from('profiles').select('role, total_points').eq('id', uid).single()
  const isAdmin = profile?.role === 'admin'
  if (!isAdmin) {
    const { data: access } = await db.from('ruleta_access').select('enabled').eq('user_id', uid).maybeSingle()
    if (!access?.enabled) return { error: 'No tenés acceso a la ruleta' }
  }

  const priceCoins = config.price_coins ?? 50
  let coinsSpent = 0
  let usedWeeklyFreeSpin = false

  if (!isFreeRetry) {
    // Check weekly free spin (admins always have it free to test)
    const weeklyStatus = isAdmin ? { hasFreeSpin: true } : await getWeeklyFreeSpinStatus(db, uid)

    if (weeklyStatus.hasFreeSpin) {
      // Use the weekly free spin — no coins
      usedWeeklyFreeSpin = true
    } else {
      // Must pay coins
      const { data: wallet } = await db.from('wallets').select('balance').eq('user_id', uid).maybeSingle()
      if ((wallet?.balance ?? 0) < priceCoins) {
        const resetsAt = (weeklyStatus as any).resetsAt as Date
        const diffMs = resetsAt.getTime() - Date.now()
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
        const timeStr = diffDays >= 1 ? `${diffDays} día${diffDays > 1 ? 's' : ''}` : `${diffHours}h`
        return { error: `Ya usaste tu giro gratis esta semana. El próximo es en ${timeStr}. Necesitás ${priceCoins} coins para girar de nuevo.` }
      }
      coinsSpent = priceCoins
      const { data: wallet2 } = await db.from('wallets').select('balance').eq('user_id', uid).maybeSingle()
      await db.from('wallets').update({ balance: (wallet2?.balance ?? 0) - priceCoins }).eq('user_id', uid)
    }
  }

  const resultIndex = Math.floor(Math.random() * slots.length)
  const slot = slots[resultIndex]
  const label = slotLabel(slot)

  let pointsChange = 0
  if (slot.type === 'points') {
    const currentPoints = profile?.total_points ?? 0
    const rawChange = slot.value
    pointsChange = rawChange < 0 ? Math.max(rawChange, -currentPoints) : rawChange
    await db.from('profiles').update({ total_points: currentPoints + pointsChange }).eq('id', uid)
  }

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
    usedWeeklyFreeSpin,
    isRetry: slot.type === 'retry',
  }
}
