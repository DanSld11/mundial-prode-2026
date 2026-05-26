import { Navbar } from '@/components/layout/navbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/25">
      <Navbar isAdmin={true} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-8 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-10 lg:pt-8">{children}</main>
      </div>
    </div>
  )
}
