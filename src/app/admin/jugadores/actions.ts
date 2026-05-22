'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { createServiceRoleClient } from '@/lib/server-client'
import { revalidatePath } from 'next/cache'

async function assertAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const db = createServiceRoleClient()
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function getPlayersAdminData() {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador', teams: [], players: [] }

  const db = createServiceRoleClient()
  const [{ data: teams }, { data: players }] = await Promise.all([
    db.from('teams').select('*').order('group_name').order('name_es'),
    db.from('players').select('*, team:teams(id,name_es,code,flag_emoji)').order('name'),
  ])

  return { teams: teams ?? [], players: players ?? [] }
}

export async function createPlayerAction(input: {
  teamId: string
  name: string
  shirtNumber: string
  position: string
}) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }
  if (!input.teamId || !input.name.trim()) return { error: 'Equipo y nombre son obligatorios' }

  const db = createServiceRoleClient()
  const { error } = await db.from('players').insert({
    team_id: input.teamId,
    name: input.name.trim(),
    shirt_number: input.shirtNumber ? parseInt(input.shirtNumber, 10) : null,
    position: input.position.trim() || null,
    active: true,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/jugadores')
  return { success: true }
}

export async function togglePlayerActiveAction(playerId: string, active: boolean) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }

  const db = createServiceRoleClient()
  const { error } = await db
    .from('players')
    .update({ active: !active, updated_at: new Date().toISOString() })
    .eq('id', playerId)

  if (error) return { error: error.message }
  revalidatePath('/admin/jugadores')
  return { success: true }
}

export async function updatePlayerAction(playerId: string, updates: Record<string, unknown>) {
  if (!await assertAdmin()) return { error: 'Sin permisos de administrador' }

  const db = createServiceRoleClient()
  const { error } = await db
    .from('players')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', playerId)

  if (error) return { error: error.message }
  revalidatePath('/admin/jugadores')
  return { success: true }
}
