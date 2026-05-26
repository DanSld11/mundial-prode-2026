import { Navbar } from '@/components/layout/navbar'
import { SidebarProvider } from '@/components/layout/sidebar-context'
import { SidebarShell } from '@/components/layout/sidebar-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
