import { Navbar } from '@/components/layout/navbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/25">
      <Navbar isAdmin={true} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-5 sm:px-6 sm:py-7 lg:px-8">{children}</main>
    </div>
  )
}
