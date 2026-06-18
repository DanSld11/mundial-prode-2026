import { NextResponse, type NextRequest } from 'next/server'

function getTokenFromRequest(request: NextRequest): string | null {
  // Legacy format: sb-access-token
  const legacy = request.cookies.get('sb-access-token')?.value
  if (legacy) return legacy

  // @supabase/ssr format: sb-<projectRef>-auth-token (may be chunked as .0)
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(/\/\/(.+?)\.supabase/)?.[1]
  if (projectRef) {
    const key = `sb-${projectRef}-auth-token`
    const raw = request.cookies.get(key)?.value ?? request.cookies.get(`${key}.0`)?.value
    if (raw) {
      try {
        const session = JSON.parse(decodeURIComponent(raw))
        if (session?.access_token) return session.access_token as string
      } catch {}
    }
  }

  return null
}

function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof decoded.exp === 'number' ? decoded.exp : null
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = getTokenFromRequest(request)

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const exp = getTokenExpiry(token)
  if (exp !== null && exp * 1000 < Date.now()) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
