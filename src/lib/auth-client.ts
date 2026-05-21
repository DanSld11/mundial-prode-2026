import { createClient } from '@supabase/supabase-js'

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find((row) => row.startsWith('sb-access-token='))?.split('=')[1] ?? null
}

// Module-level singletons — avoids "Multiple GoTrueClient instances" warning
let _anonInstance: ReturnType<typeof createClient> | null = null
const _authedInstances = new Map<string, ReturnType<typeof createClient>>()

export function createAnonClient() {
  if (!_anonInstance) {
    _anonInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    )
  }
  return _anonInstance
}

export function createAuthedClient(token: string) {
  if (!_authedInstances.has(token)) {
    _authedInstances.set(
      token,
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: { autoRefreshToken: false, persistSession: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        },
      ),
    )
  }
  return _authedInstances.get(token)!
}

export async function getCurrentUserId(token: string): Promise<string | null> {
  const { data } = await createAuthedClient(token).auth.getUser(token)
  return data.user?.id ?? null
}
