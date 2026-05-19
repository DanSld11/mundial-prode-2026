import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.redirect(new URL('/auth/login?error=Completá+todos+los+campos', request.url))
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.redirect(new URL('/auth/login?error=Email+o+contraseña+incorrectos', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard/grupos', request.url))
  } catch (err: any) {
    console.error('Login error:', err)
    return NextResponse.redirect(new URL('/auth/login?error=Error+del+servidor', request.url))
  }
}
