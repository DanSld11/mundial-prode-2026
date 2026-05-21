import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nextPath = (formData.get('next') as string | null) || '/dashboard'

  if (!email || !password) {
    return NextResponse.redirect(new URL('/auth/login?error=Completá+todos+los+campos', request.url))
  }

  const response = NextResponse.redirect(new URL(nextPath.startsWith('/') ? nextPath : '/dashboard', request.url))
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    const msg = error?.message?.includes('Invalid login') ? 'Email+o+contraseña+incorrectos' : 'Error+al+iniciar+sesión'
    return NextResponse.redirect(new URL(`/auth/login?error=${msg}`, request.url))
  }

  return response
}
