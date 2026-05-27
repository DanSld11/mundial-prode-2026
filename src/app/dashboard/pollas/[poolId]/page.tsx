import { getPoolDetail } from '../actions'
import { notFound } from 'next/navigation'
import { Trophy, Users, Gem, ChevronLeft, Clock, Lock } from 'lucide-react'
import Link from 'next/link'
import { CopyCodeButton } from './CopyCodeButton'
import { PoolTabs } from './PoolTabs'

export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  open:     { label: 'Abierta — aceptando participantes', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  active:   { label: 'En curso',                         cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  finished: { label: 'Finalizada — pendiente de pago',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  paid:     { label: 'Pagada ✓',                         cls: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
}

export default async function PoolDetailPage({ params }: { params: { poolId: string } }) {
  const detail = await getPoolDetail(params.poolId)
  if (!detail) notFound()

  const { pool, members, pot, myUserId } = detail as any
  const entryFee = pool.entry_fee ?? 0

  const prize1 = Math.floor(pot * pool.prize_1st / 100)
  const prize2 = Math.floor(pot * pool.prize_2nd / 100)
  const prize3 = Math.floor(pot * pool.prize_3rd / 100)

  const statusCfg = STATUS_CONFIG[pool.status] ?? STATUS_CONFIG.open

  /* ── Polla pagada: acceso bloqueado ── */
  if (pool.status === 'paid') {
    const myMember = members.find((m: any) => m.user_id === myUserId) as any
    return (
      <div className="mx-auto max-w-2xl space-y-5 pb-24">
        <Link href="/dashboard/pollas"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" /> Mis pollas
        </Link>

        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-bold text-2xl text-white mb-1">{pool.name}</h1>
            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white">
              Pagada ✓ — Polla cerrada
            </span>
          </div>

          {/* Resultados finales */}
          <div className="p-6 space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Esta polla ha finalizado y los premios fueron distribuidos.
            </p>

            {/* Mi posición final */}
            {myMember?.final_position && (
              <div className="rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 px-5 py-4 text-center">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Tu posición final</p>
                <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">
                  {myMember.final_position === 1 ? '🥇' : myMember.final_position === 2 ? '🥈' : myMember.final_position === 3 ? '🥉' : `#${myMember.final_position}`}
                </p>
                {myMember.prize_earned > 0 && (
                  <p className="mt-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                    +{myMember.prize_earned.toLocaleString()} coins ganados 🪙
                  </p>
                )}
              </div>
            )}

            {/* Distribución final */}
            {pot > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { pos: '1°', pct: pool.prize_1st, coins: prize1, icon: '🥇', cls: 'border-yellow-200 dark:border-yellow-800/50 bg-yellow-50 dark:bg-yellow-950/20' },
                  { pos: '2°', pct: pool.prize_2nd, coins: prize2, icon: '🥈', cls: 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/20' },
                  { pos: '3°', pct: pool.prize_3rd, coins: prize3, icon: '🥉', cls: 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20' },
                ].map(p => (
                  <div key={p.pos} className={`rounded-xl border p-3 text-center ${p.cls}`}>
                    <p className="text-lg mb-0.5">{p.icon}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{p.pos}</p>
                    <p className="font-bold text-xs tabular-nums">{p.coins.toLocaleString()} 🪙</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-24">

      {/* Back */}
      <Link
        href="/dashboard/pollas"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Mis pollas
      </Link>

      {/* ── Header card ── */}
      <div className="rounded-2xl border bg-gradient-to-br from-brand-red to-red-700 p-5 shadow-lg text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-bold text-xl leading-tight">{pool.name}</h1>
            {pool.description && (
              <p className="text-sm text-white/80 mt-1 leading-relaxed">{pool.description}</p>
            )}
            <span className="mt-2 inline-block rounded-full border border-white/30 bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold text-white">
              {statusCfg.label}
            </span>
          </div>

          {/* Invite code box */}
          <div className="shrink-0 rounded-xl bg-white/15 border border-white/25 px-3 py-2 text-center">
            <p className="text-[10px] text-white/80 font-medium mb-0.5 uppercase tracking-wider">Código</p>
            <p className="font-bold text-lg tracking-[0.15em]">{pool.invite_code}</p>
            <CopyCodeButton code={pool.invite_code} />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 border border-white/15 p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-white/70" />
            <p className="font-bold text-lg">{members.length}</p>
            <p className="text-[10px] text-white/80">jugadores</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-3 text-center">
            <Gem className="h-4 w-4 mx-auto mb-1 text-white/70" />
            <p className="font-bold text-lg">{entryFee.toLocaleString()}</p>
            <p className="text-[10px] text-white/80">entrada</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-300" />
            <p className="font-bold text-lg text-yellow-200">{pot.toLocaleString()}</p>
            <p className="text-[10px] text-white/80">pozo total</p>
          </div>
        </div>
      </div>

      {/* ── Distribución de premios ── */}
      {pot > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" /> Distribución del pozo
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { pos: '1° lugar', pct: pool.prize_1st, coins: prize1, icon: '🥇',
                cls: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50',
                coinCls: 'text-yellow-700 dark:text-yellow-400' },
              { pos: '2° lugar', pct: pool.prize_2nd, coins: prize2, icon: '🥈',
                cls: 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700',
                coinCls: 'text-slate-700 dark:text-slate-300' },
              { pos: '3° lugar', pct: pool.prize_3rd, coins: prize3, icon: '🥉',
                cls: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50',
                coinCls: 'text-amber-700 dark:text-amber-400' },
            ].map(p => (
              <div key={p.pos} className={`rounded-xl border p-3 text-center ${p.cls}`}>
                <p className="text-xl mb-1">{p.icon}</p>
                <p className="text-[11px] font-semibold text-muted-foreground">{p.pos}</p>
                <p className={`font-extrabold text-sm tabular-nums mt-0.5 ${p.coinCls}`}>
                  {p.coins.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground">coins · {p.pct}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs: Clasificación + Chat ── */}
      <PoolTabs
        poolId={pool.id}
        members={members}
        myUserId={myUserId}
        prize1={prize1}
        prize2={prize2}
        prize3={prize3}
      />

      {/* Info box */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 flex items-start gap-2">
        <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          El ranking se actualiza automáticamente a medida que se cargan los resultados del torneo.
          El pago se realiza al finalizar el Mundial.
        </p>
      </div>
    </div>
  )
}
