import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

async function doSetup() {
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

  try {
    const { data: admin, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@prode.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: { username: 'admin', favorite_team: 'Argentina' },
    })

    if (adminError) {
      results.admin = { error: adminError.message }
    } else if (admin?.user) {
      await supabase.from('profiles').update({ role: 'admin' }).eq('id', admin.user.id)
      results.admin = { success: true, email: admin.user.email }
    }
  } catch (e: any) {
    results.admin = { error: e.message }
  }

  try {
    const { data: jugador, error: jugadorError } = await supabase.auth.admin.createUser({
      email: 'jugador@prode.com',
      password: 'jugador123',
      email_confirm: true,
      user_metadata: { username: 'jugador', favorite_team: 'Brasil' },
    })

    if (jugadorError) {
      results.jugador = { error: jugadorError.message }
    } else if (jugador?.user) {
      results.jugador = { success: true, email: jugador.user.email }
    }
  } catch (e: any) {
    results.jugador = { error: e.message }
  }

  return results
}

export async function POST() {
  const results = await doSetup()
  return NextResponse.json(results)
}

export async function GET() {
  const results = await doSetup()
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Setup Prode 2026</title>
  <style>
    body { font-family: system-ui; max-width: 600px; margin: 50px auto; padding: 20px; background: #0a0a0a; color: #f0ede8; }
    .card { background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; }
    h1 { color: #f4c300; }
    .success { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); padding: 12px; border-radius: 8px; margin: 10px 0; }
    .error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); padding: 12px; border-radius: 8px; margin: 10px 0; }
    .info { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); padding: 12px; border-radius: 8px; margin: 10px 0; }
    code { background: #1a1a1a; padding: 2px 6px; border-radius: 4px; }
    button { background: #C8102E; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 16px; }
    button:hover { background: #e01230; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Setup Prode 2026</h1>
    
    ${results.admin?.success ? `
    <div class="success">
      <strong>Admin creado:</strong> admin@prode.com / admin123
    </div>` : `
    <div class="error">
      <strong>Admin:</strong> ${results.admin?.error || 'Error desconocido'}
    </div>`}
    
    ${results.jugador?.success ? `
    <div class="success">
      <strong>Jugador creado:</strong> jugador@prode.com / jugador123
    </div>` : `
    <div class="error">
      <strong>Jugador:</strong> ${results.jugador?.error || 'Error desconocido'}
    </div>`}
    
    <div class="info">
      <p><strong>Datos de login:</strong></p>
      <p>Admin: <code>admin@prode.com</code> / <code>admin123</code></p>
      <p>Jugador: <code>jugador@prode.com</code> / <code>jugador123</code></p>
    </div>
    
    <p style="margin-top: 20px;">
      <a href="/auth/login"><button>Ir al Login</button></a>
    </p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
