import { Navbar } from '@/components/layout/navbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
