import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// ── Client-side singleton ──
let _browserInstance: ReturnType<typeof createBrowserClient> | null = null
export function createClient() {
  if (!hasSupabaseConfig()) throw new Error('Supabase env vars not configured')
  if (typeof window === 'undefined') {
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

// ── Server-side (Server Components y API routes) ──
export async function createServerSupabaseClient() {
  if (!hasSupabaseConfig()) {
    const result = Promise.resolve({ data: null, error: new Error('Supabase env vars not configured') })
    const q: any = {
      select: () => q, eq: () => q, single: () => result, maybeSingle: () => result,
      then: (r: any) => result.then(r), catch: (r: any) => result.catch(r), finally: (r: any) => result.finally(r),
    }
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
        signInWithPassword: async () => ({ data: { session: null, user: null }, error: null }),
        signUp: async () => ({ data: { session: null, user: null }, error: null }),
      },
      from: () => q,
    } as any
  }

  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
}
