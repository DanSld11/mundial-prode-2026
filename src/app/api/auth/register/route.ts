import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const favoriteTeam = formData.get('favorite_team') as string

    if (!email || !password || !username) {
      return NextResponse.redirect(new URL('/auth/register?error=Completá+todos+los+campos', request.url))
    }

    if (password.length < 8) {
      return NextResponse.redirect(new URL('/auth/register?error=Contraseña+muy+corta', request.url))
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.redirect(new URL('/auth/register?error=Usuario+invalido', request.url))
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

    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.redirect(new URL('/auth/register?error=Usuario+ya+existe', request.url))
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, favorite_team: favoriteTeam || null },
      },
    })

    if (error) {
      return NextResponse.redirect(new URL('/auth/register?error=Error+al+registrarse', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard/grupos', request.url))
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.redirect(new URL('/auth/register?error=Error+del+servidor', request.url))
  }
}
