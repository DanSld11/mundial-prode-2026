'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, Lock, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react'

function ResetPasswordForm() {
  const params  = useSearchParams()
  const router  = useRouter()

  const [password,  setPassword ] = useState('')
  const [confirm,   setConfirm  ] = useState('')
  const [showPw,    setShowPw   ] = useState(false)
  const [loading,   setLoading  ] = useState(false)
  const [done,      setDone     ] = useState(false)
  const [error,     setError    ] = useState('')

  // Supabase envía el access_token en el hash (#) de la URL
  // pero también puede venir en query params según la config
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Leer token del hash (formato Supabase)
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.replace('#', ''))
    const accessToken = hashParams.get('access_token') || params.get('access_token')
    setToken(accessToken)
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (!token) { setError('Token inválido. Pedí un nuevo link de recuperación.'); return }

    setLoading(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          method: 'PUT',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.msg || data.error_description || 'Error al cambiar la contraseña.')
      } else {
        setDone(true)
        setTimeout(() => router.push('/auth/login'), 3000)
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
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
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-bold text-xl text-white">Nueva contraseña</h1>
          <p className="text-white/70 text-sm mt-1">Mundial Perú 2026</p>
        </div>

        <div className="px-6 py-6">
          {done ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-bold text-lg">¡Contraseña actualizada!</p>
                <p className="text-sm text-muted-foreground mt-1">Serás redirigido al login en unos segundos...</p>
              </div>
              <Link href="/auth/login"
                className="flex items-center justify-center w-full h-10 rounded-xl bg-brand-red text-white text-sm font-semibold hover:opacity-90 transition">
                Ir al login
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Elegí una nueva contraseña para tu cuenta.
              </p>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Nueva contraseña */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nueva contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Confirmar contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repetí la contraseña"
                      required
                      className="w-full h-11 rounded-xl border bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>

                {/* Indicador de fortaleza */}
                {password.length > 0 && (
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                          : 'bg-muted'
                      }`} />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full h-11 rounded-xl bg-brand-red text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : 'Guardar nueva contraseña'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}
