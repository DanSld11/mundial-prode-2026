import { Navbar } from '@/components/layout/navbar'
import { getCurrentUser } from '@/app/auth/actions'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/dashboard/grupos')
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Navbar isAdmin={true} />
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Panel de Administrador</h1>
          <p className="text-muted-foreground">Gestiona el torneo, partidos y usuarios.</p>
        </div>
        {children}
      </main>
    </div>
  )
}
