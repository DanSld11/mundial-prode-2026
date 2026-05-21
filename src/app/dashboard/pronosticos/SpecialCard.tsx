'use client'

import { useState } from 'react'
import { Loader2, Check, Lock } from 'lucide-react'
import { saveSpecialPredictionAction } from './actions'
import { toast } from 'sonner'

interface Team {
  id: string
  name_es: string
  flag_emoji: string
  code: string
  group_name: string
}

interface Player {
  id: string
  name: string
  team_id: string
  position: string
}

interface SpecialPred {
  type: string
  player_id: string | null
  team_id: string | null
  points_earned: number | null
}

interface SpecialResult {
  type: string
  player_id: string | null
  locked: boolean
}

interface CardConfig {
  type: string
  label: string
  emoji: string
  description: string
  pickPlayer: boolean   // true = pick player, false = pick team
  playerFilter?: string // filter by position if pickPlayer
}

const CARDS: CardConfig[] = [
  {
    type: 'top_scorer',
    label: 'Bota de Oro',
    emoji: '👟',
    description: 'Máximo goleador del torneo',
    pickPlayer: true,
    playerFilter: undefined, // any position
  },
  {
    type: 'best_goalkeeper',
    label: 'Mejor Portero',
    emoji: '🧤',
    description: 'Mejor guardameta del torneo',
    pickPlayer: true,
    playerFilter: 'GK',
  },
  {
    type: 'best_player',
    label: 'Mejor Jugador',
    emoji: '🏆',
    description: 'Balón de Oro del torneo',
    pickPlayer: true,
    playerFilter: undefined,
  },
  {
    type: 'champion',
    label: 'Campeón',
    emoji: '🌍',
    description: 'Equipo campeón del Mundial 2026',
    pickPlayer: false,
  },
  {
    type: 'runner_up',
    label: 'Subcampeón',
    emoji: '🥈',
    description: 'Equipo finalista del Mundial 2026',
    pickPlayer: false,
  },
]

interface Props {
  teams: Team[]
  players: Player[]
  predictions: SpecialPred[]
  results: SpecialResult[]
}

function SingleSpecialCard({
  config,
  teams,
  players,
  prediction,
  result,
}: {
  config: CardConfig
  teams: Team[]
  players: Player[]
  prediction?: SpecialPred
  result?: SpecialResult
}) {
  const locked = result?.locked ?? false

  const [teamId, setTeamId]   = useState<string>(prediction?.team_id   ?? '')
  const [playerId, setPlayerId] = useState<string>(prediction?.player_id ?? '')
  const [saving, setSaving]   = useState(false)

  // Filtered players
  const filteredPlayers = config.playerFilter
    ? players.filter(p => p.position === config.playerFilter)
    : players

  // Players by selected team (for player cards, user first picks team then player)
  const teamPlayers = teamId
    ? filteredPlayers.filter(p => p.team_id === teamId)
    : []

  async function save(newTeamId: string, newPlayerId: string) {
    setSaving(true)
    const res = await saveSpecialPredictionAction(
      config.type,
      config.pickPlayer ? (newPlayerId || null) : null,
      !config.pickPlayer ? (newTeamId || null) : (newTeamId || null),
    )
    setSaving(false)
    if (res?.error) toast.error(res.error)
  }

  async function handleTeamChange(val: string) {
    setTeamId(val)
    setPlayerId('')
    if (!config.pickPlayer) {
      await save(val, '')
    }
  }

  async function handlePlayerChange(val: string) {
    setPlayerId(val)
    await save(teamId, val)
  }

  const chosenTeam   = teams.find(t => t.id === (config.pickPlayer ? teamId : (prediction?.team_id ?? teamId)))
  const chosenPlayer = players.find(p => p.id === playerId)

  // What result was set by admin
  const resultPlayer = result?.player_id ? players.find(p => p.id === result.player_id) : null

  return (
    <div className={`rounded-2xl border bg-card shadow-sm overflow-hidden ${locked ? 'opacity-80' : ''}`}>
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.emoji}</span>
          <div>
            <p className="font-semibold text-sm">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {locked && (
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-full">
            <Lock className="h-3 w-3" /> Cerrado
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-3">
        {locked ? (
          /* Read-only view */
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tu predicción</p>
            {config.pickPlayer ? (
              chosenPlayer
                ? <p className="font-semibold">{chosenPlayer.name} {teams.find(t => t.id === (prediction?.team_id ?? teamId))?.flag_emoji}</p>
                : <p className="text-sm text-muted-foreground italic">No seleccionaste</p>
            ) : (
              prediction?.team_id
                ? <p className="font-semibold">{chosenTeam?.flag_emoji} {chosenTeam?.name_es}</p>
                : <p className="text-sm text-muted-foreground italic">No seleccionaste</p>
            )}
            {resultPlayer && (
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Resultado oficial</p>
                <p className="font-semibold text-emerald-600">{resultPlayer.name}</p>
              </div>
            )}
            {prediction?.points_earned != null && (
              <div className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                +{prediction.points_earned} pts
              </div>
            )}
          </div>
        ) : (
          /* Edit view */
          <>
            {config.pickPlayer && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Selección</label>
                <select
                  value={teamId}
                  onChange={e => handleTeamChange(e.target.value)}
                  className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  <option value="">— Elegir selección —</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
                  ))}
                </select>
              </div>
            )}

            {config.pickPlayer ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  {config.playerFilter === 'GK' ? 'Portero' : 'Jugador'}
                  {teamId && ` (${teamPlayers.length} disponibles)`}
                </label>
                <select
                  value={playerId}
                  disabled={!teamId}
                  onChange={e => handlePlayerChange(e.target.value)}
                  className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50"
                >
                  <option value="">— Elegir jugador —</option>
                  {teamPlayers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Equipo</label>
                <select
                  value={teamId}
                  onChange={e => handleTeamChange(e.target.value)}
                  className="w-full h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
                >
                  <option value="">— Elegir equipo —</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {saving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...</>
              ) : (config.pickPlayer ? playerId : teamId) ? (
                <><Check className="h-3.5 w-3.5 text-emerald-500" /> Guardado</>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SpecialCards({ teams, players, predictions, results }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CARDS.map(cfg => (
        <SingleSpecialCard
          key={cfg.type}
          config={cfg}
          teams={teams}
          players={players}
          prediction={predictions.find(p => p.type === cfg.type)}
          result={results.find(r => r.type === cfg.type)}
        />
      ))}
    </div>
  )
}
