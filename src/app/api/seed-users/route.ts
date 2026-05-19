import { createServerSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createServerSupabaseClient()

  // Crear usuario admin
  const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@prode.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: { username: 'admin', favorite_team: 'Argentina' },
  })

  if (adminError) {
    console.error('Admin error:', adminError)
  } else if (admin?.user) {
    await supabase.from('profiles').update({ role: 'admin' }).eq('id', admin.user.id)
  }

  // Crear usuario jugador
  const { data: jugador, error: jugadorError } = await supabase.auth.admin.createUser({
    email: 'jugador@prode.com',
    password: 'jugador123',
    email_confirm: true,
    user_metadata: { username: 'jugador', favorite_team: 'Brasil' },
  })

  if (jugadorError) {
    console.error('Jugador error:', jugadorError)
  }

  return NextResponse.json({
    admin: adminError ? { error: adminError.message } : { success: true, email: admin?.user?.email },
    jugador: jugadorError ? { error: jugadorError.message } : { success: true, email: jugador?.user?.email },
  })
}
