'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      })
      let data: any = {}
      try { data = await res.json() } catch { /* ignore parse error */ }
      if (!res.ok) { setError(data.msg || data.error_description || 'Email o contraseña incorrectos'); setLoading(false); return }

      document.cookie = 'sb-access-token=' + data.access_token + '; path=/; max-age=3600; SameSite=Lax'
      if (data.refresh_token) {
        document.cookie = 'sb-refresh-token=' + data.refresh_token + '; path=/; max-age=15552000; SameSite=Lax'
      }
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      window.location.href = redirectTo
    } catch {
      setError('Error de conexión. Verificá tu internet e intentá de nuevo.')
      setLoading(false)
    }
  }

  return (
    <Card className="relative w-full max-w-sm border shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
        <CardTitle className="text-2xl tracking-tight">Mundial Perú 2026</CardTitle>
        <CardDescription>Ingresa para cargar tus predicciones</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required className="h-10" />
          <div className="space-y-1">
            <Input name="password" type="password" placeholder="Contraseña" required className="h-10" />
            <div className="text-right">
              <Link href="/auth/forgot-password" className="text-xs text-muted-foreground hover:text-brand-red transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-10 bg-brand-red hover:bg-red-700 text-white">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          ¿No tenés cuenta?{' '}
          <Link href="/auth/register" className="text-brand-red hover:underline font-medium">
            Registrarse
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 dark:bg-background px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-40 border-b bg-card dark:bg-card" />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
