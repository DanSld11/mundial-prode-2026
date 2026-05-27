'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, X, Gem } from 'lucide-react'
import { getMyAdminNotifications } from '@/app/dashboard/wallet/actions'

interface Notif {
  id: string
  amount: number
  description: string | null
  balance_after: number
  created_at: string
}

const LS_KEY = 'seen_admin_coin_notifs'

function getSeenIds(): string[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
}

function markSeen(id: string) {
  const seen = getSeenIds()
  if (!seen.includes(id)) {
    seen.push(id)
    // Guardar solo los últimos 200 para no crecer indefinidamente
    localStorage.setItem(LS_KEY, JSON.stringify(seen.slice(-200)))
  }
}

export function AdminCoinNotification() {
  const [queue,   setQueue  ] = useState<Notif[]>([])
  const [current, setCurrent] = useState<Notif | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    getMyAdminNotifications().then((txns: any[]) => {
      const seen    = getSeenIds()
      const unseen  = txns.filter(t => !seen.includes(t.id))
      if (unseen.length === 0) return
      setQueue(unseen.slice(1))
      setCurrent(unseen[0])
      // Pequeño delay para que el modal entre con animación
      setTimeout(() => setVisible(true), 100)
    })
  }, [])

  function dismiss() {
    if (!current) return
    markSeen(current.id)
    setVisible(false)
    setTimeout(() => {
      if (queue.length > 0) {
        setCurrent(queue[0])
        setQueue(q => q.slice(1))
        setTimeout(() => setVisible(true), 80)
      } else {
        setCurrent(null)
      }
    }, 300)
  }

  if (!current) return null

  const isAdd = current.amount > 0
  const absAmount = Math.abs(current.amount).toLocaleString()
  const formattedDate = new Date(current.created_at).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })

  return (
    /* Backdrop */
    <div
      className={`fixed inset-0 z-[300] flex items-center justify-center p-4 transition-all duration-300 ${
        visible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent pointer-events-none'
      }`}
      onClick={(e) => { if (e.target === e.currentTarget) dismiss() }}
    >
      {/* Modal */}
      <div className={`relative w-full max-w-sm transition-all duration-300 ${
        visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
      }`}>
        <div className={`rounded-3xl overflow-hidden shadow-2xl border-2 ${
          isAdd
            ? 'border-emerald-400 dark:border-emerald-500'
            : 'border-red-400 dark:border-red-500'
        }`}>

          {/* Header coloreado */}
          <div className={`relative px-6 pt-6 pb-8 ${
            isAdd
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            {/* Botón cerrar */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>

            {/* Icono animado */}
            <div className={`w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4 shadow-lg`}>
              {isAdd
                ? <TrendingUp  className="h-8 w-8 text-white" />
                : <TrendingDown className="h-8 w-8 text-white" />
              }
            </div>

            <p className="text-white/80 text-sm font-medium mb-1">
              {isAdd ? '¡Recibiste MundialCoins! 🎉' : 'Se descontaron MundialCoins'}
            </p>
            <p className="text-white font-extrabold text-4xl tracking-tight">
              {isAdd ? '+' : '−'}{absAmount}
              <span className="text-2xl ml-2">🪙</span>
            </p>
          </div>

          {/* Cuerpo */}
          <div className="bg-white dark:bg-zinc-900 px-6 py-5 space-y-4">

            {/* Mensaje del admin */}
            {current.description && (
              <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Mensaje
                </p>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                  {current.description}
                </p>
              </div>
            )}

            {/* Saldo resultante */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gem className="h-4 w-4" />
                <span>Saldo actual</span>
              </div>
              <span className="font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                {current.balance_after.toLocaleString()} 🪙
              </span>
            </div>

            {/* Fecha */}
            <p className="text-center text-[11px] text-muted-foreground">{formattedDate}</p>

            {/* Botón */}
            <button
              onClick={dismiss}
              className={`w-full h-12 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95 shadow-md ${
                isAdd ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'
              }`}
            >
              Entendido
            </button>

            {queue.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                {queue.length} notificación{queue.length !== 1 ? 'es' : ''} más
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
