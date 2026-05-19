import { Navbar } from '@/components/layout/navbar'
import { AuthGuard } from '@/components/auth-guard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="relative flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-6">{children}</main>
      </div>
    </AuthGuard>
  )
}
