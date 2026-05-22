'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  X, Gem, Users, Loader2, Trophy,
  Hash, Plus, LogIn, HelpCircle, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import { createPoolAction, joinPoolAction } from './actions'

/* ─── Helpers ──────────────────────────────────────────────── */
/** Evita decimales y negativos en un input numérico */
function blockInvalidKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e' || e.key === '+') {
    e.preventDefault()
  }
}
function toPositiveInt(val: string, fallback = 0): number {
  const n = parseInt(val, 10)
  return isNaN(n) || n < 0 ? fallback : Math.floor(n)
}

/* ─── HOW IT WORKS ──────────────────────────────────────────── */
export function HowItWorksCard() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-brand-red shrink-0" />
          <span className="font-semibold text-sm text-foreground">¿Cómo funciona una polla?</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t px-5 py-4 space-y-4 text-sm text-foreground">

          {/* Sección 1 */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">🏆 ¿Quién gana?</p>
            <p className="text-muted-foreground leading-relaxed">
              Gana el participante que acumule <strong className="text-foreground">más puntos totales</strong> al finalizar
              el Mundial 2026. Los puntos se suman de <em>todas</em> las predicciones:
            </p>
            <ul className="ml-4 space-y-1 text-muted-foreground list-disc">
              <li>Resultados de partidos (ganador, empate, marcador exacto)</li>
              <li>Goleador de cada partido</li>
              <li>Posiciones finales por grupo</li>
              <li>Bracket eliminatorio</li>
              <li>Premios especiales (Bota de Oro, Campeón, etc.)</li>
            </ul>
          </div>

          {/* Sección 2 */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">💰 ¿Cómo funciona el pozo?</p>
            <p className="text-muted-foreground leading-relaxed">
              Al unirte, se descuenta la <strong className="text-foreground">entrada en MundialCoins</strong> de tu wallet.
              Esas coins forman el pozo compartido del grupo.
            </p>
            <div className="rounded-xl bg-muted/50 border px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-foreground">Ejemplo con distribución 60/30/10:</p>
              <div className="grid grid-cols-3 gap-2 text-center mt-2">
                {[
                  { pos: '🥇 1°', pct: '60%', color: 'text-yellow-600' },
                  { pos: '🥈 2°', pct: '30%', color: 'text-slate-500' },
                  { pos: '🥉 3°', pct: '10%', color: 'text-amber-700' },
                ].map(({ pos, pct, color }) => (
                  <div key={pos} className="rounded-lg bg-background border py-2 px-1">
                    <p className="text-base">{pos}</p>
                    <p className={`font-bold text-sm ${color}`}>{pct}</p>
                    <p className="text-[10px] text-muted-foreground">del pozo</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección 3 */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">📅 ¿Cuándo se paga?</p>
            <p className="text-muted-foreground leading-relaxed">
              Al terminar el torneo, el administrador cierra la polla y ejecuta el pago.
              Las coins se acreditan automáticamente a los ganadores en su wallet.
            </p>
          </div>

          {/* Sección 4 */}
          <div className="space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5">🔑 ¿Cómo invito amigos?</p>
            <p className="text-muted-foreground leading-relaxed">
              Al crear la polla se genera un <strong className="text-foreground">código de 6 letras</strong> único.
              Compartilo con quien quieras que se una. Pueden unirse desde la opción
              <em> &quot;Unirme con código&quot;</em>.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3">
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>⚠️ Importante:</strong> Las MundialCoins son moneda virtual del juego, sin valor monetario real.
              Una vez que se unan y paguen la entrada, no se puede salir de la polla ni pedir reembolso.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── JOIN MODAL ─────────────────────────────────────────── */
export function JoinPoolModal() {
  const router = useRouter()
  const [open, setOpen]       = useState(false)
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (code.trim().length < 4) { toast.error('El código debe tener al menos 4 caracteres'); return }
    setLoading(true)
    const res = await joinPoolAction(code)
    setLoading(false)
    if (res.error) { toast.error(res.error); return }
    toast.success('¡Te uniste a la polla!')
    setOpen(false)
    setCode('')
    router.push(`/dashboard/pollas/${res.poolId}`)
  }

  function handleClose() { setOpen(false); setCode('') }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-muted transition-colors"
      >
        <LogIn className="h-4 w-4" /> Unirme con código
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-2xl border-b border-border bg-muted/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Hash className="h-5 w-5 text-brand-red" />
                <p className="font-semibold text-foreground">Unirme a una polla</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleJoin} className="px-5 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Código de invitación</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="Ej: PERU26"
                  maxLength={6}
                  className="h-12 w-full rounded-xl border border-input bg-background px-4 text-center text-lg font-bold tracking-[0.3em] uppercase text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <p className="text-[11px] text-muted-foreground text-center">
                  El código lo comparte quien creó la polla
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length < 4}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Uniendo...</>
                    : 'Unirme'}
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
  { label: '60 / 30 / 10', p1: 60, p2: 30, p3: 10 },
  { label: '70 / 20 / 10', p1: 70, p2: 20, p3: 10 },
  { label: '50 / 30 / 20', p1: 50, p2: 30, p3: 20 },
  { label: '100 / 0 / 0',  p1: 100, p2: 0,  p3: 0  },
]

export function CreatePoolModal({ balance }: { balance: number }) {
  const router   = useRouter()
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '',
    entry_fee: 0, max_participants: '',
    prize_1st: 60, prize_2nd: 30, prize_3rd: 10,
  })

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  const prizeSum = form.prize_1st + form.prize_2nd + form.prize_3rd
  const prizeOk  = prizeSum === 100

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    // Validaciones
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    if (form.name.trim().length < 3) { toast.error('El nombre debe tener al menos 3 caracteres'); return }
    if (form.entry_fee < 0) { toast.error('La entrada no puede ser negativa'); return }
    if (form.entry_fee > balance) {
      toast.error(`Saldo insuficiente. Tenés ${balance.toLocaleString()} coins`); return
    }
    const maxP = form.max_participants ? parseInt(form.max_participants, 10) : null
    if (maxP !== null && maxP < 2) { toast.error('El mínimo de participantes es 2'); return }
    if (!prizeOk) { toast.error(`Los porcentajes suman ${prizeSum}%, deben sumar 100%`); return }

    setLoading(true)
    const res = await createPoolAction({
      name:             form.name.trim(),
      description:      form.description.trim(),
      entry_fee:        form.entry_fee,
      max_participants: maxP,
      prize_1st:        form.prize_1st,
      prize_2nd:        form.prize_2nd,
      prize_3rd:        form.prize_3rd,
    })
    setLoading(false)

    if (res.error) { toast.error(res.error); return }
    toast.success(`¡Polla creada! Código: ${res.invite_code}`)
    setOpen(false)
    router.push(`/dashboard/pollas/${res.poolId}`)
  }

  function handleClose() {
    if (!loading) setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" /> Crear polla
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between rounded-t-2xl border-b border-border bg-muted/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-brand-red" />
                <p className="font-bold text-foreground">Nueva polla</p>
              </div>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <form onSubmit={handleCreate} className="overflow-y-auto px-5 py-5 space-y-4">

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nombre de la polla <span className="text-brand-red">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  required
                  maxLength={50}
                  placeholder="Ej: Prode de la Oficina"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <p className="text-[11px] text-muted-foreground text-right">{form.name.length}/50</p>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Descripción <span className="font-normal">(opcional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={2}
                  maxLength={200}
                  placeholder="Una descripción para tus participantes..."
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>

              {/* Entrada */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Gem className="h-3.5 w-3.5 text-brand-red" />
                  Entrada por participante
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={form.entry_fee === 0 ? '' : form.entry_fee}
                    placeholder="0"
                    onKeyDown={blockInvalidKeys}
                    onChange={e => set('entry_fee', toPositiveInt(e.target.value))}
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 pr-16 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                    coins
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">0 = polla gratuita</span>
                  <span className="text-muted-foreground">
                    Tu saldo:{' '}
                    <span className={`font-bold ${form.entry_fee > balance ? 'text-red-500' : 'text-foreground'}`}>
                      {balance.toLocaleString()} coins
                    </span>
                  </span>
                </div>
                {form.entry_fee > balance && (
                  <p className="text-[11px] text-red-500 font-medium">⚠️ Saldo insuficiente para unirte como creador</p>
                )}
              </div>

              {/* Máx participantes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Máximo de participantes
                </label>
                <input
                  type="number"
                  min={2}
                  step={1}
                  value={form.max_participants}
                  onKeyDown={blockInvalidKeys}
                  onChange={e => {
                    const v = e.target.value
                    // Allow empty (unlimited) or positive integers >= 2
                    if (v === '') { set('max_participants', ''); return }
                    const n = toPositiveInt(v, 2)
                    set('max_participants', n < 2 ? '2' : String(n))
                  }}
                  placeholder="Sin límite"
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
                <p className="text-[11px] text-muted-foreground">Dejá vacío para permitir participantes ilimitados</p>
              </div>

              {/* Distribución de premios */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Distribución del premio (%)
                </label>

                {/* Presets */}
                <div className="flex gap-2 flex-wrap">
                  {PRESET_DISTRIBUTIONS.map(p => {
                    const isActive = form.prize_1st === p.p1 && form.prize_2nd === p.p2 && form.prize_3rd === p.p3
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => { set('prize_1st', p.p1); set('prize_2nd', p.p2); set('prize_3rd', p.p3) }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'border-brand-red bg-brand-red text-white'
                            : 'border-input bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>

                {/* Custom inputs */}
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { label: '🥇 1° lugar', key: 'prize_1st' },
                    { label: '🥈 2° lugar', key: 'prize_2nd' },
                    { label: '🥉 3° lugar', key: 'prize_3rd' },
                  ] as const).map(({ label, key }) => (
                    <div key={key} className="space-y-1">
                      <label className="text-[10px] font-semibold text-muted-foreground">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={(form as any)[key]}
                          onKeyDown={blockInvalidKeys}
                          onChange={e => {
                            const n = toPositiveInt(e.target.value)
                            set(key as any, Math.min(100, n))
                          }}
                          className="h-9 w-full rounded-lg border border-input bg-background pl-2 pr-6 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-red"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prize sum indicator */}
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium border ${
                  prizeOk
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'
                }`}>
                  <span>Total: <strong>{prizeSum}%</strong></span>
                  <span>{prizeOk ? '✓ Correcto' : `Faltan ${100 - prizeSum}%`}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 pb-1">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !prizeOk || form.entry_fee > balance}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-red px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</>
                    : <><Trophy className="h-4 w-4" /> Crear polla</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
