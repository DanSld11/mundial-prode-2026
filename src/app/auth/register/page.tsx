'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const fd = new FormData(e.currentTarget)
    const email = (fd.get('email') as string).trim().toLowerCase()

    // Solo se permiten cuentas @gmail.com
    if (!email.endsWith('@gmail.com')) {
      setError('Solo se permiten cuentas de Gmail (@gmail.com).')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: fd.get('email'),
          password: fd.get('password'),
          data: { username: fd.get('username'), favorite_team: fd.get('favorite_team') || null },
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.msg || 'Error al registrarse'); setLoading(false); return }

      if (data.access_token) {
        document.cookie = 'sb-access-token=' + data.access_token + '; path=/; max-age=14400; SameSite=Lax'
        window.location.href = '/dashboard'
      } else {
        setError('Registro exitoso. Revisá tu email para confirmar.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 dark:bg-background px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-40 border-b bg-card dark:bg-card" />
      <Card className="relative w-full max-w-sm border shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <CardTitle className="text-2xl tracking-tight">Crear cuenta</CardTitle>
          <CardDescription>Competí con tus amigos en el Mundial</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input name="username" type="text" placeholder="Nombre de usuario" required minLength={3} maxLength={20} className="h-10" />
            <div className="space-y-1">
              <div className="relative">
                <Input name="email" type="email" placeholder="tu@gmail.com" required className="h-10 pr-24" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.910 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
                  Solo Gmail
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground px-1">Solo se aceptan cuentas @gmail.com</p>
            </div>
            <Input name="password" type="password" placeholder="Contraseña (mín 8)" required minLength={8} className="h-10" />
            <Input name="favorite_team" type="text" placeholder="Equipo favorito (opcional)" className="h-10" />
            <Button type="submit" disabled={loading} className="w-full h-10 bg-brand-red hover:bg-red-700 text-white">
              {loading ? 'Creando...' : 'Crear cuenta'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-brand-red hover:underline font-medium">
              Ingresar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
