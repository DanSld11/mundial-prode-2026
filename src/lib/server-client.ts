import { createClient } from '@supabase/supabase-js'

// Cliente server-side sin cookies (para queries públicas)
export function createPublicServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
