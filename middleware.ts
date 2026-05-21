import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/admin']
const PUBLIC_PREFIXES = ['/auth/login', '/auth/register', '/auth/logout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  if (isPublic) return NextResponse.next()

  const token = request.cookies.get('sb-access-token')?.value
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
