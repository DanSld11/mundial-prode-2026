import { Navbar } from '@/components/layout/navbar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar isAdmin={true} />
      <main className="flex-1 container py-6 max-w-7xl">{children}</main>
    </div>
  )
}
