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

/* ─── Stage definitions ───────────────────────────────────── */
const STAGES = [
  {
    key: 'round_of_32', label: 'Ronda de 32', short: 'R32', slots: 16, points: 2,
    nextLabel: 'Los 16 ganadores pasan a Octavos',
    headerCls: 'bg-slate-600 text-white',
    accentCls: 'text-slate-600 dark:text-slate-400',
    matchLabel: 'Llave',
  },
  {
    key: 'round_of_16', label: 'Octavos de Final', short: 'R16', slots: 8, points: 3,
    nextLabel: 'Los 8 ganadores pasan a Cuartos',
    headerCls: 'bg-blue-600 text-white',
    accentCls: 'text-blue-600 dark:text-blue-400',
    matchLabel: 'Encuentro',
  },
  {
    key: 'quarterfinal', label: 'Cuartos de Final', short: 'QF', slots: 4, points: 5,
    nextLabel: 'Los 4 ganadores pasan a Semis',
    headerCls: 'bg-violet-600 text-white',
    accentCls: 'text-violet-600 dark:text-violet-400',
    matchLabel: 'Cuarto',
  },
  {
    key: 'semifinal', label: 'Semifinales', short: 'SF', slots: 2, points: 8,
    nextLabel: 'Los 2 finalistas',
    headerCls: 'bg-orange-500 text-white',
    accentCls: 'text-orange-600 dark:text-orange-400',
    matchLabel: 'Semi',
  },
  {
    key: 'final', label: 'Gran Final', short: 'F', slots: 1, points: 15,
    nextLabel: undefined,
    headerCls: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white',
    accentCls: 'text-yellow-600 dark:text-yellow-400',
    matchLabel: 'Final',
  },
]

