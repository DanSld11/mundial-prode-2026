'use client'

import { useEffect, useState } from 'react'
import {
  Swords, Trophy, Lock, Save, AlertTriangle, CheckCircle2, ChevronDown, Star,
} from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { toast } from 'sonner'
import {
  getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId,
} from '@/lib/auth-client'

interface Team {
  id: string
  name_es: string
  flag_emoji: string
  code: string
}

const STAGES = [
  {
    key: 'round_of_32',
    label: 'Ronda de 32',
    short: 'R32',
    slots: 16,
    points: 2,
    nextLabel: '16 equipos avanzan a Octavos',
    headerCls: 'bg-slate-600 text-white',
    ringCls: 'ring-slate-400',
    accentCls: 'text-slate-600 dark:text-slate-400',
    borderCls: 'border-slate-300 dark:border-slate-600',
    gridCols: 'grid-cols-2 sm:grid-cols-4',
  },
  {
    key: 'round_of_16',
    label: 'Octavos de Final',
    short: 'R16',
    slots: 8,
    points: 3,
    nextLabel: '8 equipos avanzan a Cuartos',
    headerCls: 'bg-blue-600 text-white',
    ringCls: 'ring-blue-400',
    accentCls: 'text-blue-600 dark:text-blue-400',
    borderCls: 'border-blue-300 dark:border-blue-600',
    gridCols: 'grid-cols-2 sm:grid-cols-4',
  },
  {
    key: 'quarterfinal',
    label: 'Cuartos de Final',
    short: 'QF',
    slots: 4,
    points: 5,
    nextLabel: '4 equipos avanzan a Semis',
    headerCls: 'bg-violet-600 text-white',
    ringCls: 'ring-violet-500',
    accentCls: 'text-violet-600 dark:text-violet-400',
    borderCls: 'border-violet-300 dark:border-violet-600',
    gridCols: 'grid-cols-2 sm:grid-cols-4',
  },
  {
    key: 'semifinal',
    label: 'Semifinales',
    short: 'SF',
    slots: 2,
    points: 8,
    nextLabel: '2 finalistas',
    headerCls: 'bg-orange-500 text-white',
    ringCls: 'ring-orange-400',
    accentCls: 'text-orange-600 dark:text-orange-400',
    borderCls: 'border-orange-300 dark:border-orange-600',
    gridCols: 'grid-cols-1 sm:grid-cols-2',
  },
  {
    key: 'final',
    label: 'Gran Final',
    short: 'F',
    slots: 1,
    points: 15,
    nextLabel: undefined,
    headerCls: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
    ringCls: 'ring-yellow-400',
    accentCls: 'text-yellow-600 dark:text-yellow-400',
    borderCls: 'border-yellow-400 dark:border-yellow-500',
    gridCols: 'grid-cols-1',
  },
]

