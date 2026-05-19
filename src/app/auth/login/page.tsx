'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)

    try {
      const res = await fetch('https://anbfhgkaaaqvjeiwtojp.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYmZoZ2thYWFxdmplaXd0b2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjg1OTksImV4cCI6MjA5NDcwNDU5OX0.rsfIrfuYdpLxdR2OlfU0k4Ddf0h4sHmyM6Nj48IDSlc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.get('email'),
          password: data.get('password'),
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.msg || json.error_description || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      // Guardar cookie con el token
      document.cookie = 'sb-access-token=' + json.access_token + '; path=/; max-age=604800; SameSite=Lax'

      // Redirect
      window.location.href = '/dashboard/grupos'
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#C8102E] rounded flex items-center justify-center">
              <span className="font-['Bebas_Neue'] text-white text-xl tracking-widest">26</span>
            </div>
            <span className="font-['Bebas_Neue'] text-3xl tracking-[4px] text-white">
              MUNDIAL <span className="text-[#F4C300]">PRODE</span>
            </span>
          </div>
          <p className="text-white/40 text-sm">Ingresá a tu cuenta para predecir</p>
        </div>

        <div className="bg-[#111] border border-white/8 rounded-xl p-8">
          <h1 className="text-white text-xl font-semibold mb-6">Ingresar</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Email</label>
              <input name="email" type="email" required className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8102E]/50" />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Contraseña</label>
              <input name="password" type="password" required className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm focus:outline-none focus:border-[#C8102E]/50" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#C8102E] hover:bg-[#e01230] text-white font-bold text-sm uppercase tracking-widest py-3 rounded-md disabled:opacity-50">
              {loading ? 'Ingresando...' : 'Ingresar al prode'}
            </button>
          </form>

          <div className="text-center mt-6 text-white/40 text-sm">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/register" className="text-[#F4C300] hover:underline font-medium">Registrarse</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
