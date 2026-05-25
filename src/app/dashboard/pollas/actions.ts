'use server'

import { cookies } from 'next/headers'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function getAuthUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sb-access-token')?.value
  if (!token) return null
  const db = createServiceRoleClient()
  const { data: { user } } = await db.auth.getUser(token)
  return user?.id ?? null
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/* ── Obtener mis pollas ── */
export async function getMyPools() {
  const uid = await getAuthUserId()
  if (!uid) return []
  const db = createServiceRoleClient()

  const { data } = await db
    .from('pool_members')
    .select(`
      pool_id,
      joined_at,
      prize_earned,
      final_position,
      pool:pools(
        id, name, description, invite_code, entry_fee,
        prize_1st, prize_2nd, prize_3rd, status,
        max_participants, created_by, created_at,
        creator:profiles!pools_created_by_fkey(username)
      )
    `)
    .eq('user_id', uid)
    .order('joined_at', { ascending: false })

  // Enriquecer con cantidad de miembros
  const pools = (data ?? []).map((m: any) => m.pool).filter(Boolean)

  const enriched = await Promise.all(pools.map(async (pool: any) => {
    const { count } = await db
      .from('pool_members')
      .select('*', { count: 'exact', head: true })
      .eq('pool_id', pool.id)
    return { ...pool, member_count: count ?? 0 }
  }))

  return enriched
}

/* ── Detalle de una polla ── */
export async function getPoolDetail(poolId: string) {
  const uid = await getAuthUserId()
  if (!uid) return null
  const db = createServiceRoleClient()

  const [poolRes, membersRes] = await Promise.all([
    db.from('pools')
      .select('*, creator:profiles!pools_created_by_fkey(username)')
      .eq('id', poolId)
      .single(),
    db.from('pool_members')
      .select('*, profile:profiles(username, total_points, avatar_url)')
      .eq('pool_id', poolId)
      .order('joined_at'),
  ])

  if (!poolRes.data) return null

  // Ordenar miembros por total_points descendente
  const members = (membersRes.data ?? []).sort(
    (a: any, b: any) => (b.profile?.total_points ?? 0) - (a.profile?.total_points ?? 0)
  )

  const entryFee    = poolRes.data.entry_fee ?? 0
  const memberCount = members.length
  const pot         = entryFee * memberCount

  return {
    pool: poolRes.data,
    members,
    pot,
    myUserId: uid,
    isMember: members.some((m: any) => m.user_id === uid),
  }
}

/* ── Crear polla ── */
export async function createPoolAction(formData: {
  name: string
  description: string
  entry_fee: number
  max_participants: number | null
  prize_1st: number
  prize_2nd: number
  prize_3rd: number
}) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }
  if (formData.prize_1st + formData.prize_2nd + formData.prize_3rd !== 100)
    return { error: 'Los porcentajes de premio deben sumar 100' }

  const db = createServiceRoleClient()

  // Verificar saldo si hay entrada
  if (formData.entry_fee > 0) {
    const { data: wallet } = await db.from('wallets').select('balance').eq('user_id', uid).single()
    if ((wallet?.balance ?? 0) < formData.entry_fee)
      return { error: `Saldo insuficiente. Necesitás ${formData.entry_fee} coins.` }
  }

  // Generar código único
  let invite_code = generateCode()
  let attempts = 0
  while (attempts < 5) {
    const { data: existing } = await db.from('pools').select('id').eq('invite_code', invite_code).maybeSingle()
    if (!existing) break
    invite_code = generateCode()
    attempts++
  }

  // Crear pool
  const { data: pool, error: poolErr } = await db.from('pools').insert({
    name: formData.name,
    description: formData.description || null,
    invite_code,
    created_by: uid,
    entry_fee: formData.entry_fee,
    max_participants: formData.max_participants,
    prize_1st: formData.prize_1st,
    prize_2nd: formData.prize_2nd,
    prize_3rd: formData.prize_3rd,
    status: 'open',
  }).select().single()

  if (poolErr) return { error: poolErr.message }

  // Agregar creador como primer miembro
  await db.from('pool_members').insert({ pool_id: pool.id, user_id: uid })

  // Cobrar entrada al creador
  if (formData.entry_fee > 0) {
    const { data: wallet } = await db.from('wallets').select('balance, total_wagered').eq('user_id', uid).single()
    const newBalance = (wallet?.balance ?? 0) - formData.entry_fee
    const newWagered = (wallet?.total_wagered ?? 0) + formData.entry_fee
    await db.from('wallets')
      .update({ balance: newBalance, total_wagered: newWagered, updated_at: new Date().toISOString() })
      .eq('user_id', uid)
    await db.from('wallet_transactions').insert({
      user_id: uid,
      amount: -formData.entry_fee,
      balance_after: newBalance,
      type: 'pool_entry',
      description: `Entrada a "${formData.name}"`,
      pool_id: pool.id,
    })
  }

  revalidatePath('/dashboard/pollas')
  return { success: true, poolId: pool.id, invite_code }
}

