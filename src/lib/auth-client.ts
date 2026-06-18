import { createClient } from '@supabase/supabase-js'

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null

  const cookies: Record<string, string> = {}
  document.cookie.split('; ').forEach((c) => {
    const idx = c.indexOf('=')
    if (idx > 0) cookies[c.slice(0, idx)] = c.slice(idx + 1)
  })

  // Legacy format (older Supabase JS client)
  if (cookies['sb-access-token']) return cookies['sb-access-token']

  // @supabase/ssr format: sb-<projectRef>-auth-token (may be chunked as .0, .1, ...)
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').match(/\/\/(.+?)\.supabase/)?.[1]
  if (projectRef) {
    const key = `sb-${projectRef}-auth-token`
    const raw = cookies[key] ?? cookies[`${key}.0`]
    if (raw) {
      try {
        const session = JSON.parse(decodeURIComponent(raw))
        if (session?.access_token) return session.access_token as string
      } catch {}
    }
  }

  return null
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
      { auth: { autoRefreshToken: false, persistSession: false, storageKey: 'supabase-anon-auth' } },
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
          auth: { autoRefreshToken: false, persistSession: false, storageKey: `sb-auth-${token.substring(0, 8)}` },
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
