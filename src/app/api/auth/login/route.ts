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

  const response = NextResponse.redirect(new URL('/dashboard/grupos', request.url))

  // Setear cookies manualmente
  const { access_token, refresh_token, expires_at } = data.session

  response.cookies.set('sb-anbfhgkaaaqvjeiwtojp-auth-token', JSON.stringify([access_token, refresh_token, 'authenticated']), {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
  })

  return response
}
