import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return 'supabase-browser-session'
}

// Module-level singletons — avoids "Multiple GoTrueClient instances" warning
let _browserInstance: ReturnType<typeof createBrowserClient> | null = null

export function createAnonClient() {
  if (typeof window === 'undefined') {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
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

export function createAuthedClient(_token?: string) {
  return createAnonClient()
}

export async function getCurrentUserId(_token?: string): Promise<string | null> {
  const { data } = await createAnonClient().auth.getUser()
  return data.user?.id ?? null
}
