import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return NextResponse.redirect(new URL('/auth/login?error=Completá+todos+los+campos', request.url))
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    const msg = error?.message?.includes('Invalid login') ? 'Email+o+contraseña+incorrectos' : 'Error+al+iniciar+sesión'
    return NextResponse.redirect(new URL(`/auth/login?error=${msg}`, request.url))
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url))

  const { access_token, refresh_token } = data.session
  const maxAge = 60 * 60 * 24 * 7
  const cookieOpts = { path: '/', maxAge, sameSite: 'lax' as const, secure: true }

  // httpOnly: session object for server-side reads (middleware, server actions)
  response.cookies.set(
    'sb-anbfhgkaaaqvjeiwtojp-auth-token',
    JSON.stringify([access_token, refresh_token, 'authenticated']),
    { ...cookieOpts, httpOnly: true },
  )

  // Non-httpOnly: raw JWT readable by client-side JS (bracket page, prediction form, etc.)
  response.cookies.set('sb-access-token', access_token, { ...cookieOpts, httpOnly: false })

  return response
}
