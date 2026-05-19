'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    setLoading(false)
    if (error) {
      setError(error.message.includes('Invalid login') ? 'Email o contraseña incorrectos.' : error.message)
    } else {
      router.push('/dashboard/grupos')
      router.refresh()
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
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8102E] hover:bg-[#e01230] text-white font-bold text-sm uppercase tracking-widest py-3 rounded-md transition-all hover:-translate-y-px disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar al prode'}
            </button>
          </form>

          <div className="text-center mt-6 text-white/40 text-sm">
            ¿No tenés cuenta?{' '}
            <Link href="/auth/register" className="text-[#F4C300] hover:underline font-medium">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