/* ─── Team select dropdown ────────────────────────────────── */
function TeamSelect({
  slotNum,
  selectedId,
  available,
  onSelect,
  locked,
  side,
}: {
  slotNum: number
  selectedId: string
  available: Team[]
  onSelect: (id: string) => void
  locked: boolean
  side: 'left' | 'right' | 'center'
}) {
  const team = available.find((t) => t.id === selectedId) ?? null
  // Also search in full list for locked display
  const hasSel = !!selectedId

  const alignClass =
    side === 'left' ? 'text-right' : side === 'right' ? 'text-left' : 'text-center'

  return (
    <div className={`flex flex-col gap-1 ${side === 'left' ? 'items-end' : side === 'right' ? 'items-start' : 'items-center'}`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Clasificado {slotNum}
      </span>

      {locked ? (
        <div className={`flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
          {hasSel && team ? (
            <>
              <TeamFlag code={team.flag_emoji} label={team.name_es} />
              <span className="text-sm font-bold">{team.name_es}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground italic">Sin selección</span>
          )}
        </div>
      ) : (
        <>
          <select
            value={selectedId}
            onChange={(e) => onSelect(e.target.value)}
            disabled={available.length === 0}
            className={[
              'h-10 min-w-[140px] max-w-[200px] rounded-xl border bg-background px-3 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-400',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              hasSel ? 'font-semibold' : '',
            ].join(' ')}
          >
            <option value="">
              {available.length === 0 ? '← Ronda anterior' : 'Elegir equipo...'}
            </option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag_emoji} {t.name_es}
              </option>
            ))}
          </select>

          {hasSel && team && (
            <div className={`flex items-center gap-1.5 ${side === 'left' ? 'flex-row-reverse' : ''}`}>
              <TeamFlag code={team.flag_emoji} label={team.name_es} />
              <span className="text-xs font-semibold text-muted-foreground">{team.name_es}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Match card (pair of slots with VS) ─────────────────── */
function MatchCard({
  matchNum,
  matchLabel,
  leftSlot,
  rightSlot,
  leftId,
  rightId,
  availableForLeft,
  availableForRight,
  onSelectLeft,
  onSelectRight,
  locked,
}: {
  matchNum: number
  matchLabel: string
  leftSlot: number
  rightSlot: number
  leftId: string
  rightId: string
  availableForLeft: Team[]
  availableForRight: Team[]
  onSelectLeft: (id: string) => void
  onSelectRight: (id: string) => void
  locked: boolean
}) {
  const bothSelected = !!leftId && !!rightId
  return (
    <div className={`rounded-2xl border bg-card shadow-sm transition-all ${bothSelected ? 'ring-1 ring-green-300 dark:ring-green-800' : ''}`}>
      {/* Match header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b bg-muted/30 px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {matchLabel} {matchNum}
        </span>
        {bothSelected && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <CheckCircle2 className="h-3 w-3" /> Completo
          </span>
        )}
      </div>

      {/* Teams row */}
      <div className="flex items-center gap-3 px-4 py-4">
        {/* Left team */}
        <div className="flex-1">
          <TeamSelect
            slotNum={leftSlot}
            selectedId={leftId}
            available={availableForLeft}
            onSelect={onSelectLeft}
            locked={locked}
            side="left"
          />
        </div>

        {/* VS separator */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-card text-[11px] font-extrabold text-muted-foreground">
            VS
          </div>
        </div>

        {/* Right team */}
        <div className="flex-1">
          <TeamSelect
            slotNum={rightSlot}
            selectedId={rightId}
            available={availableForRight}
            onSelect={onSelectRight}
            locked={locked}
            side="right"
          />
        </div>
      </div>
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

  /** Base pool for a stage: teams that advanced from the previous stage */
  function getStagePool(stageIndex: number): Team[] {
    if (stageIndex === 0) return teams
    const prev = STAGES[stageIndex - 1]
    const ids = Array.from({ length: prev.slots }, (_, i) => `${prev.key}-${i + 1}`)
      .map((sk) => predictions[`${prev.key}:${sk}`])
      .filter(Boolean)
    return Array.from(new Set(ids)).map((id) => teamMap.get(id)).filter((t): t is Team => !!t)
  }

  /**
   * Available teams for a specific slot = stage pool MINUS teams already
   * selected in OTHER slots of the same stage (prevents duplicates).
   */
  function getAvailableForSlot(stageKey: string, slotKey: string, stageIndex: number): Team[] {
    const pool = getStagePool(stageIndex)
    const stage = STAGES[stageIndex]
    const usedInOtherSlots = new Set(
      Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
        .filter((sk) => sk !== slotKey)
        .map((sk) => predictions[`${stage.key}:${sk}`])
        .filter(Boolean),
    )
    return pool.filter((t) => !usedInOtherSlots.has(t.id))
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

    // Cascade-clear downstream stages if team changed
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
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="h-28 animate-pulse rounded-2xl bg-muted/60" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/40" style={{ opacity: 1 - i * 0.2 }} />
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
                  : 'Completá las llaves de cada ronda · Empezá por arriba'}
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
                className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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

      {/* ── Points guide ── */}
      <div className="flex flex-wrap justify-center gap-2">
        {STAGES.map((s) => (
          <div key={s.key} className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs shadow-sm">
            <span className={`h-2 w-2 rounded-full ${s.headerCls.split(' ')[0]}`} />
            <span className="font-semibold">{s.label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              {s.points} pts
            </span>
          </div>
        ))}
      </div>

      {/* ── Duplicate warning note ── */}
      {!isLocked && (
        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
          <span className="mt-0.5 shrink-0">ℹ️</span>
          <span>
            <strong>Sin repeticiones:</strong> Un equipo solo puede aparecer una vez por ronda.
            Si ya elegiste un equipo en otra llave, no aparece en las restantes.
            Empezá por la <strong>Ronda de 32</strong>.
          </span>
        </div>
      )}

      {/* ── Stages ── */}
      <div className="space-y-6">
        {STAGES.map((stage, stageIdx) => {
          const pool = getStagePool(stageIdx)
          const slotKeys = Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
          const filled = slotKeys.filter((sk) => predictions[`${stage.key}:${sk}`]).length
          const isLastStage = stageIdx === STAGES.length - 1

          // For the final (1 slot), show a special champion picker
          if (isLastStage) {
            const slotKey = `${stage.key}-1`
            const selectedId = predictions[`${stage.key}:${slotKey}`] ?? ''
            const available = getAvailableForSlot(stage.key, slotKey, stageIdx)

            return (
              <div key={stage.key}>
                {/* Stage header */}
                <div className={`rounded-t-2xl px-4 py-3 flex items-center justify-between ${stage.headerCls}`}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 shrink-0" />
                    <span className="font-bold tracking-wide">{stage.label}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                      {stage.points} pts
                    </span>
                  </div>
                  <span className={`text-[12px] font-semibold ${filled === 1 ? 'text-white' : 'text-white/60'}`}>
                    {filled === 1 ? '✓ Elegido' : 'Sin elegir'}
                  </span>
                </div>

                {/* Champion card */}
                <div className={`rounded-b-2xl border border-t-0 p-6 text-center shadow-sm ${
                  champion
                    ? 'bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20'
                    : 'bg-card'
                }`}>
                  <Trophy className={`mx-auto mb-3 h-10 w-10 ${champion ? 'text-yellow-500' : 'text-muted-foreground/30'}`} />
                  <p className={`mb-4 font-bebas text-xl tracking-widest ${champion ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                    ¿Quién será el Campeón del Mundo?
                  </p>

                  {isLocked ? (
                    <div className="flex flex-col items-center gap-2">
                      {champion ? (
                        <>
                          <TeamFlag code={champion.flag_emoji} label={champion.name_es} className="h-10 w-14" />
                          <p className="text-xl font-extrabold">{champion.name_es}</p>
                          <p className="text-sm text-muted-foreground">{champion.code} · 15 pts si acertás</p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No elegiste campeón</p>
                      )}
                      <div className="mt-2 flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                        <Lock className="h-3 w-3" /> Bloqueado
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto max-w-xs space-y-3">
                      <select
                        value={selectedId}
                        onChange={(e) => handleSelect(stage.key, slotKey, e.target.value)}
                        disabled={available.length === 0}
                        className="h-12 w-full rounded-xl border-2 border-yellow-400 bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400/40 disabled:opacity-40"
                      >
                        <option value="">
                          {available.length === 0 ? '← Completá las Semis primero' : '🏆 Elegir campeón...'}
                        </option>
                        {available.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.flag_emoji} {t.name_es}
                          </option>
                        ))}
                      </select>
                      {champion && (
                        <div className="flex flex-col items-center gap-1">
                          <TeamFlag code={champion.flag_emoji} label={champion.name_es} className="h-8 w-12" />
                          <p className="font-bold">{champion.name_es}</p>
                          <p className="text-xs text-muted-foreground">15 pts si acertás</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          }

          // For all other stages: show match cards (pairs of slots)
          // Pair slots: [1,2], [3,4], [5,6], ...
          const pairs: [string, string][] = []
          for (let i = 0; i < slotKeys.length; i += 2) {
            pairs.push([slotKeys[i], slotKeys[i + 1]])
          }

          return (
            <div key={stage.key}>
              {/* Stage header */}
              <div className={`rounded-t-2xl px-4 py-3 flex items-center justify-between ${stage.headerCls}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wide">{stage.label}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">
                    {stage.points} pts c/u
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <span className={`rounded-full px-2 py-0.5 ${filled === stage.slots ? 'bg-white/30' : 'bg-white/10'}`}>
                    {filled}/{stage.slots}
                  </span>
                  {filled === stage.slots && <CheckCircle2 className="h-4 w-4" />}
                </span>
              </div>

              {/* Hint if no pool yet */}
              {stageIdx > 0 && pool.length === 0 && (
                <div className="border-x border-b bg-muted/20 px-4 py-2 text-[11px] font-medium text-muted-foreground">
                  ← Completá la ronda anterior para habilitar esta sección
                </div>
              )}

              {/* Match cards grid */}
              <div className="rounded-b-2xl border border-t-0 bg-muted/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {pairs.map(([leftKey, rightKey], pairIdx) => {
                    const leftId = predictions[`${stage.key}:${leftKey}`] ?? ''
                    const rightId = predictions[`${stage.key}:${rightKey}`] ?? ''
                    const leftNum = pairIdx * 2 + 1
                    const rightNum = pairIdx * 2 + 2

                    return (
                      <MatchCard
                        key={`${leftKey}-${rightKey}`}
                        matchNum={pairIdx + 1}
                        matchLabel={stage.matchLabel}
                        leftSlot={leftNum}
                        rightSlot={rightNum}
                        leftId={leftId}
                        rightId={rightId}
                        availableForLeft={getAvailableForSlot(stage.key, leftKey, stageIdx)}
                        availableForRight={getAvailableForSlot(stage.key, rightKey, stageIdx)}
                        onSelectLeft={(id) => handleSelect(stage.key, leftKey, id)}
                        onSelectRight={(id) => handleSelect(stage.key, rightKey, id)}
                        locked={isLocked}
                      />
                    )
                  })}
                </div>

                {/* Advance note */}
                {stage.nextLabel && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <ChevronDown className={`h-4 w-4 ${stage.accentCls}`} />
                    <span className={`text-[11px] font-semibold ${stage.accentCls}`}>{stage.nextLabel}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
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
