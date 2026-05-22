import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const secret = process.env.ADMIN_SECRET
  if (!secret || request.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )

  const demoUsers = [
    {
      email: process.env.DEMO_ADMIN_EMAIL,
      password: process.env.DEMO_ADMIN_PASSWORD,
      username: process.env.DEMO_ADMIN_USERNAME ?? 'admin',
      favoriteTeam: process.env.DEMO_ADMIN_FAVORITE_TEAM ?? 'Argentina',
      role: 'admin',
    },
    {
      email: process.env.DEMO_PLAYER_EMAIL,
      password: process.env.DEMO_PLAYER_PASSWORD,
      username: process.env.DEMO_PLAYER_USERNAME ?? 'jugador',
      favoriteTeam: process.env.DEMO_PLAYER_FAVORITE_TEAM ?? 'Brasil',
      role: 'player',
    },
  ]

  const missingDemoConfig = demoUsers.some((user) => !user.email || !user.password)
  if (missingDemoConfig) {
    return NextResponse.json(
      { error: 'Missing demo user env vars. Configure DEMO_ADMIN_* and DEMO_PLAYER_* to use this setup route.' },
      { status: 400 },
    )
  }

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

    const demoEmails = demoUsers.map((user) => user.email)

    // Borrar usuarios demo que coincidan
    for (const user of allUsers) {
      if (demoEmails.includes(user.email)) {
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

    for (const demoUser of demoUsers) {
      const resultKey = demoUser.role === 'admin' ? 'admin' : 'jugador'
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email: demoUser.email!,
          password: demoUser.password!,
          email_confirm: true,
          user_metadata: { username: demoUser.username, favorite_team: demoUser.favoriteTeam },
        })
        if (error) results[resultKey] = { error: error.message }
        else if (data?.user) {
          if (demoUser.role === 'admin') {
            await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id)
          }
          results[resultKey] = { success: true, email: data.user.email, id: data.user.id }
        }
      } catch (e: any) {
        results[resultKey] = { error: e.message }
      }
    }

    // Verificar que los perfiles existen
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, role')
      .in('username', demoUsers.map((user) => user.username))
    results.profiles = profiles

    return NextResponse.json(results)

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
