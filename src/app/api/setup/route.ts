import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const results: any = {
    found: [],
    deleted: [],
    admin: null,
    jugador: null,
  }

  try {
    // Listar TODOS los usuarios
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json({ error: 'Cannot list users: ' + listError.message }, { status: 500 })
    }

    const allUsers = userList?.users || []
    results.found = allUsers.map((u: any) => u.email)

    // Borrar usuarios que coincidan
    for (const user of allUsers) {
      if (user.email === 'admin@prode.com' || user.email === 'jugador@prode.com') {
        try {
          await supabase.auth.admin.deleteUser(user.id)
          results.deleted.push(user.email)
        } catch (e: any) {
          results.deleted.push('failed to delete ' + user.email + ': ' + e.message)
        }
      }
    }

    // Pequena espera para que Supabase procese
    await new Promise(r => setTimeout(r, 500))

    // Crear admin
    try {
      const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
        email: 'admin@prode.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: { username: 'admin', favorite_team: 'Argentina' },
      })
      if (adminError) results.admin = { error: adminError.message }
      else if (admin?.user) {
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', admin.user.id)
        results.admin = { success: true, email: admin.user.email, id: admin.user.id }
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
        user_metadata: { username: 'jugador', favorite_team: 'Brasil' },
      })
      if (jugadorError) results.jugador = { error: jugadorError.message }
      else if (jugador?.user) {
        results.jugador = { success: true, email: jugador.user.email, id: jugador.user.id }
      }
    } catch (e: any) {
      results.jugador = { error: e.message }
    }

    // Verificar que los perfiles existen
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, role')
      .in('username', ['admin', 'jugador'])
    results.profiles = profiles

    return NextResponse.json(results)

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
