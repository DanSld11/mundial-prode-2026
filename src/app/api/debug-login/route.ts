import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET
  if (!secret || request.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { email, password } = body
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    return NextResponse.json({ error: 'Supabase env vars are not configured' }, { status: 500 })
  }

  const supabase = createClient(
    url,
    anonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const result = await supabase.auth.signInWithPassword({ email, password })

  return NextResponse.json({
    success: !result.error,
    error: result.error?.message || null,
    hasSession: !!result.data.session,
    userId: result.data.user?.id || null,
    userEmail: result.data.user?.email || null,
  })
}
