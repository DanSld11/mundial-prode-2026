'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function RegisterForm() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')
  const [error, setError] = useState<string | null>(errorMsg)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const username = formData.get('username') as string
    const favoriteTeam = formData.get('favorite_team') as string

    try {
      const res = await fetch('https://anbfhgkaaaqvjeiwtojp.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYmZoZ2thYWFxdmplaXd0b2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjg1OTksImV4cCI6MjA5NDcwNDU5OX0.rsfIrfuYdpLxdR2OlfU0k4Ddf0h4sHmyM6Nj48IDSlc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          data: { username, favorite_team: favoriteTeam || null },
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.msg || data.error || 'Error al registrarse')
        setLoading(false)
        return
      }

      if (data.access_token) {
        document.cookie = `sb-access-token=${data.access_token}; path=/; max-age=${604800}; SameSite=Lax`
        window.location.replace('/dashboard/grupos')
      } else {
        setError('Registro exitoso. Revisá tu email para confirmar.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#111] border border-white/8 rounded-xl p-8">
      <h1 className="text-white text-xl font-semibold mb-6">Crear cuenta</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Nombre de usuario *
          </label>
          <input
            name="username"
            type="text"
            required
            minLength={3}
            maxLength={20}
            placeholder="el_crack_del_prode"
            className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Contraseña *
          </label>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50"
          />
        </div>
        <div>
          <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
            Equipo favorito 🌟
          </label>
          <input
            name="favorite_team"
            type="text"
            placeholder="Argentina, Brasil, España..."
            className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#F4C300] hover:bg-[#e6b800] text-[#0A0A0A] font-bold text-sm uppercase tracking-widest py-3 rounded-md mt-2 disabled:opacity-50"
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <div className="text-center mt-6 text-white/40 text-sm">
        ¿Ya tenés cuenta?{' '}
        <Link href="/auth/login" className="text-[#F4C300] hover:underline font-medium">
          Ingresar
        </Link>
      </div>
    </div>
  )
}

export default function RegisterPage() {
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
          <p className="text-white/40 text-sm">Creá tu cuenta y competí con tus amigos</p>
        </div>
        <Suspense fallback={<div className="text-white">Cargando...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
