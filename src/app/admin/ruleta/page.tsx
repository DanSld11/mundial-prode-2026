'use client'

import { useEffect, useState, useTransition } from 'react'
import { getAdminRuletaData, updateRuletaConfigAction, toggleRuletaAccessAction, resetUserWeeklySpinAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Sparkles, Users, Settings, BarChart3, Loader2, RotateCcw, Clock } from 'lucide-react'

interface Slot {
  id: number
  type: 'points' | 'retry' | 'nothing'
  value: number
  color: string
}

function slotLabel(s: Slot) {
  if (s.type === 'points') return s.value > 0 ? `+${s.value} pts` : `${s.value} pts`
  if (s.type === 'retry') return '🔄 Otra vez'
  return '🍍 Piña'
}

function SlotColorDot({ color }: { color: string }) {
  return <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/20 shrink-0" style={{ background: color }} />
}

function SpinCountdown({ resetsAt }: { resetsAt: string }) {
  const [text, setText] = useState('')
  useEffect(() => {
    function tick() {
      const diff = new Date(resetsAt).getTime() - Date.now()
      if (diff <= 0) { setText('disponible pronto'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      setText(d > 0 ? `${d}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [resetsAt])
  return (
    <p className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium">
      <Clock className="h-2.5 w-2.5" /> {text}
    </p>
  )
}

export default function AdminRuletaPage() {
  const [config, setConfig] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [access, setAccess] = useState<any[]>([])
  const [recentSpins, setRecentSpins] = useState<any[]>([])
  const [freeSpinMap, setFreeSpinMap] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [slots, setSlots] = useState<Slot[]>([])
  const [priceCoins, setPriceCoins] = useState(50)
  const [isActive, setIsActive] = useState(false)
  const [pending, startTransition] = useTransition()
  const [tab, setTab] = useState<'config' | 'access' | 'history'>('config')

  async function load() {
    const d = await getAdminRuletaData()
    setConfig(d.config)
    setSlots(d.config.slots ?? [])
    setPriceCoins(d.config.price_coins ?? 50)
    setIsActive(d.config.is_active ?? false)
    setProfiles(d.profiles)
    setAccess(d.access)
    setRecentSpins(d.recentSpins)
    setFreeSpinMap(d.freeSpinMap)
    setLoading(false)
  }

  function handleResetSpin(userId: string) {
    startTransition(async () => {
      await resetUserWeeklySpinAction(userId)
      setFreeSpinMap(prev => { const next = { ...prev }; delete next[userId]; return next })
      toast.success('Timer reseteado — el usuario puede girar gratis de nuevo')
    })
  }

  useEffect(() => { load() }, [])

  function updateSlotValue(id: number, value: number) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, value } : s))
  }

  function updateSlotWeight(id: number, weight: number) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, weight: Math.max(1, weight) } : s))
  }

  function slotProbability(slot: Slot): string {
    const total = slots.reduce((sum, s) => sum + (s.weight ?? 1), 0)
    return ((( slot.weight ?? 1) / total) * 100).toFixed(0) + '%'
  }

  function handleSaveConfig() {
    startTransition(async () => {
      await updateRuletaConfigAction({ is_active: isActive, price_coins: priceCoins, slots })
      toast.success('Configuración guardada')
      await load()
    })
  }

  function handleToggleActive() {
    const newVal = !isActive
    setIsActive(newVal)
    startTransition(async () => {
      await updateRuletaConfigAction({ is_active: newVal })
      toast.success(newVal ? '🟢 Ruleta activada' : '🔴 Ruleta desactivada')
    })
  }

  function handleToggleAccess(userId: string, currentEnabled: boolean) {
    const newVal = !currentEnabled
    setAccess(prev => {
      const exists = prev.find(a => a.user_id === userId)
      if (exists) return prev.map(a => a.user_id === userId ? { ...a, enabled: newVal } : a)
      return [...prev, { user_id: userId, enabled: newVal }]
    })
    startTransition(async () => {
      await toggleRuletaAccessAction(userId, newVal)
    })
  }

  function getUserAccess(userId: string) {
    return access.find(a => a.user_id === userId)?.enabled ?? false
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  const tabs = [
    { id: 'config', label: 'Configuración', icon: Settings },
    { id: 'access', label: 'Acceso', icon: Users },
    { id: 'history', label: 'Historial', icon: BarChart3 },
  ] as const

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Ruleta Admin</h2>
            <p className="text-sm text-muted-foreground">Configurá la ruleta de MundialCoins</p>
          </div>
        </div>
        {/* Quick toggle */}
        <button
          onClick={handleToggleActive}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                     : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
          {isActive ? 'Activa' : 'Inactiva'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
              tab === t.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Config tab */}
      {tab === 'config' && (
        <div className="space-y-4">
          {/* Price */}
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Precio por giro (MundialCoins)
            </label>
            <Input
              type="number"
              min={0}
              value={priceCoins}
              onChange={e => setPriceCoins(parseInt(e.target.value) || 0)}
              className="w-40"
            />
          </div>

          {/* Slots */}
          <div className="rounded-xl border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Premios / probabilidades (10 slots)
              </p>
              <p className="text-[10px] text-muted-foreground">Peso = probabilidad relativa</p>
            </div>
            <div className="space-y-2">
              {slots.map(slot => (
                <div key={slot.id} className="flex items-center gap-2">
                  <SlotColorDot color={slot.color} />
                  <span className="w-20 text-xs font-medium truncate">{slotLabel(slot)}</span>
                  {slot.type === 'points' && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">pts:</span>
                      <Input
                        type="number"
                        value={slot.value}
                        onChange={e => updateSlotValue(slot.id, parseInt(e.target.value) || 0)}
                        className="w-16 h-7 text-xs"
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[10px] text-muted-foreground">peso:</span>
                    <Input
                      type="number"
                      min={1}
                      value={slot.weight ?? 1}
                      onChange={e => updateSlotWeight(slot.id, parseInt(e.target.value) || 1)}
                      className="w-14 h-7 text-xs"
                    />
                    <span className="text-[10px] font-semibold w-8 text-right text-muted-foreground">
                      {slotProbability(slot)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-[10px] text-muted-foreground">
              💡 Peso mayor = sale más seguido. Ej: Piña peso 4 vs +3 pts peso 1 → Piña sale 4× más.
            </div>
          </div>

          <Button
            onClick={handleSaveConfig}
            disabled={pending}
            className="w-full bg-brand-red hover:bg-red-600 text-white"
          >
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
            Guardar configuración
          </Button>
        </div>
      )}

      {/* Access tab */}
      {tab === 'access' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground pb-1">
            Habilitá o deshabilitá el acceso por usuario. El admin siempre puede usar la ruleta.
          </p>
          {profiles.map(p => {
            const enabled = getUserAccess(p.id)
            const resetsAt = freeSpinMap[p.id]
            const usedFreeSpin = !!resetsAt
            return (
              <div key={p.id} className="rounded-xl border bg-card px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red text-xs font-bold">
                      {p.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.username}</p>
                      {usedFreeSpin ? (
                        <SpinCountdown resetsAt={resetsAt} />
                      ) : (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Giro gratis disponible</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {usedFreeSpin && (
                      <button
                        onClick={() => handleResetSpin(p.id)}
                        disabled={pending}
                        title="Resetear timer para que pueda girar gratis"
                        className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400 transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" /> Resetear
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleAccess(p.id, enabled)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                    >
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="space-y-2">
          {recentSpins.length === 0 ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Sin giros aún.
            </div>
          ) : recentSpins.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5">
              <span className="text-lg">
                {s.result_type === 'retry' ? '🔄' : s.result_type === 'nothing' ? '🍍' : s.points_change > 0 ? '✅' : '❌'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{(s.profiles as any)?.username ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{s.result_label} · {s.coins_spent} coins</p>
              </div>
              {s.points_change !== 0 && (
                <span className={`font-bold text-sm ${s.points_change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {s.points_change > 0 ? '+' : ''}{s.points_change}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
