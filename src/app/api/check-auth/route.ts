import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const allCookies = request.cookies.getAll().map(c => ({
    name: c.name.substring(0, 30) + (c.name.length > 30 ? '...' : ''),
    value_preview: c.value.substring(0, 20) + '...',
  }))

  return NextResponse.json({
    supabaseConfigured: Boolean(url && anonKey),
    cookieCount: request.cookies.getAll().length,
    cookies: allCookies,
  })
}
