'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch('https://anbfhgkaaaqvjeiwtojp.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYmZoZ2thYWFxdmplaXd0b2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjg1OTksImV4cCI6MjA5NDcwNDU5OX0.rsfIrfuYdpLxdR2OlfU0k4Ddf0h4sHmyM6Nj48IDSlc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.msg || data.error_description || 'Email o contraseña incorrectos'); setLoading(false); return }

      document.cookie = 'sb-access-token=' + data.access_token + '; path=/; max-age=604800; SameSite=Lax'
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-40 border-b bg-card" />
      <Card className="relative w-full max-w-sm border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <CardTitle className="text-2xl tracking-tight">Prode 2026</CardTitle>
          <CardDescription>Ingresá para cargar tus predicciones</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required className="h-10" />
            <Input name="password" type="password" placeholder="Contraseña" required className="h-10" />
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
    </div>
  )
}
