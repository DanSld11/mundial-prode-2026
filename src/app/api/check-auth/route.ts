import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.json(
      { authenticated: false, error: 'Supabase env vars are not configured' },
      { status: 500 },
    )
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const allCookies = request.cookies.getAll().map(c => ({
    name: c.name.substring(0, 30) + (c.name.length > 30 ? '...' : ''),
    value_preview: c.value.substring(0, 20) + '...',
  }))

  return NextResponse.json({
    authenticated: !!user,
    userEmail: user?.email || null,
    userId: user?.id || null,
    cookieCount: request.cookies.getAll().length,
    cookies: allCookies,
  })
}
