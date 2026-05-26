'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CalendarDays, Medal, Menu, Shield, Target, Trophy, Users, X } from 'lucide-react'

const THEMES = [
  {
    bg: 'linear-gradient(135deg, #001F5B 0%, #002868 45%, #9B0726 100%)',
    flag: 'us',
    country: 'Estados Unidos',
    cities: 'Nueva York · Los Ángeles · Dallas · Miami',
  },
  {
    bg: 'linear-gradient(135deg, #1a0000 0%, #a30000 50%, #6b0000 100%)',
    flag: 'ca',
    country: 'Canadá',
    cities: 'Toronto · Vancouver · Montreal',
  },
  {
    bg: 'linear-gradient(135deg, #003820 0%, #006847 50%, #9B1523 100%)',
    flag: 'mx',
    country: 'México',
    cities: 'Ciudad de México · Guadalajara · Monterrey',
  },
]

const FLAGS = [
  'br','ar','fr','es','de','pt','nl','be','it','hr',
  'jp','kr','mx','us','ca','sn','ma','pe','co','uy',
  'au','sa','dk','pl','ch','gb','pa','ec','ng','cm',
  'gh','ir','se','rs','py','bo','ve','cr','hn','tn',
  'za','ci','dz','ua','sk','qa','at','ro',
]

const FEATURES = [
  { icon: CalendarDays, title: 'Fixture completo', desc: '72 partidos de la fase de grupos con horarios en hora Perú.' },
  { icon: Target, title: 'Predice cada partido', desc: 'Elige resultado, goleador y marcador exacto para sumar más puntos.' },
  { icon: Trophy, title: 'Bracket eliminatorio', desc: 'Predice quién avanza ronda a ronda hasta el campeón.' },
  { icon: Medal, title: 'Tabla de posiciones', desc: 'Compite con todos y trepá el ranking en tiempo real.' },
  { icon: Users, title: '48 selecciones', desc: '12 grupos con las mejores selecciones del mundo.' },
  { icon: Shield, title: 'Sistema de puntos', desc: 'Resultado (1pt) · Goleador (2pts) · Marcador exacto (3pts).' },
]

const BALLS = [
  { top: '8%',  left: '4%',   size: '2rem',  dur: '4.2s', delay: '0s'   },
  { top: '20%', right: '6%',  size: '1.4rem', dur: '5.1s', delay: '1.2s' },
  { top: '58%', left: '2%',   size: '1.9rem', dur: '3.6s', delay: '2.1s' },
  { top: '72%', right: '4%',  size: '2.6rem', dur: '6s',   delay: '0.6s' },
  { top: '42%', left: '10%',  size: '1.2rem', dur: '4.7s', delay: '1.8s' },
  { top: '14%', right: '14%', size: '1.6rem', dur: '5.5s', delay: '3s'   },
  { top: '83%', left: '18%',  size: '1.5rem', dur: '4s',   delay: '2.5s' },
  { top: '48%', right: '18%', size: '2.1rem', dur: '3.9s', delay: '0.9s' },
]

function WorldCupLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="58" r="26" fill="#C8102E" />
      <ellipse cx="50" cy="58" rx="26" ry="9" fill="none" stroke="white" strokeWidth="1.5" opacity="0.35" />
      <line x1="24" y1="58" x2="76" y2="58" stroke="white" strokeWidth="1.5" opacity="0.35" />
      <ellipse cx="50" cy="58" rx="13" ry="26" fill="none" stroke="white" strokeWidth="1.5" opacity="0.35" />
      <path d="M37 32 Q37 21 50 19 Q63 21 63 32 L59 43 Q50 47 41 43 Z" fill="#FFD700" />
      <path d="M41 43 L43 51 L57 51 L59 43" fill="#C8A400" />
      <rect x="43" y="51" width="14" height="3" rx="1.5" fill="#C8A400" />
      <rect x="39" y="54" width="22" height="3" rx="1.5" fill="#C8A400" />
      <path d="M37 34 Q28 34 28 41 Q28 47 37 47" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
      <path d="M63 34 Q72 34 72 41 Q72 47 63 47" fill="none" stroke="#FFD700" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="30" r="3" fill="#FFD700" opacity="0.7" />
    </svg>
  )
}

function getCountdown() {
  const WC = new Date('2026-06-11T22:00:00Z')
  const diff = WC.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:  Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins:  Math.floor((diff % 3_600_000) / 60_000),
  }
}

