'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trophy, ArrowLeft, Mail, CheckCircle2, Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email,   setEmail  ] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent   ] = useState(false)
  const [error,   setError  ] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`,
        {
          method: 'POST',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            redirect_to: `${window.location.origin}/auth/reset-password`,
          }),
        }
      )
      // Supabase devuelve 200 incluso si el email no existe (seguridad)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.msg || data.error_description || 'Error al enviar el correo.')
      } else {
        setSent(true)
      }
    } catch {
      setError('Error de conexión. Verificá tu internet e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 dark:bg-background px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-40 border-b bg-card dark:bg-card" />

      <div className="relative w-full max-w-sm rounded-2xl border bg-card shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-red to-red-700 px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
            <Trophy className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-bold text-xl text-white">Recuperar contraseña</h1>
          <p className="text-white/70 text-sm mt-1">Mundial Perú 2026</p>
        </div>

        <div className="px-6 py-6">
          {sent ? (
            /* Estado: email enviado */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-lg">¡Correo enviado!</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Revisá tu bandeja de entrada en <strong>{email}</strong>. Si la cuenta existe, recibirás un link para restablecer tu contraseña.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                ¿No llegó? Revisá la carpeta de spam.
              </p>
              <Link href="/auth/login"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-brand-red text-white text-sm font-semibold hover:opacity-90 transition">
                <ArrowLeft className="h-4 w-4" /> Volver al login
              </Link>
            </div>
          ) : (
            /* Formulario */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
              </p>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="w-full h-11 rounded-xl border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-brand-red text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar link de recuperación'}
                </button>
              </form>

              <div className="text-center">
                <Link href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Volver al login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
