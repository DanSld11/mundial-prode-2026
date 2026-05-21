'use client'

import { useEffect, useState } from 'react'
import { Swords, Trophy, Lock, Save, AlertTriangle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TeamFlag } from '@/components/team-flag'
import { toast } from 'sonner'
import { getAccessToken, createAnonClient, createAuthedClient, getCurrentUserId } from '@/lib/auth-client'

interface Team {
  id: string
  name_es: string
  flag_emoji: string
  code: string
}

const STAGES = [
  { key: 'round_of_32',  label: 'Ronda de 32',   short: 'R32', slots: 16, points: 2 },
  { key: 'round_of_16',  label: 'Octavos',        short: 'R16', slots: 8,  points: 3 },
  { key: 'quarterfinal', label: 'Cuartos',         short: 'QF',  slots: 4,  points: 5 },
  { key: 'semifinal',    label: 'Semifinales',     short: 'SF',  slots: 2,  points: 8 },
  { key: 'final',        label: 'Final',           short: 'F',   slots: 1,  points: 15 },
]

function SlotCard({
  label,
  selectedTeam,
  availableTeams,
  onSelect,
  locked,
  isChampion,
}: {
  label: string
  selectedTeam: Team | undefined
  availableTeams: Team[]
  onSelect: (teamId: string) => void
  locked: boolean
  isChampion?: boolean
}) {
  return (
    <div className={`relative rounded-xl border bg-card p-2 shadow-sm transition-all ${isChampion ? 'ring-2 ring-brand-gold' : ''}`}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {locked ? (
        <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${selectedTeam ? 'bg-muted/40' : 'bg-muted/20'}`}>
          {selectedTeam ? (
            <>
              <TeamFlag code={selectedTeam.flag_emoji} label={selectedTeam.name_es} />
              <span className="flex-1 truncate text-xs font-semibold">{selectedTeam.name_es}</span>
              {isChampion && <Trophy className="h-4 w-4 text-brand-gold shrink-0" />}
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
            className="h-9 w-full rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-red/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {availableTeams.length === 0 ? 'Primero elegí ronda anterior' : 'Elegir equipo...'}
            </option>
            {availableTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag_emoji} {t.name_es}
              </option>
            ))}
          </select>
          {selectedTeam && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <TeamFlag code={selectedTeam.flag_emoji} label={selectedTeam.name_es} />
              <span className="truncate text-[10px] font-semibold text-muted-foreground">{selectedTeam.name_es}</span>
              {isChampion && <Trophy className="h-3 w-3 text-brand-gold shrink-0" />}
            </div>
          )}
        </>
      )}
    </div>
  )
}

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
              if (pred.stage === 'meta' && pred.slot_key === 'locked') {
                locked = true
                continue
              }
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

  /** Returns teams available for a given stage (cascaded from previous stage) */
  function getAvailableTeams(stageIndex: number): Team[] {
    if (stageIndex === 0) return teams
    const prevStage = STAGES[stageIndex - 1]
    const slotKeys = Array.from({ length: prevStage.slots }, (_, i) => `${prevStage.key}-${i + 1}`)
    const selectedIds = slotKeys
      .map((sk) => predictions[`${prevStage.key}:${sk}`])
      .filter(Boolean)
    const uniqueIds = Array.from(new Set(selectedIds))
    return uniqueIds.map((id) => teamMap.get(id)).filter((t): t is Team => !!t)
  }

  async function handleSelect(stage: string, slotKey: string, teamId: string) {
    if (isLocked) return
    if (!token || !userId) { toast.error('Iniciá sesión para guardar.'); return }

    const key = `${stage}:${slotKey}`
    const oldTeamId = predictions[key]

    // Build new predictions with cascade clearing
    const newPredictions = { ...predictions, [key]: teamId }
    const toUpsert: { stage: string; slot_key: string; team_id: string | null }[] = [
      { stage, slot_key: slotKey, team_id: teamId || null },
    ]

    // If old team changed, cascade-clear downstream slots that used it
    if (oldTeamId && oldTeamId !== teamId) {
      const stageIdx = STAGES.findIndex((s) => s.key === stage)
      for (let i = stageIdx + 1; i < STAGES.length; i++) {
        const nextStage = STAGES[i]
        const nextSlotKeys = Array.from({ length: nextStage.slots }, (_, j) => `${nextStage.key}-${j + 1}`)
        for (const sk of nextSlotKeys) {
          const k = `${nextStage.key}:${sk}`
          if (newPredictions[k] === oldTeamId) {
            newPredictions[k] = ''
            toUpsert.push({ stage: nextStage.key, slot_key: sk, team_id: null })
          }
        }
      }
    }

    setPredictions(newPredictions)
    setIsSaving(true)
    const authed = createAuthedClient(token)
    const { error } = await authed.from('bracket_predictions').upsert(
      toUpsert.map((r) => ({ user_id: userId, stage: r.stage, slot_key: r.slot_key, team_id: r.team_id })),
      { onConflict: 'user_id, stage, slot_key' }
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
      { onConflict: 'user_id, stage, slot_key' }
    )
    setIsSaving(false)
    if (error) {
      toast.error(error.message)
    } else {
      setIsLocked(true)
      setConfirmLock(false)
      toast.success('¡Cuadro eliminatorio guardado y bloqueado!')
    }
  }

  const totalSlots = STAGES.reduce((s, st) => s + st.slots, 0)
  const filledSlots = Object.values(predictions).filter(Boolean).length
  const completePct = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0

  if (loading) return (
    <div className="space-y-5">
      <div className="h-24 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )

  const champion = teamMap.get(predictions['final:final-1'] ?? '')

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Cuadro Eliminatorio</h1>
              <p className="text-sm text-muted-foreground">
                {isLocked
                  ? '🔒 Tu predicción está confirmada y bloqueada'
                  : 'Predecí el camino hasta el campeón · Cada ronda suma puntos'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <div className="text-2xl font-extrabold tabular-nums text-brand-red">{filledSlots}/{totalSlots}</div>
            <div className="text-xs text-muted-foreground">predicciones</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1">
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-red transition-all duration-500"
              style={{ width: `${completePct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{completePct}% completado</span>
            {isLocked && (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Lock className="h-2.5 w-2.5" /> Bloqueado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save / Lock section */}
      {!isLocked && (
        <div className={`rounded-xl border p-4 shadow-sm ${confirmLock ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'bg-card'}`}>
          {!confirmLock ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold">¿Listo para confirmar tu cuadro?</p>
                <p className="text-xs text-muted-foreground">Una vez guardado, no podrás modificar tus predicciones.</p>
              </div>
              <button
                onClick={() => setConfirmLock(true)}
                disabled={isSaving || filledSlots === 0}
                className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-red/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                Guardar y bloquear
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-400">¿Confirmar bloqueo?</p>
                  <p className="text-xs text-amber-700 dark:text-amber-500">Esta acción es irreversible. Tu cuadro quedará fijo y no podrás cambiarlo.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmLock(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLockConfirmed}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-amber-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isSaving ? 'Guardando...' : 'Sí, confirmar'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Points guide */}
      <div className="flex flex-wrap gap-2 text-xs">
        {STAGES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 shadow-sm">
            <span className="font-bold text-brand-red">{s.short}</span>
            <span className="text-muted-foreground">{s.label}</span>
            <Badge variant="secondary" className="ml-0.5 text-[10px]">{s.points} pts</Badge>
          </div>
        ))}
      </div>

      {/* Cascading note */}
      {!isLocked && (
        <div className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Selección en cascada:</strong> Cada ronda solo muestra los equipos que elegiste en la ronda anterior.
            Empezá por la <strong>Ronda de 32</strong> y avanzá hasta el campeón.
          </span>
        </div>
      )}

      {/* Bracket grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-2 items-start">
          {STAGES.map((stage, stageIdx) => {
            const slotKeys = Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
            const availableForStage = getAvailableTeams(stageIdx)

            return (
              <div key={stage.key} className="flex flex-col gap-2" style={{ width: '180px' }}>
                {/* Stage header */}
                <div className={`rounded-lg px-3 py-2 text-center text-xs font-bold uppercase tracking-wider ${
                  stage.key === 'final'
                    ? 'bg-brand-gold text-white'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stage.label}
                  <span className="ml-1 font-normal opacity-70">· {stage.points}pts</span>
                </div>

                {/* Availability hint */}
                {stageIdx > 0 && !isLocked && (
                  <div className="text-center text-[10px] text-muted-foreground">
                    {availableForStage.length} equipo{availableForStage.length !== 1 ? 's' : ''} disponible{availableForStage.length !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Slots */}
                <div className="flex flex-1 flex-col gap-2">
                  {slotKeys.map((slotKey, slotIdx) => {
                    const key = `${stage.key}:${slotKey}`
                    const selectedId = predictions[key] ?? ''
                    const selectedTeam = teamMap.get(selectedId)
                    const isChampion = stage.key === 'final' && slotIdx === 0

                    const slotLabel =
                      isChampion ? '🏆 Campeón'
                      : stage.key === 'final' ? 'Final'
                      : `${stage.short} ${slotIdx + 1}`

                    return (
                      <SlotCard
                        key={slotKey}
                        label={slotLabel}
                        selectedTeam={selectedTeam}
                        availableTeams={availableForStage}
                        onSelect={(teamId) => handleSelect(stage.key, slotKey, teamId)}
                        locked={isLocked}
                        isChampion={isChampion}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Champion callout */}
          <div className="flex flex-col justify-center self-center" style={{ width: '100px', marginLeft: '4px' }}>
            <div className={`rounded-xl border-2 p-3 text-center transition-all ${
              champion ? 'border-brand-gold bg-brand-gold/10' : 'border-muted bg-muted/20'
            }`}>
              <Trophy className={`mx-auto mb-2 h-8 w-8 ${champion ? 'text-brand-gold' : 'text-muted-foreground/30'}`} />
              <p className={`text-xs font-extrabold uppercase tracking-wide ${champion ? 'text-brand-gold' : 'text-muted-foreground'}`}>
                Campeón
              </p>
              {champion ? (
                <div className="mt-2 flex flex-col items-center gap-1">
                  <TeamFlag code={champion.flag_emoji} label={champion.name_es} className="h-5 w-7" />
                  <span className="text-center text-[10px] font-semibold leading-tight">{champion.name_es}</span>
                </div>
              ) : (
                <p className="mt-2 text-[10px] text-muted-foreground">Sin elegir</p>
              )}
              {isLocked && <Lock className="mx-auto mt-2 h-3.5 w-3.5 text-muted-foreground/40" />}
            </div>
          </div>
        </div>
      </div>

      {/* Points breakdown */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">¿Cómo se puntúa el cuadro?</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s.key} className="rounded-lg bg-muted/40 px-3 py-2.5 text-center">
              <div className="text-2xl font-extrabold text-brand-red">{s.points}</div>
              <div className="text-xs text-muted-foreground">pts · {s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Cada equipo que acertás que avanza a esa ronda suma los puntos indicados. El campeón vale{' '}
          <span className="font-bold text-brand-gold">15 pts</span>.
        </p>
      </div>
    </div>
  )
}
