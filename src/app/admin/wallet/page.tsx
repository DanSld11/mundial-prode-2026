'use client'

import { useEffect, useState } from 'react'
import { Gem, Users, Trophy, Loader2, CheckCircle2, Plus, Minus, UserX, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { adminGetAllWallets, adminGiveCoinsAction, adminGetAllPools, adminPayoutPoolAction, adminUpdatePoolStatus, adminGetPoolMembers, adminKickFromPoolAction } from './actions'

const STATUS_OPTS = ['open','active','finished','paid'] as const
const STATUS_LABEL: Record<string, string> = {
  open: 'Abierta', active: 'En curso', finished: 'Finalizada', paid: 'Pagada ✓'
}

export default function AdminWalletPage() {
  const [wallets,       setWallets      ] = useState<any[]>([])
  const [pools,         setPools        ] = useState<any[]>([])
  const [loading,       setLoading      ] = useState(true)
  // Panel de miembros expandido por polla
  const [expandedPool,  setExpandedPool ] = useState<string | null>(null)
  const [poolMembers,   setPoolMembers  ] = useState<Record<string, any[]>>({})
  const [loadingMembers,setLoadingMembers] = useState<string | null>(null)
  const [kickingUser,   setKickingUser  ] = useState<string | null>(null)

  // Give/remove coins form
  const [target,    setTarget   ] = useState<string>('all')
  const [amount,    setAmount   ] = useState('')
  const [desc,      setDesc     ] = useState('')
  const [operation, setOperation] = useState<'add' | 'remove'>('add')
  const [sending,   setSending  ] = useState(false)

  useEffect(() => {
    Promise.all([adminGetAllWallets(), adminGetAllPools()])
      .then(([w, p]) => { setWallets(w); setPools(p) })
      .finally(() => setLoading(false))
  }, [])

  async function handleGiveCoins(e: React.FormEvent) {
    e.preventDefault()
    const n = parseInt(amount)
    if (!n || n <= 0) { toast.error('Ingresá un monto válido (mayor a 0)'); return }
    const signed = operation === 'remove' ? -n : n
    setSending(true)
    const res = await adminGiveCoinsAction(target, signed, desc)
    setSending(false)
    if (res.error) { toast.error(res.error); return }
    const verb = operation === 'add' ? 'enviadas a' : 'quitadas de'
    const skippedMsg = res.skipped ? ` (${res.skipped} sin saldo suficiente)` : ''
    toast.success(`${Math.abs(n)} coins ${verb} ${res.count} usuario${res.count !== 1 ? 's' : ''}${skippedMsg}`)
    setAmount(''); setDesc('')
    const updated = await adminGetAllWallets()
    setWallets(updated)
  }

  async function handlePayout(poolId: string) {
    const res = await adminPayoutPoolAction(poolId)
    if (res.error) { toast.error(res.error); return }
    toast.success(`Pago realizado a ${res.paid} ganadores`)
    const updated = await adminGetAllPools()
    setPools(updated)
  }

  async function handleStatusChange(poolId: string, status: string) {
    const res = await adminUpdatePoolStatus(poolId, status)
    if (res.error) { toast.error(res.error); return }
    toast.success('Estado actualizado')
    setPools(p => p.map(pool => pool.id === poolId ? { ...pool, status } : pool))
  }

  async function handleToggleMembers(poolId: string) {
    if (expandedPool === poolId) { setExpandedPool(null); return }
    setExpandedPool(poolId)
    if (!poolMembers[poolId]) {
      setLoadingMembers(poolId)
      const members = await adminGetPoolMembers(poolId)
      setPoolMembers(m => ({ ...m, [poolId]: members }))
      setLoadingMembers(null)
    }
  }

  async function handleKick(poolId: string, userId: string, username: string) {
    if (!confirm(`¿Expulsar a @${username} de esta polla?`)) return
    setKickingUser(userId)
    const res = await adminKickFromPoolAction(poolId, userId)
    setKickingUser(null)
    if (res.error) { toast.error(res.error); return }
    toast.success(`@${username} expulsado${res.refunded ? ' — entrada devuelta' : ''}`)
    // Actualizar lista de miembros y pools
    const [updatedMembers, updatedPools] = await Promise.all([
      adminGetPoolMembers(poolId),
      adminGetAllPools(),
    ])
    setPoolMembers(m => ({ ...m, [poolId]: updatedMembers }))
    setPools(updatedPools)
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />)}</div>

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Wallet & Pollas</h2>
        <p className="text-sm text-muted-foreground">Gestión de coins y grupos de apuesta</p>
      </div>

      {/* ── GIVE / REMOVE COINS ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Gem className="h-5 w-5 text-brand-red" /> Gestionar MundialCoins
        </h3>

        {/* Toggle agregar / quitar */}
        <div className="mb-4 inline-flex rounded-xl border overflow-hidden text-sm font-semibold">
          <button
            type="button"
            onClick={() => setOperation('add')}
            className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
              operation === 'add'
                ? 'bg-emerald-600 text-white'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            <Plus className="h-3.5 w-3.5" /> Agregar coins
          </button>
          <button
            type="button"
            onClick={() => setOperation('remove')}
            className={`flex items-center gap-1.5 px-4 py-2 transition-colors ${
              operation === 'remove'
                ? 'bg-red-600 text-white'
                : 'bg-background text-muted-foreground hover:bg-muted'
            }`}
          >
            <Minus className="h-3.5 w-3.5" /> Quitar coins
          </button>
        </div>

        {operation === 'remove' && (
          <p className="mb-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
            ⚠️ Si el usuario no tiene saldo suficiente, se omitirá sin error.
          </p>
        )}

        <form onSubmit={handleGiveCoins} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1 lg:col-span-1">
            <label className="text-xs font-medium text-muted-foreground">Usuario destino</label>
            <select value={target} onChange={e => setTarget(e.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red">
              <option value="all">🌍 Todos los usuarios</option>
              {wallets.map((w: any) => (
                <option key={w.user_id} value={w.user_id}>@{w.profile?.username}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Cantidad de coins</label>
            <input type="number" min={1} value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Ej: 1000"
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Descripción (opcional)</label>
            <input value={desc} onChange={e => setDesc(e.target.value)}
              placeholder={operation === 'add' ? 'Ej: Bienvenida al torneo' : 'Ej: Corrección de saldo'}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={sending}
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition ${
                operation === 'remove' ? 'bg-red-600' : 'bg-emerald-600'
              }`}>
              {sending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                : operation === 'add'
                  ? <><Plus className="h-4 w-4" /> Agregar coins</>
                  : <><Minus className="h-4 w-4" /> Quitar coins</>
              }
            </button>
          </div>
        </form>
      </div>

      {/* ── WALLETS TABLE ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Billeteras</h3>
          <span className="text-sm text-muted-foreground">{wallets.length} usuarios</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30 text-muted-foreground text-xs">
                <th className="px-4 py-2 text-left">Usuario</th>
                <th className="px-4 py-2 text-right">Saldo</th>
                <th className="px-4 py-2 text-right hidden sm:table-cell">Recibidas</th>
                <th className="px-4 py-2 text-right hidden sm:table-cell">Apostadas</th>
                <th className="px-4 py-2 text-right hidden sm:table-cell">Ganadas</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((w: any) => (
                <tr key={w.user_id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">@{w.profile?.username ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-brand-red">{(w.balance ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell text-emerald-600">{(w.total_deposited ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell text-red-500">{(w.total_wagered ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell text-yellow-600">{(w.total_won ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── POOLS MANAGEMENT ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold flex items-center gap-2"><Trophy className="h-4 w-4" /> Pollas</h3>
          <span className="text-sm text-muted-foreground">{pools.length} pollas</span>
        </div>
        {pools.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay pollas creadas aún.</p>
        ) : (
          <div className="divide-y">
            {pools.map((pool: any) => (
              <div key={pool.id}>
                {/* Fila principal */}
                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{pool.name}</p>
                      {pool.status === 'paid' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                          <Lock className="h-2.5 w-2.5" /> Bloqueada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Código: <span className="font-mono font-bold">{pool.invite_code}</span>
                      {' · '}{pool.member_count} jugadores
                      {' · '}<span className="font-semibold text-yellow-600">{pool.pot.toLocaleString()} coins en pozo</span>
                      {' · '}creado por @{pool.creator?.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {/* Gestionar miembros */}
                    <button
                      onClick={() => handleToggleMembers(pool.id)}
                      className="flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-semibold hover:bg-muted transition"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Miembros
                      {expandedPool === pool.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {/* Estado */}
                    <select value={pool.status} onChange={e => handleStatusChange(pool.id, e.target.value)}
                      className="h-8 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red">
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>

                    {pool.status === 'finished' && (
                      <button onClick={() => handlePayout(pool.id)}
                        className="flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-600 transition">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pagar
                      </button>
                    )}
                    {pool.status === 'paid' && (
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">✓ Pagada</span>
                    )}
                  </div>
                </div>

                {/* Panel de miembros expandible */}
                {expandedPool === pool.id && (
                  <div className="border-t bg-muted/20 px-5 py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Miembros de la polla
                    </p>
                    {loadingMembers === pool.id ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando...
                      </div>
                    ) : (poolMembers[pool.id] ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">Sin miembros.</p>
                    ) : (
                      <div className="space-y-2">
                        {(poolMembers[pool.id] ?? []).map((m: any) => (
                          <div key={m.user_id} className="flex items-center justify-between rounded-xl border bg-card px-3 py-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                                {m.profile?.username?.[0]?.toUpperCase() ?? '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">@{m.profile?.username ?? '—'}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {m.profile?.total_points ?? 0} pts
                                  {m.final_position ? ` · Posición final: ${m.final_position}°` : ''}
                                  {m.prize_earned ? ` · Premio: ${m.prize_earned.toLocaleString()} 🪙` : ''}
                                </p>
                              </div>
                            </div>
                            {pool.status !== 'paid' && (
                              <button
                                disabled={kickingUser === m.user_id}
                                onClick={() => handleKick(pool.id, m.user_id, m.profile?.username)}
                                className="ml-2 flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-2.5 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
                              >
                                {kickingUser === m.user_id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <UserX className="h-3.5 w-3.5" />}
                                Expulsar
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
