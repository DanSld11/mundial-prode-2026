import { getWalletData } from './actions'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { Gem, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Trophy, RefreshCw, Settings } from 'lucide-react'
import { redirect } from 'next/navigation'

const TX_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  deposit:          { label: 'Recarga',         icon: <ArrowDownLeft className="h-3.5 w-3.5" />, color: 'text-emerald-600' },
  pool_entry:       { label: 'Entrada a polla', icon: <ArrowUpRight   className="h-3.5 w-3.5" />, color: 'text-red-500'     },
  pool_prize:       { label: 'Premio ganado',   icon: <Trophy         className="h-3.5 w-3.5" />, color: 'text-yellow-500'  },
  refund:           { label: 'Reembolso',        icon: <RefreshCw      className="h-3.5 w-3.5" />, color: 'text-blue-500'    },
  admin_adjustment: { label: 'Ajuste admin',    icon: <Settings       className="h-3.5 w-3.5" />, color: 'text-purple-500'  },
}

export const dynamic = 'force-dynamic'

export default async function WalletPage() {
  const data = await getWalletData()
  if (!data) redirect('/auth/login')

  const { wallet, transactions } = data
  const balance = wallet?.balance ?? 0

  return (
    <div className="mx-auto max-w-2xl space-y-5">

      {/* Balance principal */}
      <div className="rounded-2xl border bg-gradient-to-br from-brand-red to-red-700 p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-1 opacity-80 text-sm font-medium">
          <Gem className="h-4 w-4" /> MundialCoins
        </div>
        <div className="text-5xl font-extrabold tabular-nums tracking-tight">
          {balance.toLocaleString('es-PE')}
        </div>
        <p className="mt-1 text-sm opacity-70">saldo disponible</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Recibidas',  val: wallet?.total_deposited ?? 0, icon: <TrendingUp   className="h-4 w-4" /> },
            { label: 'Apostadas',  val: wallet?.total_wagered   ?? 0, icon: <TrendingDown className="h-4 w-4" /> },
            { label: 'Ganadas',    val: wallet?.total_won       ?? 0, icon: <Trophy       className="h-4 w-4" /> },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
              <div className="flex justify-center mb-1 opacity-70">{s.icon}</div>
              <div className="text-lg font-bold tabular-nums">{s.val.toLocaleString('es-PE')}</div>
              <div className="text-[10px] opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
        <Gem className="h-4 w-4 mt-0.5 shrink-0" />
        <p>Las MundialCoins son moneda virtual del juego. El admin recarga tu saldo para que puedas unirte a pollas.</p>
      </div>

      {/* Historial */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Historial de movimientos</h2>

        {transactions.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            No hay movimientos aún. El admin te asignará coins para comenzar.
          </div>
        ) : (
          <div className="rounded-xl border bg-card divide-y overflow-hidden shadow-sm">
            {transactions.map((tx: any) => {
              const meta = TX_LABELS[tx.type] ?? TX_LABELS.admin_adjustment
              const positive = tx.amount > 0
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted ${meta.color}`}>
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight truncate">
                      {tx.description || meta.label}
                      {tx.pool?.name && <span className="ml-1 text-muted-foreground text-xs">· {tx.pool.name}</span>}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{formatPeruShortDateTime(tx.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold tabular-nums ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {positive ? '+' : ''}{tx.amount.toLocaleString('es-PE')}
                    </p>
                    <p className="text-[10px] text-muted-foreground">saldo: {tx.balance_after.toLocaleString('es-PE')}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
