'use client'

import { useEffect, useState, useTransition } from 'react'
import { getAdminRuletaData, updateRuletaConfigAction, toggleRuletaAccessAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Sparkles, Users, Settings, BarChart3, Loader2 } from 'lucide-react'

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

export default function AdminRuletaPage() {
  const [config, setConfig] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [access, setAccess] = useState<any[]>([])
  const [recentSpins, setRecentSpins] = useState<any[]>([])
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
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function updateSlotValue(id: number, value: number) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, value } : s))
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
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Premios / casillas (10 slots)
            </p>
            <div className="space-y-2">
              {slots.map(slot => (
                <div key={slot.id} className="flex items-center gap-3">
                  <SlotColorDot color={slot.color} />
                  <span className="w-24 text-xs text-muted-foreground">{slot.type}</span>
                  {slot.type === 'points' ? (
                    <Input
                      type="number"
                      value={slot.value}
                      onChange={e => updateSlotValue(slot.id, parseInt(e.target.value) || 0)}
                      className="w-24 h-8 text-sm"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground italic">{slotLabel(slot)}</span>
                  )}
                  <span className="text-xs font-medium">{slotLabel({ ...slot })}</span>
                </div>
              ))}
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
            return (
              <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-red/10 text-brand-red text-xs font-bold">
                    {p.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-sm font-medium">{p.username}</span>
                </div>
                <button
                  onClick={() => handleToggleAccess(p.id, enabled)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
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
