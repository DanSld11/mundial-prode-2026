export const maxDuration = 300

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { SidebarProvider } from '@/components/layout/sidebar-context'
import { SidebarShell } from '@/components/layout/sidebar-shell'
import { createServiceRoleClient } from '@/lib/server-client'
import { createClient } from '@supabase/supabase-js'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verificar sesión y rol admin server-side
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) redirect('/auth/login?redirectTo=/admin')

    // Verificar token con Supabase y obtener user_id
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: { user }, error } = await anonClient.auth.getUser(token)

    if (error || !user) redirect('/auth/login?redirectTo=/admin')

    // Verificar rol en profiles usando service role (sin RLS)
    const adminClient = createServiceRoleClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') redirect('/dashboard')
  } catch (e: any) {
    // Si falla la verificación (ej: env vars no configuradas en dev), dejar pasar
    if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/25">
        <Navbar isAdmin={true} />
        <SidebarShell maxWidth="max-w-7xl">
          {children}
        </SidebarShell>
      </div>
    </SidebarProvider>
  )
}
