'use client'

import { useEffect, useState, useTransition } from 'react'
import { getAdminPuntosData, adjustUserPointsAction, deleteAdjustmentAction, clearAllAdjustmentsAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Coins, Loader2, Plus, Minus, Clock, Trash2 } from 'lucide-react'
import { formatPeruLongDateTime } from '@/lib/peru-time'

export default function AdminPuntosPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [adjustments, setAdjustments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [pending, startTransition] = useTransition()

  async function load() {
    const d = await getAdminPuntosData()
    setProfiles(d.profiles)
    setAdjustments(d.adjustments)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(amount)
    if (!selectedUserId || isNaN(num) || num === 0 || !reason.trim()) {
      toast.error('Completá todos los campos')
      return
    }
    startTransition(async () => {
      const res = await adjustUserPointsAction(selectedUserId, num, reason)
      if (res.error) { toast.error(res.error); return }
      toast.success(`✅ ${res.username}: ${res.change > 0 ? '+' : ''}${res.change} pts → total ${res.newTotal} pts`)
      setAmount('')
      setReason('')
      await load()
    })
  }

  const selectedProfile = profiles.find(p => p.id === selectedUserId)

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ajuste Manual de Puntos</h2>
          <p className="text-sm text-muted-foreground">Suma o resta puntos con un motivo. El usuario verá un banner explicando el ajuste.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 space-y-4 shadow-sm">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Nuevo ajuste</h3>

        {/* User select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usuario</label>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Seleccionar usuario —</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.username} ({p.total_points ?? 0} pts)
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Puntos (positivo para sumar, negativo para restar)
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="shrink-0 border-emerald-500 text-emerald-600"
              onClick={() => setAmount(v => v.startsWith('-') ? v.slice(1) : (v && !v.startsWith('+') ? '+' + v : v))}>
              <Plus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              placeholder="Ej: 5 o -3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" className="shrink-0 border-red-400 text-red-500"
              onClick={() => setAmount(v => v.startsWith('-') ? v : '-' + v.replace('+', ''))}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          {selectedProfile && amount && !isNaN(parseInt(amount)) && (
            <p className="text-xs text-muted-foreground">
              {selectedProfile.username}: {selectedProfile.total_points ?? 0} pts
              → <strong>{Math.max(0, (selectedProfile.total_points ?? 0) + parseInt(amount))} pts</strong>
              {parseInt(amount) < 0 && (selectedProfile.total_points ?? 0) + parseInt(amount) < 0 && (
                <span className="text-amber-600"> (piso en 0)</span>
              )}
            </p>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Motivo (visible para el usuario)
          </label>
          <Input
            placeholder="Ej: ¡Feliz cumpleaños! Bono especial 🎂"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={200}
          />
          <p className="text-[10px] text-muted-foreground text-right">{reason.length}/200</p>
        </div>

        <Button
          type="submit"
          disabled={pending || !selectedUserId || !amount || !reason.trim()}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
          {pending ? 'Aplicando...' : 'Aplicar ajuste'}
        </Button>
      </form>

      {/* History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Últimos ajustes
          </h3>
          {adjustments.length > 0 && (
            <button
              onClick={() => {
                if (!confirm('¿Borrar TODOS los ajustes manuales?')) return
                startTransition(async () => {
                  const res = await clearAllAdjustmentsAction()
                  if (res.error) toast.error(res.error)
                  else { toast.success('Todos los ajustes eliminados'); await load() }
                })
              }}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Borrar todos
            </button>
          )}
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Cargando...</div>
        ) : adjustments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No hay ajustes aún.
          </div>
        ) : (
          <div className="space-y-2">
            {adjustments.map((a: any) => (
              <div key={a.id} className="rounded-xl border bg-card px-4 py-3 flex items-start gap-3">
                <span className={`mt-0.5 text-lg font-bold tabular-nums ${a.points_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {a.points_change > 0 ? '+' : ''}{a.points_change}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{(a.profiles as any)?.username ?? '—'}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.message}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{formatPeruLongDateTime(a.created_at)}</span>
                <button
                  onClick={() => startTransition(async () => {
                    const res = await deleteAdjustmentAction(a.id)
                    if (res.error) toast.error(res.error)
                    else { toast.success('Ajuste eliminado'); await load() }
                  })}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  title="Eliminar ajuste"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
