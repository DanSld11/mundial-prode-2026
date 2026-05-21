import Link from 'next/link'
import { ArrowRight, CalendarDays, Medal, Shield, Target, Trophy, Users } from 'lucide-react'

const features = [
  { icon: CalendarDays, title: 'Fixture completo', desc: '72 partidos de la fase de grupos con horarios en hora Perú.' },
  { icon: Target, title: 'Predice cada partido', desc: 'Elige resultado, goleador y marcador exacto para sumar más puntos.' },
  { icon: Trophy, title: 'Bracket eliminatorio', desc: 'Predice quién avanza ronda a ronda hasta el campeón.' },
  { icon: Medal, title: 'Tabla de posiciones', desc: 'Compite con todos y trepá el ranking en tiempo real.' },
  { icon: Users, title: '48 selecciones', desc: '12 grupos con las mejores selecciones del mundo.' },
  { icon: Shield, title: 'Sistema de puntos', desc: 'Resultado (1pt) · Goleador (2pts) · Marcador exacto (3pts).' },
]

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red text-white">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight">Mundial Perú <span className="text-brand-red">2026</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted">
              Ingresar
            </Link>
            <Link href="/auth/register" className="inline-flex h-9 items-center rounded-lg bg-brand-red px-4 text-sm font-medium text-white transition-colors hover:bg-red-700">
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-card">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(200,16,46,0.12),_transparent_60%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
              ⚽ Copa Mundial FIFA 2026
            </span>
            <h1 className="font-bebas text-5xl tracking-wide sm:text-6xl lg:text-7xl">
              El prode del Mundial que estabas esperando
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Predice resultados, goleadores y marcadores exactos. Compite con amigos y seguí el torneo en tiempo real desde un solo lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-red px-6 text-base font-semibold text-white transition-colors hover:bg-red-700">
                Crear cuenta gratis <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/auth/login" className="inline-flex h-12 items-center justify-center rounded-xl border bg-background px-6 text-base font-medium transition-colors hover:bg-muted">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-6xl divide-x px-4 sm:px-6">
          {[
            { value: '48', label: 'Selecciones' },
            { value: '12', label: 'Grupos' },
            { value: '104', label: 'Partidos totales' },
            { value: '6', label: 'Puntos por partido' },
          ].map((s) => (
            <div key={s.label} className="flex flex-1 flex-col items-center py-4 text-center">
              <span className="font-bebas text-3xl text-brand-red">{s.value}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="mb-3 font-bebas text-3xl tracking-wide sm:text-4xl">¿Qué incluye el prode?</h2>
        <p className="mb-10 text-muted-foreground">Todo lo que necesitás para seguir el Mundial con tus amigos.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t bg-brand-red">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <h2 className="font-bebas text-4xl tracking-wide text-white sm:text-5xl">¿Listo para predecir?</h2>
          <p className="mt-2 text-white/80">Registrate gratis y empezá a cargar tus predicciones antes de que cierren.</p>
          <Link href="/auth/register" className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-bold text-brand-red transition hover:bg-white/90">
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
