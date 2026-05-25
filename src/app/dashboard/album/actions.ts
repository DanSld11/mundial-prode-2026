'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { SEED_PLAYERS } from '@/lib/seed-players'

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  return user?.id ?? null
}

export async function getUserWallet() {
  try {
    const uid = await getAuthUserId()
    if (!uid) return { coins: 0 }

    const db = createServiceRoleClient()

    const [walletRes, profileRes] = await Promise.all([
      db.from('wallets').select('balance').eq('user_id', uid).single(),
      db.from('profiles').select('last_daily_pack_date, role').eq('id', uid).single(),
    ])

    return {
      ...(profileRes.data || {}),
      coins: walletRes.data?.balance ?? 0,
    }
  } catch (error) {
    console.error('getUserWallet error:', error)
    return { coins: 0 }
  }
}

export async function getSystemSettings() {
  try {
    const db = createServiceRoleClient()
    const { data } = await db.from('system_settings').select('*')
    const settings: Record<string, any> = {}
    data?.forEach(d => { settings[d.key] = d.value })
    return { packPrice: parseInt(settings['pack_price'] || '100') }
  } catch {
    return { packPrice: 100 }
  }
}

export async function getUserStickers() {
  try {
    const uid = await getAuthUserId()
    if (!uid) return []
    const db = createServiceRoleClient()
    const { data } = await db
      .from('user_stickers')
      .select('*')
      .eq('user_id', uid)
    return data || []
  } catch {
    return []
  }
}

// Genera un sobre de 7 figuritas aleatorias
function generatePack() {
  const pack = []
  const totalPlayers = SEED_PLAYERS.length
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * totalPlayers)
    pack.push(SEED_PLAYERS[randomIndex])
  }
  return pack
}

async function savePackToInventory(userId: string, pack: typeof SEED_PLAYERS, db: any) {
  for (const player of pack) {
    const { data: existing } = await db
      .from('user_stickers')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('team_code', player.team_code)
      .eq('player_name', player.name)
      .single()

    if (existing) {
      await db
        .from('user_stickers')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      await db
        .from('user_stickers')
        .insert({
          user_id: userId,
          team_code: player.team_code,
          player_name: player.name,
          quantity: 1,
        })
    }
  }
}

export async function claimDailyPack() {
  try {
    const uid = await getAuthUserId()
    if (!uid) return { error: 'No autorizado' }

    const db = createServiceRoleClient()

    const { data: profile } = await db
      .from('profiles')
      .select('last_daily_pack_date')
      .eq('id', uid)
      .single()

    const today = new Date().toISOString().split('T')[0]
    if (profile?.last_daily_pack_date === today) {
      return { error: 'Ya reclamaste tu sobre diario hoy.' }
    }

    await db
      .from('profiles')
      .update({ last_daily_pack_date: today })
      .eq('id', uid)

    const pack = generatePack()
    await savePackToInventory(uid, pack, db)

    return { pack }
  } catch (e: any) {
    return { error: e.message || 'Error al reclamar sobre' }
  }
}

export async function buyPack() {
  try {
    const uid = await getAuthUserId()
    if (!uid) return { error: 'No autorizado' }

    const db = createServiceRoleClient()

    const { packPrice } = await getSystemSettings()

    const { data: wallet } = await db
      .from('wallets')
      .select('balance')
      .eq('user_id', uid)
      .single()

    const balance = wallet?.balance ?? 0

    if (balance < packPrice) {
      return { error: 'No tienes suficientes monedas.' }
    }

    await db
      .from('wallets')
      .update({ balance: balance - packPrice })
      .eq('user_id', uid)

    const pack = generatePack()
    await savePackToInventory(uid, pack, db)

    return { pack }
  } catch (e: any) {
    return { error: e.message || 'Error al comprar sobre' }
  }
}
