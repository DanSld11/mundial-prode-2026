import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const allCookies = request.cookies.getAll().map(c => ({
    name: c.name.substring(0, 30) + (c.name.length > 30 ? '...' : ''),
    value_preview: c.value.substring(0, 20) + '...',
  }))

  return NextResponse.json({
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    cookieCount: request.cookies.getAll().length,
    cookies: allCookies,
  })
}
