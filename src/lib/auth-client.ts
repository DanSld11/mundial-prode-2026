import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return 'supabase-browser-session'
}

// Module-level singletons — avoids "Multiple GoTrueClient instances" warning
let _browserInstance: ReturnType<typeof createBrowserClient> | null = null

function hasSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function createMissingConfigClient() {
  const result = Promise.resolve({ data: null, error: new Error('Supabase env vars are not configured') })
  const query = {
    select: () => query,
    eq: () => query,
    in: () => query,
    order: () => query,
    limit: () => query,
    single: () => result,
    maybeSingle: () => result,
    insert: () => result,
    upsert: () => result,
    update: () => result,
    delete: () => result,
    then: result.then.bind(result),
    catch: result.catch.bind(result),
    finally: result.finally.bind(result),
  }

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: new Error('Supabase env vars are not configured') }),
      updateUser: async () => ({ data: { user: null }, error: new Error('Supabase env vars are not configured') }),
    },
    from: () => query,
    rpc: async () => ({ data: null, error: new Error('Supabase env vars are not configured') }),
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    removeChannel: () => {},
  } as any
}

export function createAnonClient() {
  if (!hasSupabaseConfig()) {
    return createMissingConfigClient()
  }

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
