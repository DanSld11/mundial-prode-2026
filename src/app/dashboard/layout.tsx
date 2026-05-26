import { Navbar } from '@/components/layout/navbar'
import { FloatingAlbumButton } from '@/components/layout/FloatingAlbumButton'
import { AlbumProvider } from '@/components/album/AlbumContext'
import { AlbumModal } from '@/components/album/AlbumModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlbumProvider>
      <div className="flex min-h-screen bg-muted/25">
        <Navbar />
        {/* Offset for fixed sidebar on desktop, full width on mobile */}
        <div className="flex flex-1 flex-col lg:pl-64">
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-4 sm:px-6 sm:pt-6 lg:pb-10 lg:pt-8">
            {children}
          </main>
        </div>
        <FloatingAlbumButton />
        <AlbumModal />
      </div>
    </AlbumProvider>
  )
}
