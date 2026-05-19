import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const results: any = { env: { hasUrl: !!url, hasKey: !!serviceKey }, users: [] }

  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Missing env vars', results }, { status: 500 })
  }

  const headers = {
    'Authorization': `Bearer ${serviceKey}`,
    'apikey': serviceKey,
    'Content-Type': 'application/json',
  }

  const usersToCreate = [
    { email: 'admin@prode.com', password: 'admin123', username: 'admin', team: 'Argentina' },
    { email: 'jugador@prode.com', password: 'jugador123', username: 'jugador', team: 'Brasil' },
  ]

  for (const user of usersToCreate) {
    try {
      // Intentar borrar primero
      await fetch(`${url}/auth/v1/admin/users`, {
        method: 'GET',
        headers,
      })

      // Crear usuario
      const res = await fetch(`${url}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            favorite_team: user.team,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        results.users.push({
          email: user.email,
          error: data.msg || data.message || `HTTP ${res.status}`,
          details: data,
        })
      } else {
        results.users.push({
          email: user.email,
          success: true,
          id: data.id,
        })

        // Hacer admin si es admin
        if (user.username === 'admin' && data.id) {
          await fetch(`${url}/rest/v1/profiles?id=eq.${data.id}`, {
            method: 'PATCH',
            headers: {
              ...headers,
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ role: 'admin' }),
          })
        }
      }
    } catch (e: any) {
      results.users.push({
        email: user.email,
        error: 'Exception: ' + e.message,
      })
    }
  }

  return NextResponse.json(results)
}
