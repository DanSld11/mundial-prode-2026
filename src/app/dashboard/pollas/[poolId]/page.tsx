import { getPoolDetail } from '../actions'
import { notFound } from 'next/navigation'
import { Trophy, Users, Gem, Crown, Medal, Award, ChevronLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { CopyCodeButton } from './CopyCodeButton'

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
      <div className="rounded-2xl border bg-gradient-to-br from-brand-red to-red-700 p-5 shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-bold text-xl leading-tight text-white">{pool.name}</h1>
            {pool.description && (
              <p className="text-sm text-white/75 mt-1 leading-relaxed">{pool.description}</p>
            )}
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusCfg.cls}`}>
              {statusCfg.label}
            </span>
          </div>

          {/* Invite code box */}
          <div className="shrink-0 rounded-xl bg-white/15 border border-white/20 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-[10px] text-white/60 font-medium mb-0.5 uppercase tracking-wider">Código</p>
            <p className="font-bold text-lg tracking-[0.15em] text-white">{pool.invite_code}</p>
            <CopyCodeButton code={pool.invite_code} />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 text-white/60" />
            <p className="font-bold text-lg text-white">{members.length}</p>
            <p className="text-[10px] text-white/60">jugadores</p>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/10 p-3 text-center">
            <Gem className="h-4 w-4 mx-auto mb-1 text-white/60" />
            <p className="font-bold text-lg text-white">{entryFee.toLocaleString()}</p>
            <p className="text-[10px] text-white/60">entrada</p>
          </div>
          <div className="rounded-xl bg-yellow-400/20 border border-yellow-400/20 p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-300" />
            <p className="font-bold text-lg text-yellow-200">{pot.toLocaleString()}</p>
            <p className="text-[10px] text-yellow-300/70">pozo total</p>
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

      {/* ── Leaderboard ── */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Clasificación del grupo
        </h2>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
          {members.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Aún no hay participantes.</p>
          ) : (
            members.map((member: any, idx: number) => {
              const isMe       = member.user_id === myUserId
              const points     = member.profile?.total_points ?? 0
              const prizeCoins = idx === 0 ? prize1 : idx === 1 ? prize2 : idx === 2 ? prize3 : 0
              const initial    = member.profile?.username?.charAt(0).toUpperCase() ?? '?'

              return (
                <div
                  key={member.user_id}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors
                    ${isMe ? 'bg-brand-red/5 dark:bg-brand-red/10' : 'hover:bg-muted/40'}`}
                >
                  {/* Posición / medalla */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {idx === 0 && <Crown  className="h-5 w-5 text-yellow-500" />}
                    {idx === 1 && <Medal  className="h-5 w-5 text-slate-400"  />}
                    {idx === 2 && <Award  className="h-5 w-5 text-amber-600"  />}
                    {idx >= 3  && (
                      <span className="text-sm font-bold text-muted-foreground tabular-nums">{idx + 1}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold">
                    {initial}
                  </div>

                  {/* Nombre + premio estimado */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight truncate ${isMe ? 'text-brand-red' : 'text-foreground'}`}>
                      {member.profile?.username ?? '—'}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(vos)</span>
                      )}
                    </p>
                    {prizeCoins > 0 && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Gem className="h-2.5 w-2.5 text-yellow-500" />
                        Premio estimado: <span className="font-semibold text-foreground">{prizeCoins.toLocaleString()} coins</span>
                      </p>
                    )}
                  </div>

                  {/* Puntos */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-extrabold tabular-nums text-foreground">
                      {points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Clasificación en tiempo real basada en los puntos globales del torneo
        </p>
      </div>

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
