// =============================================
// SUPABASE CLIENT — MUNDIAL PERÚ 2026
// =============================================
// Instalación: npm install @supabase/supabase-js @supabase/ssr
// Variables de entorno en .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function missingSupabaseConfigError() {
  return new Error('Supabase env vars are not configured')
}

function createMissingServerClient() {
  const result = Promise.resolve({ data: null, error: missingSupabaseConfigError() })
  const query = {
    select: () => query,
    eq: () => query,
    single: () => result,
    maybeSingle: () => result,
    then: result.then.bind(result),
    catch: result.catch.bind(result),
    finally: result.finally.bind(result),
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: missingSupabaseConfigError() }),
      signOut: async () => ({ error: null }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: missingSupabaseConfigError() }),
      signUp: async () => ({ data: { session: null, user: null }, error: missingSupabaseConfigError() }),
    },
    from: () => query,
  } as any
}

// ── Client-side singleton (usar en componentes con 'use client') ──
let _browserInstance: ReturnType<typeof createBrowserClient> | null = null
export function createClient() {
  if (!hasSupabaseConfig()) {
    throw missingSupabaseConfigError()
  }

  if (typeof window === 'undefined') {
    // Should not be called server-side; return a fresh one for safety
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  if (!_browserInstance) {
    _browserInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  return _browserInstance
}

// ── Server-side (usar en Server Components y API routes) ──
export async function createServerSupabaseClient() {
  if (!hasSupabaseConfig()) {
    return createMissingServerClient()
  }

  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            console.error('Error setting cookies:', error)
          }
        },
      },
    }
  )
}
