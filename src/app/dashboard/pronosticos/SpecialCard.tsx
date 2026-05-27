'use client'

import { useState } from 'react'
import { Loader2, Check, Lock } from 'lucide-react'
import { saveSpecialPredictionAction } from './actions'
import { toast } from 'sonner'
import { TeamFlag } from '@/components/team-flag'

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
    <div className={`rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group ${locked ? 'opacity-80' : ''}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-brand-red/10"></div>
      
      <div className="relative z-10 px-5 py-4 border-b border-border/50 bg-gradient-to-r from-muted/50 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-background/50 border border-border/50 text-2xl shadow-sm">
            {config.emoji}
          </span>
          <div>
            <p className="font-extrabold text-sm uppercase tracking-wide">{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        {locked && (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-800">
            <Lock className="h-3 w-3" /> Cerrado
          </span>
        )}
      </div>

      <div className="relative z-10 px-5 py-5 space-y-4">
        {locked ? (
          /* Read-only view */
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Tu predicción</p>
              {config.pickPlayer ? (
                chosenPlayer ? (
                  <div className="flex items-center gap-2">
                    <TeamFlag code={teams.find(t => t.id === (prediction?.team_id ?? teamId))?.flag_emoji ?? ''} label="" className="h-5 w-7 shrink-0" />
                    <p className="font-bold text-base">{chosenPlayer.name}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-background/50 px-3 py-2 rounded-lg border border-border/50">No seleccionaste</p>
                )
              ) : (
                prediction?.team_id ? (
                  <div className="flex items-center gap-2">
                    <TeamFlag code={chosenTeam?.flag_emoji ?? ''} label={chosenTeam?.name_es} className="h-5 w-7 shrink-0" />
                    <p className="font-bold text-base">{chosenTeam?.name_es}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic bg-background/50 px-3 py-2 rounded-lg border border-border/50">No seleccionaste</p>
                )
              )}
            </div>
            
            {resultPlayer && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Resultado oficial</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <Check className="h-4 w-4" /> {resultPlayer.name}
                </p>
              </div>
            )}
            
            {prediction?.points_earned != null && (
              <div className="mt-2 inline-flex items-center gap-1 text-xs font-black text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700/50 px-3 py-1 rounded-md shadow-sm">
                +{prediction.points_earned} pts
              </div>
            )}
          </div>
        ) : (
          /* Edit view */
          <>
            {config.pickPlayer && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Selección</label>
                <div className="relative">
                  {teamId && (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <TeamFlag code={teams.find(t => t.id === teamId)?.flag_emoji ?? ''} label="" className="h-4 w-6" />
                    </div>
                  )}
                  <select
                    value={teamId}
                    onChange={e => handleTeamChange(e.target.value)}
                    className={`w-full h-11 rounded-xl border border-border/50 bg-background/80 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all hover:bg-background cursor-pointer appearance-none shadow-sm ${teamId ? 'pl-11 pr-8' : 'px-3'}`}
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    <option value="">— Elegir selección —</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name_es}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {config.pickPlayer ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                  <span>{config.playerFilter === 'GK' ? 'Portero' : 'Jugador'}</span>
                  {teamId && <span className="bg-muted px-2 py-0.5 rounded text-[10px]">{teamPlayers.length} opciones</span>}
                </label>
                <select
                  value={playerId}
                  disabled={!teamId}
                  onChange={e => handlePlayerChange(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border/50 bg-background/80 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red disabled:opacity-50 transition-all hover:bg-background cursor-pointer appearance-none shadow-sm"
                  style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                >
                  <option value="">— Elegir jugador —</option>
                  {teamPlayers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Equipo</label>
                <div className="relative">
                  {teamId && (
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <TeamFlag code={teams.find(t => t.id === teamId)?.flag_emoji ?? ''} label="" className="h-4 w-6" />
                    </div>
                  )}
                  <select
                    value={teamId}
                    onChange={e => handleTeamChange(e.target.value)}
                    className={`w-full h-11 rounded-xl border border-border/50 bg-background/80 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-red transition-all hover:bg-background cursor-pointer appearance-none shadow-sm ${teamId ? 'pl-11 pr-8' : 'px-3'}`}
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    <option value="">— Elegir equipo —</option>
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>{t.name_es}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-2 rounded-lg border border-border/50 w-fit">
              {saving ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin text-brand-red" /> Guardando...</>
              ) : (config.pickPlayer ? playerId : teamId) ? (
                <><Check className="h-4 w-4 text-emerald-500" /> Guardado</>
              ) : (
                <span className="text-muted-foreground/50">Pendiente</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function SpecialCards({ teams, players, predictions, results }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
