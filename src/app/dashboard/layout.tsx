import { Navbar } from '@/components/layout/navbar'
import { FloatingAlbumButton } from '@/components/layout/FloatingAlbumButton'
import { AlbumProvider } from '@/components/album/AlbumContext'
import { AlbumModal } from '@/components/album/AlbumModal'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AlbumProvider>
      <div className="flex min-h-screen flex-col bg-muted/25">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-5 sm:px-6 sm:py-7 lg:px-8">
          {children}
        </main>
        <FloatingAlbumButton />
        <AlbumModal />
      </div>
    </AlbumProvider>
  )
}
