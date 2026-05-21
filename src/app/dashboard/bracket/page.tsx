'use client'

import { useEffect, useState } from 'react'
import { Swords, Trophy, Lock, Save, AlertTriangle, CheckCircle2, ChevronDown, Star } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'
import { toast } from 'sonner'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'

interface Team { id: string; name_es: string; flag_emoji: string; code: string; group_name?: string }

/* R32 card number → groups whose teams are eligible (null = all 48) */
const R32_GROUPS: Record<number, string[] | null> = {
  1: ['A', 'B'],
  2: ['C', 'D'],
  3: ['E', 'F'],
  4: ['G', 'H'],
  5: ['I', 'J'],
  6: ['K', 'L'],
  7: null, // mejores 3ros — cualquier grupo
  8: null,
}

/* ─── Stage definitions ──────────────────────────────────── */
const STAGES = [
  { key: 'round_of_32', label: 'Ronda de 32',    short: 'R32', slots: 16, points: 2,  headerCls: 'bg-slate-600 text-white',   accentCls: 'text-slate-500' },
  { key: 'round_of_16', label: 'Octavos de Final', short: 'R16', slots: 8,  points: 3,  headerCls: 'bg-blue-600 text-white',    accentCls: 'text-blue-500'  },
  { key: 'quarterfinal', label: 'Cuartos de Final', short: 'QF',  slots: 4,  points: 5,  headerCls: 'bg-violet-600 text-white',  accentCls: 'text-violet-500'},
  { key: 'semifinal',   label: 'Semifinales',      short: 'SF',  slots: 2,  points: 8,  headerCls: 'bg-orange-500 text-white',  accentCls: 'text-orange-500'},
  { key: 'final',       label: 'Gran Final',        short: 'F',   slots: 1,  points: 15, headerCls: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white', accentCls: 'text-yellow-600' },
]

/*
  BRACKET TREE — who feeds into whom:
  ─────────────────────────────────────────────────────────────────────────
  Stage K, slot S  ←  prev stage slots (2S−1) and (2S)
  Stage K, match card M  →  winner becomes next stage slot M

  R32 (16 slots, 8 match cards):
    card 1: slots 1+2  → R16 slot 1
    card 2: slots 3+4  → R16 slot 2
    ...
    card 8: slots 15+16 → R16 slot 8

  R16 (8 slots, 4 match cards):
    card 1 slots 1,2:  slot 1 ← R32 card 1 (slots 1,2);  slot 2 ← R32 card 2 (slots 3,4)
    card 2 slots 3,4:  slot 3 ← R32 card 3 (slots 5,6);  slot 4 ← R32 card 4 (slots 7,8)
    card 3 slots 5,6:  slot 5 ← R32 card 5 (slots 9,10); slot 6 ← R32 card 6 (slots 11,12)
    card 4 slots 7,8:  slot 7 ← R32 card 7 (slots 13,14);slot 8 ← R32 card 8 (slots 15,16)

  QF (4 slots, 2 match cards):
    card 1 slots 1,2:  slot 1 ← R16 card 1 (slots 1,2);  slot 2 ← R16 card 2 (slots 3,4)
    card 2 slots 3,4:  slot 3 ← R16 card 3 (slots 5,6);  slot 4 ← R16 card 4 (slots 7,8)

  SF (2 slots, 1 match card):
    card 1 slots 1,2:  slot 1 ← QF card 1 (slots 1,2);   slot 2 ← QF card 2 (slots 3,4)

  Final (1 slot): slot 1 ← SF slot 1 and SF slot 2
*/

export default function BracketPage() {
  const [teams,       setTeams      ] = useState<Team[]>([])
  const [predictions, setPredictions] = useState<Record<string, string>>({})
  const [loading,     setLoading    ] = useState(true)
  const [isSaving,    setIsSaving   ] = useState(false)
  const [isLocked,    setIsLocked   ] = useState(false)
  const [confirmLock, setConfirmLock] = useState(false)
  const [userId,      setUserId     ] = useState<string | null>(null)
  const [token,       setToken      ] = useState<string | null>(null)

  useEffect(() => {
    const t = getAccessToken()
    setToken(t)
    createAnonClient().from('teams').select('id, name_es, flag_emoji, code, group_name').order('group_name').then(({ data }) => setTeams(data ?? []))
    if (!t) { setLoading(false); return }
    const authed = createAuthedClient(t)
    getCurrentUserId(t).then(uid => {
      if (!uid) { setLoading(false); return }
      setUserId(uid)
      authed.from('bracket_predictions').select('stage, slot_key, team_id').eq('user_id', uid).then(({ data: p }) => {
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
  }, [])

  const teamMap = new Map(teams.map(t => [t.id, t]))

  /**
   * Returns available teams for a specific slot.
   *
   * For R32 (stage 0): all 48 teams minus those already used in other R32 slots.
   * For later stages: ONLY the 2 teams from the parent slots in the previous stage
   *   (prev stage slots 2S−1 and 2S, where S is this slot's index).
   */
  function availableFor(stageIndex: number, slotIndex: number): Team[] {
    const stage = STAGES[stageIndex]

    if (stageIndex === 0) {
      const cardNum      = Math.ceil(slotIndex / 2)
      const allowedGroups = R32_GROUPS[cardNum] ?? null
      const thisKey = `${stage.key}-${slotIndex}`
      const used = new Set(
        Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
          .filter(sk => sk !== thisKey)
          .map(sk => predictions[`${stage.key}:${sk}`])
          .filter(Boolean),
      )
      const pool = allowedGroups
        ? teams.filter(t => allowedGroups.includes(t.group_name ?? ''))
        : teams
      return pool.filter(t => !used.has(t.id))
    }

    // Parent slots in previous stage: (2S−1) and (2S)
    const prev = STAGES[stageIndex - 1]
    const p1Key = `${prev.key}-${2 * slotIndex - 1}`
    const p2Key = `${prev.key}-${2 * slotIndex}`
    const id1 = predictions[`${prev.key}:${p1Key}`]
    const id2 = predictions[`${prev.key}:${p2Key}`]
    const out: Team[] = []
    if (id1) { const t = teamMap.get(id1); if (t) out.push(t) }
    if (id2 && id2 !== id1) { const t = teamMap.get(id2); if (t) out.push(t) }
    return out
  }

  async function handleSelect(stageKey: string, slotKey: string, teamId: string) {
    if (isLocked || !token || !userId) {
      if (!token || !userId) toast.error('Iniciá sesión para guardar.')
      return
    }
    const uid      = userId  // capture non-null for TS narrowing
    const key      = `${stageKey}:${slotKey}`
    const oldId    = predictions[key]
    const next     = { ...predictions, [key]: teamId }
    const toUpsert = [{ stage: stageKey, slot_key: slotKey, team_id: teamId || null }] as
      { stage: string; slot_key: string; team_id: string | null }[]

    // Cascade-clear downstream slots that had the old team
    if (oldId && oldId !== teamId) {
      const si = STAGES.findIndex(s => s.key === stageKey)
      for (let i = si + 1; i < STAGES.length; i++) {
        const ns = STAGES[i]
        for (let j = 1; j <= ns.slots; j++) {
          const sk = `${ns.key}-${j}`
          const k  = `${ns.key}:${sk}`
          if (next[k] === oldId) {
            next[k] = ''
            toUpsert.push({ stage: ns.key, slot_key: sk, team_id: null })
          }
        }
      }
    }

    setPredictions(next)
    setIsSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createAuthedClient(token).from('bracket_predictions') as any).upsert(
      toUpsert.map(r => ({ user_id: uid, stage: r.stage, slot_key: r.slot_key, team_id: r.team_id })),
      { onConflict: 'user_id,stage,slot_key' },
    )
    setIsSaving(false)
    if (error) toast.error(error.message)
  }

  async function handleLockConfirmed() {
    if (!token || !userId) return
    setIsSaving(true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createAuthedClient(token).from('bracket_predictions') as any).upsert(
      { user_id: userId, stage: 'meta', slot_key: 'locked', team_id: null },
      { onConflict: 'user_id,stage,slot_key' },
    )
    setIsSaving(false)
    if (error) toast.error(error.message)
    else { setIsLocked(true); setConfirmLock(false); toast.success('¡Cuadro bloqueado!') }
  }

  const totalSlots   = STAGES.reduce((s, st) => s + st.slots, 0)
  const filledSlots  = Object.values(predictions).filter(Boolean).length
  const completePct  = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
  const champion     = teamMap.get(predictions['final:final-1'] ?? '')

  if (loading) return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="h-28 animate-pulse rounded-2xl bg-muted/60" />
      {[1,2,3].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/40" style={{ opacity: 1 - i * 0.2 }} />)}
    </div>
  )

  /* ── helper: render a single team select inside a match card side ── */
  function TeamPicker({
    stageKey, slotKey, slotIndex, stageIndex, side,
  }: { stageKey: string; slotKey: string; slotIndex: number; stageIndex: number; side: 'left' | 'right' }) {
    const pool      = availableFor(stageIndex, slotIndex)
    const selectedId = predictions[`${stageKey}:${slotKey}`] ?? ''
    const team      = teamMap.get(selectedId)
    const prevStage = stageIndex > 0 ? STAGES[stageIndex - 1] : null
    const sourceLabel = prevStage ? `Gan. ${prevStage.short} Llave ${slotIndex}` : null
    const isRight   = side === 'right'

    return (
      <div className={`flex flex-1 flex-col gap-1 ${isRight ? 'items-start' : 'items-end'}`}>
        {/* Source label */}
        {sourceLabel && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {sourceLabel}
          </span>
        )}

        {isLocked ? (
          <div className={`flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2 ${isRight ? '' : 'flex-row-reverse'}`}>
            {team ? (
              <>
                <TeamFlag code={team.flag_emoji} label={team.name_es} />
                <span className="text-sm font-bold leading-tight">{team.name_es}</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">Sin selección</span>
            )}
          </div>
        ) : (
          <>
            <select
              value={selectedId}
              onChange={e => handleSelect(stageKey, slotKey, e.target.value)}
              disabled={pool.length === 0}
              className={[
                'h-10 w-full max-w-[210px] rounded-xl border bg-background px-3 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0',
                'disabled:cursor-not-allowed disabled:opacity-40',
                selectedId ? 'font-semibold' : '',
              ].join(' ')}
            >
              <option value="">
                {pool.length === 0
                  ? (stageIndex === 0 ? 'Elegir...' : '← Completá la ronda anterior')
                  : 'Elegir equipo...'}
              </option>
              {pool.map(t => (
                <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
              ))}
            </select>
            {team && (
              <div className={`flex items-center gap-1.5 ${isRight ? '' : 'flex-row-reverse'}`}>
                <TeamFlag code={team.flag_emoji} label={team.name_es} />
                <span className="text-[11px] font-semibold text-muted-foreground">{team.name_es}</span>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">

      {/* ── Header ── */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Cuadro Eliminatorio</h1>
              <p className="text-sm text-muted-foreground">
                {isLocked ? '🔒 Predicción confirmada' : 'Completá las llaves en orden · El ganador de cada llave avanza'}
              </p>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 sm:flex-col sm:items-end">
            <span className="text-3xl font-extrabold tabular-nums brand-red">{filledSlots}</span>
            <span className="text-sm text-muted-foreground">/ {totalSlots} predicciones</span>
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand-red transition-all duration-700" style={{ width: `${completePct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{completePct}% completado</span>
            {isLocked && <span className="flex items-center gap-1 font-semibold text-emerald-600"><Lock className="h-2.5 w-2.5" /> Bloqueado</span>}
          </div>
        </div>
      </div>

      {/* ── Lock banner ── */}
      {!isLocked && (
        <div className={`rounded-xl border p-4 shadow-sm ${confirmLock ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'bg-card'}`}>
          {!confirmLock ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">¿Listo para confirmar tu cuadro?</p>
                <p className="text-xs text-muted-foreground">Una vez guardado no podrás modificar tus predicciones.</p>
              </div>
              <button onClick={() => setConfirmLock(true)} disabled={isSaving || filledSlots === 0}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
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
                <button onClick={() => setConfirmLock(false)} className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-muted">Cancelar</button>
                <button onClick={handleLockConfirmed} disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-50">
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving ? 'Guardando...' : 'Sí, confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Points chips ── */}
      <div className="flex flex-wrap justify-center gap-2">
        {STAGES.map(s => (
          <div key={s.key} className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs shadow-sm">
            <span className={`h-2 w-2 rounded-full ${s.headerCls.split(' ')[0]}`} />
            <span className="font-semibold">{s.label}</span>
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">{s.points} pts</span>
          </div>
        ))}
      </div>

      {/* ── Stages ── */}
      <div className="space-y-6">
        {STAGES.map((stage, si) => {
          const slotKeys  = Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
          const filled    = slotKeys.filter(sk => predictions[`${stage.key}:${sk}`]).length
          const isLast    = si === STAGES.length - 1
          const nextStage = STAGES[si + 1]

          /* ── Final: single champion picker ── */
          if (isLast) {
            const slotKey    = `${stage.key}-1`
            const pool       = availableFor(si, 1)
            const selectedId = predictions[`${stage.key}:${slotKey}`] ?? ''
            const sfTeam1    = teamMap.get(predictions['semifinal:semifinal-1'] ?? '')
            const sfTeam2    = teamMap.get(predictions['semifinal:semifinal-2'] ?? '')

            return (
              <div key={stage.key}>
                <div className={`rounded-t-2xl px-4 py-3 flex items-center justify-between ${stage.headerCls}`}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 shrink-0" />
                    <span className="font-bold">{stage.label}</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">{stage.points} pts</span>
                  </div>
                  <span className="text-[12px] font-semibold">{filled === 1 ? '✓ Elegido' : 'Sin elegir'}</span>
                </div>

                <div className={`rounded-b-2xl border border-t-0 p-6 text-center shadow-sm ${champion ? 'bg-gradient-to-b from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20' : 'bg-card'}`}>
                  <Trophy className={`mx-auto mb-2 h-10 w-10 ${champion ? 'text-yellow-500' : 'text-muted-foreground/30'}`} />
                  <p className={`mb-1 font-bebas text-lg tracking-widest ${champion ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                    ¿Quién será el Campeón del Mundo?
                  </p>
                  {(sfTeam1 || sfTeam2) && (
                    <p className="mb-4 text-xs text-muted-foreground">
                      Ganador de Semifinal Llave 1 vs Ganador de Semifinal Llave 2
                    </p>
                  )}

                  {isLocked ? (
                    champion
                      ? <div className="flex flex-col items-center gap-2">
                          <TeamFlag code={champion.flag_emoji} label={champion.name_es} className="h-10 w-14" />
                          <p className="text-xl font-extrabold">{champion.name_es}</p>
                          <p className="text-sm text-muted-foreground">15 pts si acertás</p>
                          <div className="mt-1 flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                            <Lock className="h-3 w-3" /> Bloqueado
                          </div>
                        </div>
                      : <p className="text-sm text-muted-foreground italic">No elegiste campeón</p>
                  ) : (
                    <div className="mx-auto max-w-xs space-y-3">
                      {/* Show the 2 finalists visually */}
                      {(sfTeam1 || sfTeam2) && (
                        <div className="flex items-center justify-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
                          {sfTeam1 ? (
                            <div className="flex flex-col items-center gap-1">
                              <TeamFlag code={sfTeam1.flag_emoji} label={sfTeam1.name_es} className="h-6 w-8" />
                              <span className="text-[11px] font-semibold">{sfTeam1.name_es}</span>
                            </div>
                          ) : <span className="text-sm text-muted-foreground">?</span>}
                          <span className="text-xs font-bold text-muted-foreground">vs</span>
                          {sfTeam2 ? (
                            <div className="flex flex-col items-center gap-1">
                              <TeamFlag code={sfTeam2.flag_emoji} label={sfTeam2.name_es} className="h-6 w-8" />
                              <span className="text-[11px] font-semibold">{sfTeam2.name_es}</span>
                            </div>
                          ) : <span className="text-sm text-muted-foreground">?</span>}
                        </div>
                      )}
                      <select
                        value={selectedId}
                        onChange={e => handleSelect(stage.key, slotKey, e.target.value)}
                        disabled={pool.length === 0}
                        className="h-12 w-full rounded-xl border-2 border-yellow-400 bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400/40 disabled:opacity-40"
                      >
                        <option value="">{pool.length === 0 ? '← Completá las Semis primero' : '🏆 Elegir campeón...'}</option>
                        {pool.map(t => <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>)}
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

          /* ── Other stages: match cards (pairs of slots) ── */
          // Each match card M has LEFT=slot(2M−1) and RIGHT=slot(2M)
          const matchCards = Array.from({ length: stage.slots / 2 }, (_, m) => ({
            cardNum:      m + 1,
            leftSlotIdx:  2 * (m + 1) - 1,   // 1-based
            rightSlotIdx: 2 * (m + 1),
            leftSlotKey:  `${stage.key}-${2 * (m + 1) - 1}`,
            rightSlotKey: `${stage.key}-${2 * (m + 1)}`,
          }))

          return (
            <div key={stage.key}>
              {/* Stage header */}
              <div className={`rounded-t-2xl px-4 py-3 flex items-center justify-between ${stage.headerCls}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-wide">{stage.label}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-semibold">{stage.points} pts c/u</span>
                </div>
                <span className={`flex items-center gap-1.5 text-[12px] font-semibold`}>
                  <span className={`rounded-full px-2 py-0.5 ${filled === stage.slots ? 'bg-white/30' : 'bg-white/10'}`}>{filled}/{stage.slots}</span>
                  {filled === stage.slots && <CheckCircle2 className="h-4 w-4" />}
                </span>
              </div>

              {/* Incomplete previous stage hint */}
              {si > 0 && availableFor(si, 1).length === 0 && (
                <div className="border-x border-b bg-amber-50 dark:bg-amber-950/20 px-4 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  ← Completá la {STAGES[si - 1].label} para habilitar esta sección
                </div>
              )}

              {/* Match cards grid */}
              <div className="rounded-b-2xl border border-t-0 bg-muted/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  {matchCards.map(({ cardNum, leftSlotIdx, rightSlotIdx, leftSlotKey, rightSlotKey }) => {
                    const leftId  = predictions[`${stage.key}:${leftSlotKey}`]  ?? ''
                    const rightId = predictions[`${stage.key}:${rightSlotKey}`] ?? ''
                    const bothDone = !!leftId && !!rightId

                    // Advance label: winner of this card → next stage llave cardNum
                    const advanceLabel = nextStage ? `Ganador → ${nextStage.short} Llave ${cardNum}` : ''

                    // Group label shown in R32 card headers
                    const groupLabel = si === 0
                      ? (R32_GROUPS[cardNum] ? `Grupos ${R32_GROUPS[cardNum]!.join(' · ')}` : 'Mejores 3ros')
                      : null

                    return (
                      <div
                        key={`${leftSlotKey}-${rightSlotKey}`}
                        className={`rounded-2xl border bg-card shadow-sm transition-all ${bothDone ? 'ring-1 ring-emerald-400 dark:ring-emerald-700' : ''}`}
                      >
                        {/* Card header */}
                        <div className="flex items-center justify-between rounded-t-2xl border-b bg-muted/30 px-4 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                              Llave {cardNum}
                            </span>
                            {groupLabel && (
                              <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                {groupLabel}
                              </span>
                            )}
                          </div>
                          {bothDone
                            ? <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Completa</span>
                            : <span className="text-[10px] text-muted-foreground">{[leftId, rightId].filter(Boolean).length}/2 elegidos</span>
                          }
                        </div>

                        {/* Two team pickers + VS */}
                        <div className="flex items-start gap-2 px-4 py-4">
                          <TeamPicker stageKey={stage.key} slotKey={leftSlotKey}  slotIndex={leftSlotIdx}  stageIndex={si} side="left"  />
                          <div className="mt-4 flex shrink-0 flex-col items-center gap-0.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted bg-card text-[11px] font-extrabold text-muted-foreground">VS</div>
                          </div>
                          <TeamPicker stageKey={stage.key} slotKey={rightSlotKey} slotIndex={rightSlotIdx} stageIndex={si} side="right" />
                        </div>

                        {/* Advance indicator */}
                        {advanceLabel && (
                          <div className={`flex items-center justify-center gap-1.5 rounded-b-2xl border-t px-4 py-2 text-[10px] font-semibold ${bothDone ? `${stage.accentCls} bg-muted/20` : 'text-muted-foreground/50 bg-muted/10'}`}>
                            <ChevronDown className="h-3 w-3" />
                            {advanceLabel}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Points guide ── */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-brand-gold" />
          <h2 className="text-sm font-semibold">¿Cómo se puntúa?</h2>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {STAGES.map(s => (
            <div key={s.key} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
              <div className={`text-2xl font-extrabold ${s.accentCls}`}>{s.points}</div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Cada equipo que acertás que avanza a esa ronda suma los puntos indicados. El campeón vale <span className="font-bold text-yellow-600">15 pts</span>.
        </p>
      </div>

    </div>
  )
}
