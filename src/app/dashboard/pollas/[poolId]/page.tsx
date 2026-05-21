import { getPoolDetail } from '../actions'
import { notFound } from 'next/navigation'
import { Trophy, Users, Gem, Copy, Crown, Medal, Award, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { CopyCodeButton } from './CopyCodeButton'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierta — aceptando participantes',
  active: 'En curso',
  finished: 'Finalizada — pendiente de pago',
  paid: 'Pagada ✓',
}

const MEDAL_ICON = [
  <Crown  className="h-4 w-4 text-yellow-500" />,
  <Medal  className="h-4 w-4 text-slate-400"  />,
  <Award  className="h-4 w-4 text-amber-600"  />,
]

export default async function PoolDetailPage({ params }: { params: { poolId: string } }) {
  const detail = await getPoolDetail(params.poolId)
  if (!detail) notFound()

  const { pool, members, pot, myUserId } = detail as any
  const entryFee = pool.entry_fee ?? 0

  // Prizes in coins
  const prize1 = Math.floor(pot * pool.prize_1st / 100)
  const prize2 = Math.floor(pot * pool.prize_2nd / 100)
  const prize3 = Math.floor(pot * pool.prize_3rd / 100)

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* Back */}
      <Link href="/dashboard/pollas" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition w-fit">
        <ChevronLeft className="h-4 w-4" /> Mis pollas
      </Link>

      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-brand-red to-red-700 p-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-bold text-xl leading-tight">{pool.name}</h1>
            {pool.description && <p className="text-sm opacity-80 mt-1">{pool.description}</p>}
            <p className="text-xs opacity-60 mt-2">{STATUS_LABEL[pool.status] ?? pool.status}</p>
          </div>
          <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-[10px] opacity-70 mb-0.5">CÓDIGO</p>
            <p className="font-bold text-lg tracking-[0.15em]">{pool.invite_code}</p>
            <CopyCodeButton code={pool.invite_code} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <Users className="h-4 w-4 mx-auto mb-1 opacity-70" />
            <p className="font-bold text-lg">{members.length}</p>
            <p className="text-[10px] opacity-70">jugadores</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <Gem className="h-4 w-4 mx-auto mb-1 opacity-70" />
            <p className="font-bold text-lg">{entryFee.toLocaleString()}</p>
            <p className="text-[10px] opacity-70">entrada</p>
          </div>
          <div className="rounded-xl bg-yellow-400/20 p-3 text-center">
            <Trophy className="h-4 w-4 mx-auto mb-1 text-yellow-300" />
            <p className="font-bold text-lg text-yellow-200">{pot.toLocaleString()}</p>
            <p className="text-[10px] opacity-70">pozo total</p>
          </div>
        </div>
      </div>

      {/* Distribución de premios */}
      {pot > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" /> Distribución del pozo
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { pos: '1°', pct: pool.prize_1st, coins: prize1, cls: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50', icon: '🥇' },
              { pos: '2°', pct: pool.prize_2nd, coins: prize2, cls: 'bg-slate-50  dark:bg-slate-900/30 border-slate-200 dark:border-slate-700', icon: '🥈' },
              { pos: '3°', pct: pool.prize_3rd, coins: prize3, cls: 'bg-amber-50  dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50', icon: '🥉' },
            ].map(p => (
              <div key={p.pos} className={`rounded-xl border p-3 text-center ${p.cls}`}>
                <p className="text-lg mb-1">{p.icon}</p>
                <p className="text-xs font-semibold text-muted-foreground">{p.pos} lugar</p>
                <p className="font-bold text-sm tabular-nums">{p.coins.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">coins ({p.pct}%)</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Clasificación del grupo
        </h2>
        <div className="rounded-2xl border bg-card overflow-hidden shadow-sm divide-y">
          {members.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Aún no hay participantes.</p>
          ) : (
            members.map((member: any, idx: number) => {
              const isMe    = member.user_id === myUserId
              const points  = member.profile?.total_points ?? 0
              const prizeCoins = idx === 0 ? prize1 : idx === 1 ? prize2 : idx === 2 ? prize3 : 0
              return (
                <div key={member.user_id}
                  className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${isMe ? 'bg-brand-red/5 dark:bg-brand-red/10' : 'hover:bg-muted/30'}`}>

                  {/* Posición */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {idx < 3 ? MEDAL_ICON[idx] : (
                      <span className="text-sm font-bold text-muted-foreground tabular-nums">{idx + 1}</span>
                    )}
                  </div>

                  {/* Avatar + nombre */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold">
                    {member.profile?.username?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight truncate ${isMe ? 'text-brand-red' : ''}`}>
                      {member.profile?.username ?? '—'}
                      {isMe && <span className="ml-1 text-[10px] font-normal text-muted-foreground">(vos)</span>}
                    </p>
                    {prizeCoins > 0 && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Gem className="h-2.5 w-2.5 text-yellow-500" />
                        Premio estimado: {prizeCoins.toLocaleString()} coins
                      </p>
                    )}
                  </div>

                  {/* Puntos */}
                  <div className="text-right shrink-0">
                    <p className="text-base font-extrabold tabular-nums">{points.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">pts</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Clasificación en tiempo real basada en puntos del torneo global
        </p>
      </div>
    </div>
  )
}
