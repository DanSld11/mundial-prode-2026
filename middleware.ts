import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas
  const publicRoutes = ['/auth/login', '/auth/register', '/', '/api/setup', '/api/setup-v2', '/api/test', '/api/debug-login', '/api/check-auth', '/favicon.ico']
  if (publicRoutes.some(r => pathname === r || pathname.startsWith('/api/') || pathname.startsWith('/_next/') || pathname.startsWith('/auth/'))) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('sb-access-token')?.value
  if (!accessToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    // Verificar el token con Supabase
    const res = await fetch(`https://anbfhgkaaaqvjeiwtojp.supabase.co/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYmZoZ2thYWFxdmplaXd0b2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjg1OTksImV4cCI6MjA5NDcwNDU5OX0.rsfIrfuYdpLxdR2OlfU0k4Ddf0h4sHmyM6Nj48IDSlc',
      },
    })

    if (!res.ok) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
