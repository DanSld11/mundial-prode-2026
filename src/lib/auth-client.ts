import { createClient } from '@supabase/supabase-js'

export function getAccessToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.split('; ').find((row) => row.startsWith('sb-access-token='))?.split('=')[1] ?? null
}

export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export function createAuthedClient(token: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  )
}

export async function getCurrentUserId(token: string): Promise<string | null> {
  const client = createAuthedClient(token)
  const { data } = await client.auth.getUser(token)
  return data.user?.id ?? null
}
