'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Gem, Users, Lock, Loader2, Trophy, Hash, Plus, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { createPoolAction, joinPoolAction } from './actions'

/* ─── JOIN MODAL ─────────────────────────────────────────── */
export function JoinPoolModal() {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    const res = await joinPoolAction(code)
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('¡Te uniste a la polla!')
    setOpen(false)
    setCode('')
    router.push(`/dashboard/pollas/${res.poolId}`)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-muted transition">
        <LogIn className="h-4 w-4" /> Unirme con código
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl border-b bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-brand-red" />
                <p className="font-semibold">Unirme a una polla</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleJoin} className="px-5 py-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Código de invitación</label>
                <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: PERU26"
                  maxLength={6}
                  className="h-12 w-full rounded-xl border bg-background px-4 text-center text-lg font-bold tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-brand-red" />
                <p className="text-[11px] text-muted-foreground text-center">El código lo comparte quien creó la polla</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted">Cancelar</button>
                <button type="submit" disabled={loading || code.length < 4}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uniendo...</> : 'Unirme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

/* ─── CREATE MODAL ───────────────────────────────────────── */
const PRESET_DISTRIBUTIONS = [
  { label: '60/30/10', p1: 60, p2: 30, p3: 10 },
  { label: '70/20/10', p1: 70, p2: 20, p3: 10 },
  { label: '50/30/20', p1: 50, p2: 30, p3: 20 },
  { label: '100/0/0',  p1: 100, p2: 0, p3: 0  },
]

export function CreatePoolModal({ balance }: { balance: number }) {
  const router = useRouter()
  const [open, setOpen]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm]     = useState({
    name: '', description: '', entry_fee: 0,
    max_participants: '', prize_1st: 60, prize_2nd: 30, prize_3rd: 10,
  })

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    if (form.prize_1st + form.prize_2nd + form.prize_3rd !== 100) {
      toast.error('Los porcentajes deben sumar 100'); return
    }
    if (form.entry_fee > balance) {
      toast.error(`Saldo insuficiente. Tenés ${balance} coins.`); return
    }
    setLoading(true)
    const res = await createPoolAction({
      name: form.name,
      description: form.description,
      entry_fee: form.entry_fee,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
      prize_1st: form.prize_1st,
      prize_2nd: form.prize_2nd,
      prize_3rd: form.prize_3rd,
    })
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    toast.success(`¡Polla creada! Código: ${res.invite_code}`)
    setOpen(false)
    router.push(`/dashboard/pollas/${res.poolId}`)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition">
        <Plus className="h-4 w-4" /> Crear polla
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="w-full max-w-md rounded-2xl border bg-card shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b bg-card px-5 py-4 z-10">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-red" />
                <p className="font-semibold">Nueva polla</p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-5 py-5 space-y-4">
              {/* Nombre */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Nombre de la polla *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required
                  placeholder="Ej: Prode de la Oficina"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
              </div>

              {/* Descripción */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Descripción (opcional)</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={2} placeholder="Una descripción para tus participantes..."
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red" />
              </div>

              {/* Entrada */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Gem className="h-3.5 w-3.5 text-brand-red" /> Entrada (coins por participante)
                </label>
                <input type="number" min={0} value={form.entry_fee} onChange={e => set('entry_fee', parseInt(e.target.value) || 0)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
                <p className="text-[11px] text-muted-foreground">Tu saldo: <span className="font-bold">{balance} coins</span></p>
              </div>

              {/* Máx participantes */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Máx. participantes (vacío = ilimitado)
                </label>
                <input type="number" min={2} value={form.max_participants} onChange={e => set('max_participants', e.target.value)}
                  placeholder="Sin límite"
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
              </div>

              {/* Distribución de premios */}
              <div className="space-y-2">
                <label className="text-xs font-medium flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" /> Distribución del premio (%)
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_DISTRIBUTIONS.map(p => (
                    <button key={p.label} type="button"
                      onClick={() => { set('prize_1st', p.p1); set('prize_2nd', p.p2); set('prize_3rd', p.p3) }}
                      className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
                        form.prize_1st === p.p1 && form.prize_2nd === p.p2
                          ? 'border-brand-red bg-red-50 text-brand-red dark:bg-red-950/30'
                          : 'hover:bg-muted'
                      }`}>{p.label}</button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '🥇 1°', key: 'prize_1st' },
                    { label: '🥈 2°', key: 'prize_2nd' },
                    { label: '🥉 3°', key: 'prize_3rd' },
                  ].map(({ label, key }) => (
                    <div key={key} className="space-y-0.5">
                      <label className="text-[10px] text-muted-foreground">{label}</label>
                      <div className="relative">
                        <input type="number" min={0} max={100}
                          value={(form as any)[key]}
                          onChange={e => set(key, parseInt(e.target.value) || 0)}
                          className="h-9 w-full rounded-lg border bg-background pl-3 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {form.prize_1st + form.prize_2nd + form.prize_3rd !== 100 && (
                  <p className="text-[11px] text-red-500">
                    Suma: {form.prize_1st + form.prize_2nd + form.prize_3rd}% (debe ser 100%)
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted">Cancelar</button>
                <button type="submit" disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</> : <><Trophy className="h-4 w-4" /> Crear polla</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