/* ─── Slot card ─────────────────────────────────────────── */
function SlotCard({
  num,
  selectedTeam,
  availableTeams,
  onSelect,
  locked,
  ringCls,
  isChampion = false,
}: {
  num: number
  selectedTeam: Team | undefined
  availableTeams: Team[]
  onSelect: (id: string) => void
  locked: boolean
  ringCls: string
  isChampion?: boolean
}) {
  const hasSel = !!selectedTeam
  return (
    <div
      className={[
        'relative rounded-xl border bg-card shadow-sm transition-all duration-200',
        hasSel ? `ring-2 ${ringCls}` : '',
        isChampion ? 'ring-2 ring-yellow-400 shadow-yellow-200 dark:shadow-yellow-900' : '',
      ].join(' ')}
    >
      {/* Slot number */}
      <span className="absolute -top-2.5 -left-2.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground ring-1 ring-border">
        {num}
      </span>

      <div className={isChampion ? 'p-4' : 'p-2.5'}>
        {locked ? (
          <div className="flex items-center gap-2">
            {hasSel ? (
              <>
                <TeamFlag code={selectedTeam!.flag_emoji} label={selectedTeam!.name_es} />
                <span className="flex-1 truncate text-xs font-semibold">{selectedTeam!.name_es}</span>
                {isChampion && <Trophy className="h-4 w-4 shrink-0 text-yellow-500" />}
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">Sin selección</span>
            )}
            <Lock className="h-3 w-3 shrink-0 text-muted-foreground/40" />
          </div>
        ) : (
          <>
            <select
              value={selectedTeam?.id ?? ''}
              onChange={(e) => onSelect(e.target.value)}
              disabled={availableTeams.length === 0}
              className={[
                'w-full rounded-lg border bg-background px-2 text-xs',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                isChampion ? 'h-10 text-sm' : 'h-8',
              ].join(' ')}
            >
              <option value="">
                {availableTeams.length === 0 ? '← Elegí la ronda anterior' : 'Elegir equipo...'}
              </option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.flag_emoji} {t.name_es}
                </option>
              ))}
            </select>

            {hasSel && (
              <div className="mt-2 flex items-center gap-1.5">
                <TeamFlag code={selectedTeam!.flag_emoji} label={selectedTeam!.name_es} />
                <span className={['truncate font-semibold text-muted-foreground', isChampion ? 'text-sm' : 'text-[10px]'].join(' ')}>
                  {selectedTeam!.name_es}
                </span>
                {isChampion && <Trophy className="h-3.5 w-3.5 shrink-0 text-yellow-500" />}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Funnel connector ──────────────────────────────────── */
function FunnelArrow({ label, count, accentCls }: { label: string; count: number; accentCls: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-2">
      <ChevronDown className={`h-5 w-5 ${accentCls}`} />
      <span className={`text-[11px] font-semibold ${accentCls}`}>
        {label}
      </span>
      <div className={`h-px w-16 ${accentCls.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} opacity-30`} />
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────── */
export default function BracketPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [predictions, setPredictions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [confirmLock, setConfirmLock] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = getAccessToken()
    setToken(t)
    const supabase = createAnonClient()

    supabase.from('teams').select('id, name_es, flag_emoji, code').order('name_es').then(({ data }) => {
      setTeams(data ?? [])
    })

    if (t) {
      const authed = createAuthedClient(t)
      getCurrentUserId(t).then((uid) => {
        if (!uid) { setLoading(false); return }
        setUserId(uid)
        authed
          .from('bracket_predictions')
          .select('stage, slot_key, team_id')
          .eq('user_id', uid)
          .then(({ data: p }) => {
            const map: Record<string, string> = {}
            let locked = false
            for (const pred of (p ?? [])) {
              if (pred.stage === 'meta' && pred.slot_key === 'locked') { locked = true; continue }
              map[`${pred.stage}:${pred.slot_key}`] = pred.team_id ?? ''
            }
            setPredictions(map)
            setIsLocked(locked)
            setLoading(false)
          })
      })
    } else {
      setLoading(false)
    }
  }, [])

  const teamMap = new Map(teams.map((t) => [t.id, t]))

  function getAvailableTeams(stageIndex: number): Team[] {
    if (stageIndex === 0) return teams
    const prev = STAGES[stageIndex - 1]
    const ids = Array.from({ length: prev.slots }, (_, i) => `${prev.key}-${i + 1}`)
      .map((sk) => predictions[`${prev.key}:${sk}`])
      .filter(Boolean)
    return Array.from(new Set(ids)).map((id) => teamMap.get(id)).filter((t): t is Team => !!t)
  }

  async function handleSelect(stage: string, slotKey: string, teamId: string) {
    if (isLocked) return
    if (!token || !userId) { toast.error('Iniciá sesión para guardar.'); return }

    const key = `${stage}:${slotKey}`
    const oldTeamId = predictions[key]
    const newPredictions = { ...predictions, [key]: teamId }
    const toUpsert: { stage: string; slot_key: string; team_id: string | null }[] = [
      { stage, slot_key: slotKey, team_id: teamId || null },
    ]

    if (oldTeamId && oldTeamId !== teamId) {
      const stageIdx = STAGES.findIndex((s) => s.key === stage)
      for (let i = stageIdx + 1; i < STAGES.length; i++) {
        const next = STAGES[i]
        for (let j = 1; j <= next.slots; j++) {
          const sk = `${next.key}-${j}`
          const k = `${next.key}:${sk}`
          if (newPredictions[k] === oldTeamId) {
            newPredictions[k] = ''
            toUpsert.push({ stage: next.key, slot_key: sk, team_id: null })
          }
        }
      }
    }

    setPredictions(newPredictions)
    setIsSaving(true)
    const authed = createAuthedClient(token)
    const { error } = await authed.from('bracket_predictions').upsert(
      toUpsert.map((r) => ({ user_id: userId, stage: r.stage, slot_key: r.slot_key, team_id: r.team_id })),
      { onConflict: 'user_id, stage, slot_key' },
    )
    setIsSaving(false)
    if (error) toast.error(error.message)
  }

  async function handleLockConfirmed() {
    if (!token || !userId) return
    setIsSaving(true)
    const authed = createAuthedClient(token)
    const { error } = await authed.from('bracket_predictions').upsert(
      { user_id: userId, stage: 'meta', slot_key: 'locked', team_id: null },
      { onConflict: 'user_id, stage, slot_key' },
    )
    setIsSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      setIsLocked(true)
      setConfirmLock(false)
      toast.success('¡Cuadro bloqueado!')
    }
  }

  const totalSlots = STAGES.reduce((s, st) => s + st.slots, 0)
  const filledSlots = Object.values(predictions).filter(Boolean).length
  const completePct = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const champion = teamMap.get(predictions['final:final-1'] ?? '')

  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="h-28 animate-pulse rounded-2xl bg-muted/60" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/40" style={{ opacity: 1 - i * 0.15 }} />
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">

      {/* ── Header ── */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Cuadro Eliminatorio</h1>
              <p className="text-sm text-muted-foreground">
                {isLocked
                  ? '🔒 Tu predicción está confirmada'
                  : 'Predecí quién avanza en cada ronda · Empezá por arriba'}
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:flex-col sm:items-end">
            <span className="text-3xl font-extrabold tabular-nums brand-red">{filledSlots}</span>
            <span className="text-sm text-muted-foreground">/ {totalSlots} predicciones</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 space-y-1.5">
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-red transition-all duration-700"
              style={{ width: `${completePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{completePct}% completado</span>
            {isLocked && (
              <span className="flex items-center gap-1 font-semibold text-emerald-600">
                <Lock className="h-2.5 w-2.5" /> Bloqueado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Lock / save banner ── */}
      {!isLocked && (
        <div className={`rounded-xl border p-4 shadow-sm ${confirmLock ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'bg-card'}`}>
          {!confirmLock ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">¿Listo para confirmar tu cuadro?</p>
                <p className="text-xs text-muted-foreground">Una vez guardado no podrás modificar tus predicciones.</p>
              </div>
              <button
                onClick={() => setConfirmLock(true)}
                disabled={isSaving || filledSlots === 0}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-red/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" /> Guardar y bloquear
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-400">¿Confirmar bloqueo?</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500">Esta acción es irreversible.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmLock(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLockConfirmed}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving ? 'Guardando...' : 'Sí, confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Points guide chips ── */}
      <div className="flex flex-wrap justify-center gap-2">
        {STAGES.map((s) => (
          <div
            key={s.key}
            className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs shadow-sm"
          >
            <span className={`h-2 w-2 rounded-full ${s.headerCls.split(' ')[0]}`} />
            <span className="font-semibold">{s.label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {s.points} pts
            </span>
          </div>
        ))}
      </div>

      {/* ── Stage funnel ── */}
      <div className="space-y-0">
        {STAGES.map((stage, stageIdx) => {
          const slotKeys = Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
          const available = getAvailableTeams(stageIdx)
          const filled = slotKeys.filter((sk) => predictions[`${stage.key}:${sk}`]).length
          const isLastStage = stageIdx === STAGES.length - 1

          return (
            <div key={stage.key}>
              {/* Stage card */}
              <div className={`rounded-2xl border overflow-hidden shadow-sm ${isLastStage ? 'ring-2 ring-yellow-400/60' : ''}`}>

                {/* Stage header */}
                <div className={`${stage.headerCls} px-4 py-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {isLastStage && <Trophy className="h-5 w-5 shrink-0" />}
                    <span className="font-bold tracking-wide">{stage.label}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                      {stage.points} pts c/u
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold">
                    <span className={`rounded-full px-2 py-0.5 ${filled === stage.slots ? 'bg-white/30' : 'bg-white/10'}`}>
                      {filled}/{stage.slots}
                    </span>
                    {filled === stage.slots && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </div>

                {/* Hint for cascade */}
                {stageIdx > 0 && !isLocked && available.length === 0 && (
                  <div className={`border-b px-4 py-2 text-[11px] font-medium ${stage.accentCls} bg-muted/30`}>
                    ← Primero completá la ronda anterior para habilitar estas selecciones
                  </div>
                )}
                {stageIdx > 0 && available.length > 0 && !isLocked && (
                  <div className="border-b bg-muted/20 px-4 py-1.5 text-[11px] text-muted-foreground">
                    {available.length} equipo{available.length !== 1 ? 's' : ''} disponible{available.length !== 1 ? 's' : ''} para esta ronda
                  </div>
                )}

                {/* Slots grid */}
                <div className={`bg-card p-4 ${isLastStage ? 'flex justify-center' : ''}`}>
                  <div className={`grid gap-3 w-full ${stage.gridCols} ${isLastStage ? 'max-w-xs' : ''}`}>
                    {slotKeys.map((slotKey, idx) => {
                      const key = `${stage.key}:${slotKey}`
                      const selectedTeam = teamMap.get(predictions[key] ?? '')
                      const isChampion = isLastStage && idx === 0
                      return (
                        <SlotCard
                          key={slotKey}
                          num={idx + 1}
                          selectedTeam={selectedTeam}
                          availableTeams={available}
                          onSelect={(id) => handleSelect(stage.key, slotKey, id)}
                          locked={isLocked}
                          ringCls={stage.ringCls}
                          isChampion={isChampion}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Funnel arrow between stages */}
              {stage.nextLabel && (
                <FunnelArrow
                  label={stage.nextLabel}
                  count={stage.slots}
                  accentCls={STAGES[stageIdx + 1]?.accentCls ?? 'text-muted-foreground'}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ── Champion showcase ── */}
      <div className={`rounded-2xl border-2 p-6 text-center shadow-lg transition-all ${
        champion
          ? 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20'
          : 'border-muted bg-muted/20'
      }`}>
        <Trophy className={`mx-auto mb-3 h-12 w-12 ${champion ? 'text-yellow-500' : 'text-muted-foreground/30'}`} />
        <h2 className={`font-bebas text-2xl tracking-widest ${champion ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
          Tu Campeón del Mundo
        </h2>
        {champion ? (
          <div className="mt-4 flex flex-col items-center gap-2">
            <TeamFlag code={champion.flag_emoji} label={champion.name_es} className="h-10 w-14" />
            <p className="text-xl font-extrabold">{champion.name_es}</p>
            <p className="text-sm text-muted-foreground">{champion.code} · 15 pts si acertás</p>
            {isLocked && (
              <div className="mt-2 flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                <Lock className="h-3 w-3" /> Predicción bloqueada
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Completá la Gran Final para ver tu campeón
          </p>
        )}
      </div>

      {/* ── Points explanation ── */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-brand-gold" />
          <h2 className="text-sm font-semibold">¿Cómo se puntúa?</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s.key} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
              <div className={`text-2xl font-extrabold ${s.accentCls}`}>{s.points}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Cada equipo que acertás que avanza a esa ronda suma los puntos indicados.
          El campeón vale <span className="font-bold text-yellow-600">15 pts</span>.
        </p>
      </div>

    </div>
  )
}