/* ── Unirse a una polla por código ── */
export async function joinPoolAction(inviteCode: string) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  const code = inviteCode.trim().toUpperCase()
  const db = createServiceRoleClient()

  // Buscar pool
  const { data: pool } = await db.from('pools').select('*').eq('invite_code', code).maybeSingle()
  if (!pool) return { error: 'Código inválido. Verificá que esté escrito correctamente.' }
  if (pool.status !== 'open') return { error: 'Esta polla ya no acepta nuevos participantes.' }

  // ¿Ya es miembro?
  const { data: existing } = await db.from('pool_members')
    .select('user_id').eq('pool_id', pool.id).eq('user_id', uid).maybeSingle()
  if (existing) return { error: 'Ya sos miembro de esta polla.' }

  // Verificar máximo de participantes
  if (pool.max_participants) {
    const { count } = await db.from('pool_members').select('*', { count: 'exact', head: true }).eq('pool_id', pool.id)
    if ((count ?? 0) >= pool.max_participants)
      return { error: 'La polla está llena.' }
  }

  // Verificar saldo
  if (pool.entry_fee > 0) {
    const { data: wallet } = await db.from('wallets').select('balance').eq('user_id', uid).single()
    if ((wallet?.balance ?? 0) < pool.entry_fee)
      return { error: `Saldo insuficiente. Necesitás ${pool.entry_fee} coins.` }
  }

  // Unirse
  const { error: joinErr } = await db.from('pool_members').insert({ pool_id: pool.id, user_id: uid })
  if (joinErr) return { error: joinErr.message }

  // Cobrar entrada
  if (pool.entry_fee > 0) {
    const { data: wallet } = await db.from('wallets').select('balance, total_wagered').eq('user_id', uid).single()
    const newBalance = (wallet?.balance ?? 0) - pool.entry_fee
    const newWagered = (wallet?.total_wagered ?? 0) + pool.entry_fee
    await db.from('wallets').update({ balance: newBalance, total_wagered: newWagered, updated_at: new Date().toISOString() }).eq('user_id', uid)
    await db.from('wallet_transactions').insert({
      user_id: uid,
      amount: -pool.entry_fee,
      balance_after: newBalance,
      type: 'pool_entry',
      description: `Entrada a "${pool.name}"`,
      pool_id: pool.id,
    })
  }

  revalidatePath('/dashboard/pollas')
  return { success: true, poolId: pool.id }
}

/* ── Enviar mensaje al chat ── */
export async function sendMessageAction(poolId: string, message: string) {
  const uid = await getAuthUserId()
  if (!uid) return { error: 'No autenticado' }

  const trimmed = message.trim()
  if (!trimmed || trimmed.length > 500) return { error: 'Mensaje inválido' }

  const db = createServiceRoleClient()

  const { data: membership } = await db
    .from('pool_members')
    .select('user_id')
    .eq('pool_id', poolId)
    .eq('user_id', uid)
    .maybeSingle()

  if (!membership) return { error: 'No sos miembro de esta polla' }

  const { error } = await db.from('pool_messages').insert({
    pool_id: poolId,
    user_id: uid,
    message: trimmed,
  })

  if (error) return { error: error.message }
  return { success: true }
}

/* ── Obtener predicciones de un miembro (solo partidos finalizados) ── */
export async function getMemberPredictionsAction(poolId: string, targetUserId: string) {
  const uid = await getAuthUserId()
  if (!uid) return null

  const db = createServiceRoleClient()

  // Verificar que el solicitante es miembro de la polla
  const { data: membership } = await db
    .from('pool_members')
    .select('user_id')
    .eq('pool_id', poolId)
    .eq('user_id', uid)
    .maybeSingle()

  if (!membership) return null

  // Verificar que el objetivo también es miembro
  const { data: targetMembership } = await db
    .from('pool_members')
    .select('user_id')
    .eq('pool_id', poolId)
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (!targetMembership) return null

  const { data } = await db
    .from('predictions')
    .select(`
      id, predicted_home_score, predicted_away_score, predicted_outcome,
      points_earned, is_exact_score, outcome_points, exact_score_points,
      match:matches(
        id, home_score, away_score, status, match_date,
        home_team:teams!matches_home_team_id_fkey(name_es, code, flag_emoji),
        away_team:teams!matches_away_team_id_fkey(name_es, code, flag_emoji)
      )
    `)
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })

  return (data ?? []).filter((p: any) => {
    if (!p.match) return false
    return p.match.status === 'finished' || new Date(p.match.match_date) <= new Date()
  })
}
