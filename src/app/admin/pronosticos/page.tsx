'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, Check, CheckCircle2, Lock, Trophy, Users } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAdminPronosticosData,
  saveGroupResultAction,
  saveSpecialResultAction,
  scoreGroupPredictionsAction,
  scoreSpecialPredictionAction,
} from './actions'

const SPECIAL_TYPES = [
  { type: 'top_scorer',      label: 'Bota de Oro',     emoji: '👟', pickPlayer: true,  playerFilter: undefined },
  { type: 'best_goalkeeper', label: 'Mejor Portero',   emoji: '🧤', pickPlayer: true,  playerFilter: 'GK' },
  { type: 'best_player',     label: 'Mejor Jugador',   emoji: '🏆', pickPlayer: true,  playerFilter: undefined },
  { type: 'champion',        label: 'Campeón',         emoji: '🌍', pickPlayer: false, playerFilter: undefined },
  { type: 'runner_up',       label: 'Subcampeón',      emoji: '🥈', pickPlayer: false, playerFilter: undefined },
]

export default function AdminPronosticosPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [, startTransition] = useTransition()

  async function reload() {
    const d = await getAdminPronosticosData()
    setData(d)
  }

  useEffect(() => { reload().finally(() => setLoading(false)) }, [])

  if (loading) return (
    <div className="space-y-4">{[1,2,3].map(i =>
      <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/50" />
    )}</div>
  )

  const { teams, groupResults, specialResults, players, scoredGroups, scoredSpecials } = data

  // Build group map
  const groupMap: Record<string, any[]> = {}
  for (const t of teams) {
    if (!t.group_name) continue
    if (!groupMap[t.group_name]) groupMap[t.group_name] = []
    groupMap[t.group_name].push(t)
  }
  const groupNames = Object.keys(groupMap).sort()

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold">Pronósticos — Admin</h2>
        <p className="text-sm text-muted-foreground">Cargá resultados oficiales y puntúa predicciones de usuarios.</p>
      </div>

      {/* ── GROUP RESULTS ── */}
      <section>
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Users className="h-4 w-4" /> Resultados de Grupos
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {groupNames.map(gName => (
            <AdminGroupCard
              key={gName}
              groupName={gName}
              teams={groupMap[gName]}
              results={groupResults.filter((r: any) => r.group_name === gName)}
              isScored={scoredGroups.includes(gName)}
              onSave={async (pos, teamId) => {
                const res = await saveGroupResultAction(gName, pos, teamId)
                if (res.error) toast.error(res.error)
                else { toast.success('Resultado guardado'); reload() }
              }}
              onScore={async () => {
                const res = await scoreGroupPredictionsAction(gName)
                if (res.error) toast.error(res.error)
                else { toast.success(`${res.count} predicciones puntuadas`); reload() }
              }}
            />
          ))}
        </div>
      </section>

      {/* ── SPECIAL RESULTS ── */}
      <section>
        <h3 className="font-semibold text-base mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4" /> Premios Especiales
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPECIAL_TYPES.map(cfg => {
            const result = specialResults.find((r: any) => r.type === cfg.type)
            return (
              <AdminSpecialCard
                key={cfg.type}
                config={cfg}
                teams={teams}
                players={players}
                result={result}
                isScored={scoredSpecials.includes(cfg.type)}
                onSave={async (playerId, teamId, locked) => {
                  const res = await saveSpecialResultAction(cfg.type, playerId, teamId, locked)
                  if (res.error) toast.error(res.error)
                  else { toast.success('Resultado guardado'); reload() }
                }}
                onScore={async () => {
                  const res = await scoreSpecialPredictionAction(cfg.type)
                  if (res.error) toast.error(res.error)
                  else { toast.success(`${res.count} predicciones puntuadas`); reload() }
                }}
              />
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ── Admin Group Card ── */
function AdminGroupCard({
  groupName, teams, results, isScored, onSave, onScore,
}: {
  groupName: string
  teams: any[]
  results: any[]
  isScored: boolean
  onSave: (pos: number, teamId: string | null) => Promise<void>
  onScore: () => Promise<void>
}) {
  const resultMap: Record<number, string> = {}
  for (const r of results) resultMap[r.position] = r.team_id

  const [sel, setSel] = useState<Record<number, string>>(resultMap)
  const [saving, setSaving] = useState<number | null>(null)
  const [scoring, setScoring] = useState(false)

  const LABELS: Record<number, string> = { 1: '1°', 2: '2°', 3: '3°' }

  return (
    <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${isScored ? 'border-emerald-300 dark:border-emerald-800' : ''}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isScored ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-muted/30'}`}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-muted-foreground uppercase">Grupo {groupName}</span>
          {isScored && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Puntuado
            </span>
          )}
        </div>
        {isScored ? (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ya puntuado</span>
        ) : (
          <button
            onClick={async () => { setScoring(true); await onScore(); setScoring(false) }}
            disabled={scoring || Object.keys(sel).length === 0}
            className="flex items-center gap-1 text-xs font-bold bg-brand-red text-white px-2.5 py-1 rounded-lg hover:opacity-90 disabled:opacity-40 transition"
          >
            {scoring ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Puntuar
          </button>
        )}
      </div>
      <div className="divide-y">
        {[1, 2, 3].map(pos => (
          <div key={pos} className="flex items-center gap-3 px-4 py-2.5">
            <span className="w-6 text-xs font-bold text-muted-foreground shrink-0">{LABELS[pos]}</span>
            <select
              value={sel[pos] ?? ''}
              onChange={async e => {
                const val = e.target.value
                setSel(s => ({ ...s, [pos]: val }))
                setSaving(pos)
                await onSave(pos, val || null)
                setSaving(null)
              }}
              className="flex-1 h-8 rounded-lg border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— Equipo —</option>
              {teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
              ))}
            </select>
            {saving === pos && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Admin Special Card ── */
function AdminSpecialCard({
  config, teams, players, result, isScored, onSave, onScore,
}: {
  config: any
  teams: any[]
  players: any[]
  result?: any
  isScored: boolean
  onSave: (playerId: string | null, teamId: string | null, locked: boolean) => Promise<void>
  onScore: () => Promise<void>
}) {
  const [teamId, setTeamId]   = useState<string>(result?.team_id   ?? '')
  const [playerId, setPlayerId] = useState<string>(result?.player_id ?? '')
  const [locked, setLocked]   = useState<boolean>(result?.locked   ?? false)
  const [saving, setSaving]   = useState(false)
  const [scoring, setScoring] = useState(false)

  const filteredPlayers = config.playerFilter
    ? players.filter((p: any) => p.position === config.playerFilter)
    : players
  const teamPlayers = teamId
    ? filteredPlayers.filter((p: any) => p.team_id === teamId)
    : []

  async function save(pId: string, tId: string, lk: boolean) {
    setSaving(true)
    await onSave(
      config.pickPlayer ? (pId || null) : null,
      tId || null,
      lk,
    )
    setSaving(false)
  }

  return (
    <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${isScored ? 'border-emerald-300 dark:border-emerald-800' : ''}`}>
      <div className={`px-4 py-3 border-b flex items-center justify-between ${isScored ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-muted/30'}`}>
        <div className="flex items-center gap-2">
          <span>{config.emoji}</span>
          <span className="font-semibold text-sm">{config.label}</span>
          {isScored && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Puntuado
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isScored ? (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Ya puntuado</span>
          ) : (
            <button
              onClick={async () => { setScoring(true); await onScore(); setScoring(false) }}
              disabled={scoring || (!playerId && !teamId)}
              className="flex items-center gap-1 text-xs font-bold bg-brand-red text-white px-2.5 py-1 rounded-lg hover:opacity-90 disabled:opacity-40 transition"
            >
              {scoring ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Puntuar
            </button>
          )}
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        {/* Team picker (always for player types to filter) */}
        {config.pickPlayer && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Selección</label>
            <select
              value={teamId}
              onChange={e => { setTeamId(e.target.value); setPlayerId('') }}
              className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— Selección —</option>
              {teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
              ))}
            </select>
          </div>
        )}

        {config.pickPlayer ? (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Jugador</label>
            <select
              value={playerId}
              disabled={!teamId}
              onChange={e => { const v = e.target.value; setPlayerId(v); save(v, teamId, locked) }}
              className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50"
            >
              <option value="">— Jugador —</option>
              {teamPlayers.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Equipo</label>
            <select
              value={teamId}
              onChange={e => { const v = e.target.value; setTeamId(v); save(playerId, v, locked) }}
              className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
            >
              <option value="">— Equipo —</option>
              {teams.map((t: any) => (
                <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
              ))}
            </select>
          </div>
        )}

        {/* Lock toggle */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={locked}
              onChange={e => { const v = e.target.checked; setLocked(v); save(playerId, teamId, v) }}
              className="h-4 w-4 rounded accent-brand-red"
            />
            <span className="flex items-center gap-1 text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Cerrar predicciones
            </span>
          </label>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      </div>
    </div>
  )
}
