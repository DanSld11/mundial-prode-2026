import { getMyPools } from './actions'
import { getWalletData } from '../wallet/actions'
import { CreatePoolModal, JoinPoolModal } from './PollaModals'
import { Trophy, Users, Gem, Lock, ChevronRight, PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  open:     { label: 'Abierta',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  active:   { label: 'En curso',    cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  finished: { label: 'Finalizada',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  paid:     { label: 'Pagada ✓',    cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
}

export default async function PollasPage() {
  const [pools, walletData] = await Promise.all([getMyPools(), getWalletData()])
  if (walletData === null) redirect('/auth/login')

  const balance = walletData.wallet?.balance ?? 0

  return (
    <div className="mx-auto max-w-3xl space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Mis Pollas</h1>
            <p className="text-sm text-muted-foreground">Grupos de apuesta del Mundial 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Saldo rápido */}
          <Link href="/dashboard/wallet"
            className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-sm font-semibold shadow-sm hover:bg-muted transition">
            <Gem className="h-4 w-4 text-brand-red" />
            <span className="tabular-nums">{balance.toLocaleString('es-PE')}</span>
            <span className="text-muted-foreground font-normal">coins</span>
          </Link>
          <JoinPoolModal />
          <CreatePoolModal balance={balance} />
        </div>
      </div>

      {/* Lista de pollas */}
      {pools.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-sm">
          <PartyPopper className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">Todavía no estás en ninguna polla</p>
          <p className="mt-1 text-sm text-muted-foreground">Creá una nueva o unite con el código de un amigo.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pools.map((pool: any) => {
            const pot        = (pool.entry_fee ?? 0) * (pool.member_count ?? 0)
            const statusMeta = STATUS_BADGE[pool.status] ?? STATUS_BADGE.open
            return (
              <Link key={pool.id} href={`/dashboard/pollas/${pool.id}`}
                className="group rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-brand-red/40 transition-all">

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="font-bold text-base leading-tight truncate group-hover:text-brand-red transition-colors">{pool.name}</p>
                    {pool.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{pool.description}</p>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.cls}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-muted/40 px-2 py-2 text-center">
                    <Users className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold">{pool.member_count ?? 0}</p>
                    <p className="text-[10px] text-muted-foreground">jugadores</p>
                  </div>
                  <div className="rounded-lg bg-muted/40 px-2 py-2 text-center">
                    <Gem className="h-3.5 w-3.5 mx-auto mb-1 text-brand-red" />
                    <p className="text-sm font-bold">{(pool.entry_fee ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">entrada</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2 py-2 text-center">
                    <Trophy className="h-3.5 w-3.5 mx-auto mb-1 text-yellow-500" />
                    <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{pot.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">pozo</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {pool.invite_code}
                  </div>
                  <div className="flex items-center gap-1 font-medium group-hover:text-brand-red transition-colors">
                    Ver detalle <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
