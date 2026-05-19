'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { saveBracketPredictionAction } from './actions'
import { Swords, Trophy, Medal } from 'lucide-react'
import { TeamFlag } from '@/components/team-flag'

interface Team {
  id: string
  name_es: string
  flag_emoji: string
  code: string
}

interface BracketPrediction {
  stage: string
  slot_key: string
  team_id: string | null
  team?: Team | null
}

interface BracketPageClientProps {
  teams: Team[]
  predictions: BracketPrediction[]
}

const STAGES = [
  { key: 'round_of_32', label: 'Ronda de 32', slots: 16, points: 2 },
  { key: 'round_of_16', label: 'Octavos de Final', slots: 8, points: 3 },
  { key: 'quarterfinal', label: 'Cuartos de Final', slots: 4, points: 5 },
  { key: 'semifinal', label: 'Semifinales', slots: 2, points: 8 },
  { key: 'third_place', label: 'Tercer Puesto', slots: 1, points: 6 },
  { key: 'final', label: 'Final', slots: 2, points: 15 },
]

const SLOT_NAMES: Record<string, string[]> = {
  round_of_32: Array.from({ length: 16 }, (_, i) => `32-${i + 1}`),
  round_of_16: Array.from({ length: 8 }, (_, i) => `16-${i + 1}`),
  quarterfinal: Array.from({ length: 4 }, (_, i) => `QF-${i + 1}`),
  semifinal: Array.from({ length: 2 }, (_, i) => `SF-${i + 1}`),
  third_place: ['3P'],
  final: ['CHAMPION', 'RUNNER_UP'],
}

export default function BracketPageClient({ teams, predictions }: BracketPageClientProps) {
  const [localPredictions, setLocalPredictions] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    predictions.forEach((p) => {
      map[`${p.stage}:${p.slot_key}`] = p.team_id || ''
    })
    return map
  })
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const teamMap = new Map(teams.map((t) => [t.id, t]))

  async function handleChange(stage: string, slotKey: string, teamId: string) {
    const key = `${stage}:${slotKey}`
    setLocalPredictions((prev) => ({ ...prev, [key]: teamId }))

    setSaving((prev) => ({ ...prev, [key]: true }))
    const formData = new FormData()
    formData.append('stage', stage)
    formData.append('slot_key', slotKey)
    formData.append('team_id', teamId)

    const result = await saveBracketPredictionAction(formData)
    setSaving((prev) => ({ ...prev, [key]: false }))

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`${slotKey} guardado`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Swords className="h-6 w-6 text-brand-red" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bracket Eliminatorio</h1>
          <p className="text-muted-foreground">Predecí quién avanza en cada ronda del torneo.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {STAGES.map((stage) => {
          const slots = SLOT_NAMES[stage.key] || []
          return (
            <div key={stage.key} className="rounded-xl border bg-card">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {stage.key === 'final' && <Trophy className="h-5 w-5 text-brand-gold" />}
                    {stage.key === 'third_place' && <Medal className="h-5 w-5 text-amber-700" />}
                    <h2 className="font-semibold">{stage.label}</h2>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {stage.points} pts cada acierto
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {slots.map((slotKey) => {
                    const currentValue = localPredictions[`${stage.key}:${slotKey}`] || ''
                    const selectedTeam = teamMap.get(currentValue)
                    const isSaving = saving[`${stage.key}:${slotKey}`]

                    return (
                      <div key={slotKey} className="rounded-lg border p-3">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          {slotKey === 'CHAMPION' ? 'Campeón' : slotKey === 'RUNNER_UP' ? 'Subcampeón' : slotKey}
                        </label>
                        <div className="flex items-center gap-2">
                          <select
                            value={currentValue}
                            onChange={(e) => handleChange(stage.key, slotKey, e.target.value)}
                            disabled={isSaving}
                            className="flex-1 h-9 rounded-md border border-input bg-transparent px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">Seleccionar equipo...</option>
                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name_es}
                              </option>
                            ))}
                          </select>
                        </div>
                        {selectedTeam && (
                          <div className="mt-2 flex items-center gap-2 text-sm">
                            <TeamFlag code={selectedTeam.flag_emoji} label={selectedTeam.name_es} />
                            <span className="font-medium">{selectedTeam.name_es}</span>
                            <span className="text-xs text-muted-foreground">{selectedTeam.code}</span>
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
    </div>
  )
}
