'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const errorMsg = searchParams.get('error')

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

        <div className="bg-[#111] border border-white/8 rounded-xl p-8">
          <h1 className="text-white text-xl font-semibold mb-6">Crear cuenta</h1>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-5 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form action="/api/auth/register" method="POST" className="space-y-4">
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
                className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50 transition-colors"
              />
              <p className="text-white/25 text-xs mt-1">Solo letras, números y guión bajo. 3–20 caracteres.</p>
            </div>

            <div>
              <label className="block text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">
                Email *
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
                Contraseña *
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50 transition-colors"
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
                className="w-full bg-[#1A1A1A] border border-white/8 rounded-md px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#C8102E]/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F4C300] hover:bg-[#e6b800] text-[#0A0A0A] font-bold text-sm uppercase tracking-widest py-3 rounded-md transition-all hover:-translate-y-px mt-2"
            >
              Crear cuenta
            </button>
          </form>

          <div className="text-center mt-6 text-white/40 text-sm">
            ¿Ya tenés cuenta?{' '}
            <Link href="/auth/login" className="text-[#F4C300] hover:underline font-medium">
              Ingresar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
