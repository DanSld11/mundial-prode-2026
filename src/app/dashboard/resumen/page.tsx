import { getResumenData } from './actions'
import { TeamFlag } from '@/components/team-flag'
import Link from 'next/link'
import { Trophy, Target, Medal, Goal, Sparkles, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Tu Resumen del Torneo - Mundial 2026',
}

const POS_EMOJI: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default async function ResumenPage() {
  const data = await getResumenData()

  if (!data) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-lg font-bold">Iniciá sesión para ver tu resumen</p>
        <Link href="/auth/login" className="text-sm text-brand-red hover:underline">Ir a login →</Link>
      </div>
    )
  }

  const fmtPts = (n: number) => (n > 0 ? `+${n}` : `${n}`)
  const breakdownRows = [
    { label: '⚽ Partidos', value: data.breakdown.partidos },
    { label: '👥 Grupos', value: data.breakdown.grupos },
    { label: '🏆 Llaves', value: data.breakdown.llaves },
    { label: '🎰 Ruleta', value: data.breakdown.ruleta },
    { label: '🛠️ Ajustes', value: data.breakdown.ajustes },
  ].filter((r) => r.value !== 0)

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-12">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Volver al inicio
      </Link>

      {/* Hero Wrapped */}
      <div
        className="relative overflow-hidden rounded-3xl border p-8 text-center text-white shadow-xl"
        style={{ background: 'linear-gradient(160deg, #1e1b4b 0%, #4c1d95 45%, #be185d 100%)' }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white blur-3xl" />
          <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-yellow-300 blur-3xl" />
        </div>
        <div className="relative space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">Mundial 2026 · Tu resumen</p>
          <h1 className="font-bebas text-4xl tracking-wide sm:text-5xl">{data.username}</h1>
          <div className="mx-auto inline-flex flex-col items-center rounded-2xl bg-white/10 backdrop-blur px-8 py-4">
            <span className="font-bebas text-6xl leading-none tabular-nums">{data.totalPoints}</span>
            <span className="text-xs uppercase tracking-widest text-white/60 mt-1">puntos totales</span>
          </div>
          <p className="text-sm font-semibold text-white/80">
            {POS_EMOJI[data.position] ?? '🏅'} Puesto <strong className="text-white">#{data.position}</strong> de {data.totalPlayers} jugadores
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <Target className="mx-auto h-5 w-5 text-emerald-500 mb-1.5" />
          <p className="text-2xl font-extrabold tabular-nums">{data.aciertos}<span className="text-sm text-muted-foreground font-semibold">/{data.totalPreds}</span></p>
          <p className="text-[11px] text-muted-foreground">resultados acertados ({data.pctAciertos}%)</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <Medal className="mx-auto h-5 w-5 text-brand-gold mb-1.5" />
          <p className="text-2xl font-extrabold tabular-nums">{data.exactos}</p>
          <p className="text-[11px] text-muted-foreground">marcadores exactos 🎯</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <Goal className="mx-auto h-5 w-5 text-blue-500 mb-1.5" />
          <p className="text-2xl font-extrabold tabular-nums">{data.goleadores}</p>
          <p className="text-[11px] text-muted-foreground">goleadores acertados</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 text-center shadow-sm">
          <Sparkles className="mx-auto h-5 w-5 text-violet-500 mb-1.5" />
          <p className="text-2xl font-extrabold tabular-nums">{data.totalPreds}</p>
          <p className="text-[11px] text-muted-foreground">predicciones hechas</p>
        </div>
      </div>

      {/* Mejor partido */}
      {data.bestMatch && (
        <div className="rounded-2xl border bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10 p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Tu mejor partido</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold">
              <TeamFlag code={data.bestMatch.homeFlag} label={data.bestMatch.home} className="h-4 w-6" />
              <span>{data.bestMatch.home}</span>
              <span className="text-muted-foreground font-extrabold tabular-nums">{data.bestMatch.score}</span>
              <span>{data.bestMatch.away}</span>
              <TeamFlag code={data.bestMatch.awayFlag} label={data.bestMatch.away} className="h-4 w-6" />
            </div>
            <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
              +{data.bestMatch.pts} pts
            </span>
          </div>
        </div>
      )}

      {/* Equipo más apostado */}
      {data.favTeam && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm flex items-center gap-4">
          <TeamFlag code={data.favTeam.flag} label={data.favTeam.name} className="h-8 w-12 shrink-0" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tu equipo de confianza</p>
            <p className="text-sm font-bold">{data.favTeam.name}</p>
            <p className="text-xs text-muted-foreground">Lo apostaste como ganador {data.favTeam.count} {data.favTeam.count === 1 ? 'vez' : 'veces'}</p>
          </div>
        </div>
      )}

      {/* Desglose */}
      {breakdownRows.length > 0 && (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 border-b bg-muted/30">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">De dónde salieron tus puntos</p>
          </div>
          <div className="divide-y divide-border/60">
            {breakdownRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="font-medium">{label}</span>
                <span className={`font-extrabold tabular-nums ${value > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{fmtPts(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Podio general */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 text-brand-gold" /> Podio general
        </p>
        <div className="space-y-2">
          {data.podio.map((p) => (
            <div key={p.pos} className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${p.pos === 1 ? 'border-yellow-400/50 bg-yellow-50/50 dark:bg-yellow-950/20' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{POS_EMOJI[p.pos]}</span>
                <span className="text-sm font-bold">{p.username}</span>
              </div>
              <span className="text-sm font-extrabold tabular-nums">{p.pts} pts</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[11px] text-muted-foreground italic pt-2">
        📸 Toma captura y compártelo en el grupo · Mundial 2026
      </p>
    </div>
  )
}
