import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { email, password } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
