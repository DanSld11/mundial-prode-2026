import { Navbar } from '@/components/layout/navbar'
import { getCurrentUser } from '@/app/auth/actions'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar isAdmin={user.role === 'admin'} />
      <main className="flex-1 container py-6">{children}</main>
    </div>
  )
}
