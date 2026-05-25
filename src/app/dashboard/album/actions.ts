'use server'

import { createServerClient } from '@/lib/server-client'
import { SEED_PLAYERS } from '@/lib/seed-players'

export async function getUserWallet() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autorizado')

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', session.user.id)
    .single()

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_daily_pack_date, role')
    .eq('id', session.user.id)
    .single()

  return { ...profile, coins: wallet?.balance || 0 }
}

export async function getSystemSettings() {
  const supabase = createServerClient()
  const { data } = await supabase.from('system_settings').select('*')
  const settings: Record<string, any> = {}
  data?.forEach(d => { settings[d.key] = d.value })
  
  return {
    packPrice: parseInt(settings['pack_price'] || '100')
  }
}

export async function getUserStickers() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autorizado')

  const { data } = await supabase
    .from('user_stickers')
    .select('*')
    .eq('user_id', session.user.id)

  return data || []
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

async function savePackToInventory(userId: string, pack: typeof SEED_PLAYERS, supabase: any) {
  // Add to user_stickers
  for (const player of pack) {
    // Check if exists
    const { data: existing } = await supabase
      .from('user_stickers')
      .select('id, quantity')
      .eq('user_id', userId)
      .eq('team_code', player.team_code)
      .eq('player_name', player.name)
      .single()

    if (existing) {
      await supabase
        .from('user_stickers')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('user_stickers')
        .insert({
          user_id: userId,
          team_code: player.team_code,
          player_name: player.name,
          quantity: 1
        })
    }
  }
}

export async function claimDailyPack() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_daily_pack_date')
    .eq('id', session.user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]
  if (profile?.last_daily_pack_date === today) {
    throw new Error('Ya reclamaste tu sobre diario hoy.')
  }

  // Update date
  await supabase
    .from('profiles')
    .update({ last_daily_pack_date: today })
    .eq('id', session.user.id)

  // Generate pack
  const pack = generatePack()
  await savePackToInventory(session.user.id, pack, supabase)

  return pack
}

export async function buyPack() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('No autorizado')

  // Get settings and coins
  const { packPrice } = await getSystemSettings()
  const profile = await getUserWallet()

  if (!profile || profile.coins < packPrice) {
    throw new Error('No tienes suficientes monedas.')
  }

  // Deduct coins from wallets
  await supabase
    .from('wallets')
    .update({ balance: profile.coins - packPrice })
    .eq('user_id', session.user.id)


  // Generate pack
  const pack = generatePack()
  await savePackToInventory(session.user.id, pack, supabase)

  return pack
}
