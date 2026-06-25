import { NextResponse, type NextRequest } from 'next/server'

function getTokensFromRequest(request: NextRequest): { accessToken: string | null; refreshToken: string | null } {
  const refreshToken = request.cookies.get('sb-refresh-token')?.value ?? null

  // Legacy format: sb-access-token
  const legacy = request.cookies.get('sb-access-token')?.value
  if (legacy) return { accessToken: legacy, refreshToken }

  // @supabase/ssr format: sb-<projectRef>-auth-token (may be chunked as .0)
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(/\/\/(.+?)\.supabase/)?.[1]
  if (projectRef) {
    const key = `sb-${projectRef}-auth-token`
    const raw = request.cookies.get(key)?.value ?? request.cookies.get(`${key}.0`)?.value
    if (raw) {
      try {
        const session = JSON.parse(decodeURIComponent(raw))
        if (session?.access_token) return { accessToken: session.access_token as string, refreshToken: session.refresh_token ?? refreshToken }
      } catch {}
    }
  }

  return { accessToken: null, refreshToken }
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof decoded.exp !== 'number') return false
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

async function refreshSession(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data.access_token) return null
    return { accessToken: data.access_token, refreshToken: data.refresh_token ?? refreshToken }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { accessToken, refreshToken } = getTokensFromRequest(request)
  const loginUrl = new URL('/auth/login', request.url)
  loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)

  // No token at all → login
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(loginUrl)
  }

  // Access token present and valid → allow through
  if (accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.next()
  }

  // Access token missing or expired → try to refresh
  if (!refreshToken) {
    return NextResponse.redirect(loginUrl)
  }

  const refreshed = await refreshSession(refreshToken)
  if (!refreshed) {
    // Refresh failed (token revoked or expired) → login
    return NextResponse.redirect(loginUrl)
  }

  // Set new tokens in the response so the browser picks them up immediately
  const response = NextResponse.next()
  response.cookies.set('sb-access-token', refreshed.accessToken, {
    path: '/',
    maxAge: 3600,
    sameSite: 'lax',
    httpOnly: false,
  })
  response.cookies.set('sb-refresh-token', refreshed.refreshToken, {
    path: '/',
    maxAge: 15552000,
    sameSite: 'lax',
    httpOnly: false,
  })
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
