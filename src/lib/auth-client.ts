import { createClient } from '@supabase/supabase-js'

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find((row) => row.startsWith('sb-access-token='))?.split('=')[1] ?? null
}

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function createMissingConfigClient() {
  const result = Promise.resolve({ data: null, error: new Error('Supabase env vars not configured') })
  const query: any = {
    select: () => query, eq: () => query, in: () => query, order: () => query,
    limit: () => query, single: () => result, maybeSingle: () => result,
    insert: () => result, upsert: () => result, update: () => result, delete: () => result,
    filter: () => query, neq: () => query, gte: () => query, lte: () => query,
    then: (r: any) => result.then(r), catch: (r: any) => result.catch(r),
    finally: (r: any) => result.finally(r),
  }
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      updateUser: async () => ({ data: { user: null }, error: null }),
    },
    from: () => query,
    rpc: async () => ({ data: null, error: null }),
    channel: () => ({ on: (a: any, b: any, c: any) => ({ subscribe: () => ({}) }), subscribe: () => ({}) }),
    removeChannel: () => {},
  } as any
}

// Module-level singletons — avoids "Multiple GoTrueClient instances" warning
let _anonInstance: ReturnType<typeof createClient> | null = null
const _authedInstances = new Map<string, ReturnType<typeof createClient>>()

export function createAnonClient() {
  if (!hasSupabaseConfig()) return createMissingConfigClient()

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
  if (!hasSupabaseConfig()) return createMissingConfigClient()
  if (!token) return createAnonClient()

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
