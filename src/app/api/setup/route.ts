import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Este endpoint crea usuarios de prueba
// SOLO usar una vez, luego borrar este archivo
export async function POST() {
  // Usar service_role key para crear usuarios
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const results = {
    admin: null as any,
    jugador: null as any,
  }

  // Crear admin
  try {
    const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@prode.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        username: 'admin',
        favorite_team: 'Argentina',
      },
    })

    if (adminError) {
      results.admin = { error: adminError.message }
    } else {
      // Poner rol admin
      await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', admin.user!.id)

      results.admin = {
        success: true,
        email: admin.user!.email,
        id: admin.user!.id,
      }
    }
  } catch (e: any) {
    results.admin = { error: e.message }
  }

  // Crear jugador
  try {
    const { data: jugador, error: jugadorError } = await supabase.auth.admin.createUser({
      email: 'jugador@prode.com',
      password: 'jugador123',
      email_confirm: true,
      user_metadata: {
        username: 'jugador',
        favorite_team: 'Brasil',
      },
    })

    if (jugadorError) {
      results.jugador = { error: jugadorError.message }
    } else {
      results.jugador = {
        success: true,
        email: jugador.user!.email,
        id: jugador.user!.id,
      }
    }
  } catch (e: any) {
    results.jugador = { error: e.message }
  }

  return NextResponse.json(results)
}
