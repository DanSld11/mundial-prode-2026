import { Navbar } from '@/components/layout/navbar'
import { FloatingAlbumButton } from '@/components/layout/FloatingAlbumButton'
import { AlbumProvider } from '@/components/album/AlbumContext'
import { AlbumModal } from '@/components/album/AlbumModal'
import { SidebarProvider } from '@/components/layout/sidebar-context'
import { SidebarShell } from '@/components/layout/sidebar-shell'
import { AdminCoinNotification } from '@/components/admin-coin-notification'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlbumProvider>
      <SidebarProvider>
        <div className="flex min-h-screen bg-muted/25">
          <Navbar />
          <SidebarShell maxWidth="max-w-5xl">
            {children}
          </SidebarShell>
          <FloatingAlbumButton />
          <AlbumModal />
          <AdminCoinNotification />
        </div>
      </SidebarProvider>
    </AlbumProvider>
  )
}