export default function LandingPage() {
  const [themeIdx, setThemeIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [countdown, setCountdown] = useState<{ days: number; hours: number; mins: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setCountdown(getCountdown())
    const t = setInterval(() => setCountdown(getCountdown()), 60_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const cycle = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setThemeIdx(p => (p + 1) % THEMES.length); setVisible(true) }, 600)
    }, 5000)
    return () => clearInterval(cycle)
  }, [])

  const theme = THEMES[themeIdx]
  const doubled = [...FLAGS, ...FLAGS]

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <WorldCupLogo size={32} />
            <div className="leading-none">
              <p className="font-bold text-sm tracking-tight">Mundial Perú</p>
              <p className="font-black text-brand-red text-[10px] sm:text-xs tracking-[0.2em]">2026</p>
            </div>
          </div>
          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-2">
            <Link href="/auth/login" className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted">Ingresar</Link>
            <Link href="/auth/register" className="inline-flex h-9 items-center rounded-lg bg-brand-red px-4 text-sm font-medium text-white transition-colors hover:bg-red-700">Registrarse</Link>
          </div>
          {/* Mobile hamburger */}
          <button
            className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="sm:hidden border-t bg-card px-4 py-3 flex flex-col gap-2">
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors hover:bg-muted">Ingresar</Link>
            <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex h-10 items-center justify-center rounded-lg bg-brand-red text-sm font-medium text-white transition-colors hover:bg-red-700">Registrarse</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ background: theme.bg, minHeight: '92vh', transition: 'background 1.2s ease' }}
      >
        {/* Hexagonal pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hex" x="0" y="0" width="60" height="104" patternUnits="userSpaceOnUse">
                <polygon points="30,2 58,17 58,52 30,67 2,52 2,17" fill="none" stroke="white" strokeWidth="1.2" />
                <polygon points="30,54 58,69 58,104 30,119 2,104 2,69" fill="none" stroke="white" strokeWidth="1.2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
        </div>

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 80% 50%, transparent 30%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Floating balls */}
        {BALLS.map((b, i) => (
          <span
            key={i}
            className="pointer-events-none absolute select-none text-white/20 animate-float-ball"
            style={{ top: b.top, left: 'left' in b ? (b as any).left : undefined, right: 'right' in b ? (b as any).right : undefined, fontSize: b.size, '--dur': b.dur, '--delay': b.delay } as React.CSSProperties}
          >⚽</span>
        ))}

        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:py-24 sm:px-6">
          {/* Host badge */}
          <div
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm max-w-full overflow-hidden"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-10px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}
          >
            <img src={`https://flagcdn.com/w40/${theme.flag}.png`} alt={theme.country} className="h-5 w-7 shrink-0 rounded-sm object-cover shadow-sm" />
            <span className="font-semibold shrink-0">{theme.country}</span>
            <span className="hidden sm:block h-3.5 w-px bg-white/30 shrink-0" />
            <span className="hidden sm:block text-white/65 text-xs truncate">{theme.cities}</span>
          </div>

          {/* Title */}
          <h1 className="font-bebas text-white leading-[0.92]">
            <span className="block text-7xl sm:text-8xl lg:text-[7rem]">Mundial Perú 2026</span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl text-white/65 mt-2">el que estabas esperando</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
            Predice resultados, goleadores y marcadores exactos. Compite con amigos y seguí el torneo en tiempo real.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-bold text-brand-red shadow-xl shadow-black/20 transition-all hover:scale-105">
              Crear cuenta gratis <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20">
              Ya tengo cuenta
            </Link>
          </div>

          {/* Countdown pill */}
          {countdown && (
            <div className="mt-8 inline-flex flex-wrap items-center gap-3 sm:gap-4 rounded-2xl border border-white/20 bg-black/30 px-4 sm:px-5 py-3 sm:py-3.5 backdrop-blur-md">
              {[
                { val: countdown.days,  label: 'días'  },
                { val: countdown.hours, label: 'horas'  },
                { val: countdown.mins,  label: 'min'    },
              ].map((u, i) => (
                <div key={u.label} className="flex items-center gap-3 sm:gap-4">
                  {i > 0 && <span className="text-white/30 font-bold text-lg sm:text-xl">:</span>}
                  <div className="text-center min-w-[2rem] sm:min-w-[2.5rem]">
                    <span className="block font-bebas text-3xl sm:text-4xl text-white tabular-nums leading-none">{String(u.val).padStart(2,'0')}</span>
                    <span className="text-[10px] text-white/50 uppercase tracking-wider">{u.label}</span>
                  </div>
                </div>
              ))}
              <div className="hidden sm:block ml-2 h-10 w-px bg-white/20" />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-white">Hasta el pitazo inicial</p>
                <p className="text-[11px] text-white/50">11 Jun 2026 · Estadio Azteca</p>
              </div>
            </div>
          )}

          {/* Theme dots */}
          <div className="mt-8 flex gap-2">
            {THEMES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setThemeIdx(i); setVisible(true) }}
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: i === themeIdx ? '24px' : '8px', background: i === themeIdx ? 'white' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Flag marquee */}
      <div className="overflow-hidden border-y bg-muted/40 py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {doubled.map((flag, i) => (
            <img key={i} src={`https://flagcdn.com/w40/${flag}.png`} alt="" className="mx-2 h-6 w-9 rounded-sm object-cover shadow-sm" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12))' }} />
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 px-4 sm:px-6">
          {[
            { value: '48', label: 'Selecciones' },
            { value: '12', label: 'Grupos' },
            { value: '104', label: 'Partidos' },
            { value: '6', label: 'Pts/partido' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-4 sm:py-5 text-center">
              <span className="font-bebas text-3xl sm:text-4xl text-brand-red">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">⚽ ¿Qué incluye?</span>
          <h2 className="font-bebas text-4xl tracking-wide sm:text-5xl">El prode más completo del Mundial</h2>
          <p className="mt-2 text-muted-foreground">Todo lo que necesitás para seguir el Mundial con tus amigos.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-brand-red/30">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red transition-all group-hover:bg-brand-red group-hover:text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Host countries */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="mb-2 font-bebas text-3xl tracking-wide text-center sm:text-4xl">Sedes del Mundial 2026</h2>
          <p className="mb-8 text-center text-sm text-muted-foreground">3 países · 16 ciudades · historia por escribir</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { flag: 'us', country: 'Estados Unidos', cities: 'Nueva York · Los Ángeles · Dallas\nMiami · Seattle · San Francisco\nBoston · Kansas City · Philadelphia', bg: 'linear-gradient(135deg,#001F5B,#002868,#BF0A30)' },
              { flag: 'ca', country: 'Canadá', cities: 'Toronto · Vancouver\nMontreal', bg: 'linear-gradient(135deg,#8B0000,#CC0000,#660000)' },
              { flag: 'mx', country: 'México', cities: 'Ciudad de México\nGuadalajara · Monterrey', bg: 'linear-gradient(135deg,#004D2C,#006847,#CE1126)' },
            ].map((h) => (
              <div key={h.country} className="relative overflow-hidden rounded-2xl p-6 text-white" style={{ background: h.bg }}>
                <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
                  <svg width="100%" height="100%">
                    <defs><pattern id={`hx-${h.country}`} x="0" y="0" width="40" height="70" patternUnits="userSpaceOnUse"><polygon points="20,2 38,12 38,32 20,42 2,32 2,12" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
                    <rect width="100%" height="100%" fill={`url(#hx-${h.country})`}/>
                  </svg>
                </div>
                <img src={`https://flagcdn.com/w80/${h.flag}.png`} alt={h.country} className="mb-1 h-10 w-14 rounded object-cover shadow-md" />
                <h3 className="mt-3 font-bold text-xl">{h.country}</h3>
                <p className="mt-1 text-sm text-white/65 whitespace-pre-line">{h.cities}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#8B0019 0%,#C8102E 50%,#8B0019 100%)' }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <svg width="100%" height="100%">
            <defs><pattern id="hex-cta" x="0" y="0" width="60" height="104" patternUnits="userSpaceOnUse"><polygon points="30,2 58,17 58,52 30,67 2,52 2,17" fill="none" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#hex-cta)"/>
          </svg>
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
          <div className="mb-4 flex justify-center"><WorldCupLogo size={64} /></div>
          <h2 className="font-bebas text-5xl tracking-wide text-white sm:text-6xl">¿Listo para predecir?</h2>
          <p className="mt-2 text-white/75 text-lg">Registrate gratis y empezá a cargar tus predicciones.</p>
          <Link href="/auth/register" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-red shadow-xl transition-all hover:scale-105">
            Crear cuenta gratis <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Mundial Perú 2026 · Hecho con ❤️ para los amantes del fútbol
      </footer>
    </div>
  )
}
