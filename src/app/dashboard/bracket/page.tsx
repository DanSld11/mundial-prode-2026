'use client'

import { useEffect, useState } from 'react'
import { Swords, Trophy, Medal, ChevronRight, CheckCircle2, Lock } from 'lucide-react'
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
  { key: 'round_of_32', label: 'Ronda de 32', short: 'R32', slots: 16, points: 2 },
  { key: 'round_of_16', label: 'Octavos', short: 'R16', slots: 8, points: 3 },
  { key: 'quarterfinal', label: 'Cuartos', short: 'QF', slots: 4, points: 5 },
  { key: 'semifinal', label: 'Semifinales', short: 'SF', slots: 2, points: 8 },
  { key: 'final', label: 'Final', short: 'F', slots: 1, points: 15 },
]

function SlotCard({
  label,
  selectedTeam,
  teams,
  onSelect,
  locked,
  isChampion,
}: {
  label: string
  selectedTeam: Team | undefined
  teams: Team[]
  onSelect: (teamId: string) => void
  locked: boolean
  isChampion?: boolean
}) {
  return (
    <div className={`relative rounded-xl border bg-card p-2 shadow-sm ${isChampion ? 'ring-2 ring-brand-gold' : ''}`}>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      {locked ? (
        <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${selectedTeam ? 'bg-muted/40' : 'bg-muted/20'}`}>
          {selectedTeam ? (
            <>
              <TeamFlag code={selectedTeam.flag_emoji} label={selectedTeam.name_es} />
              <span className="flex-1 truncate font-semibold">{selectedTeam.name_es}</span>
              {isChampion && <Trophy className="h-4 w-4 text-brand-gold shrink-0" />}
            </>
          ) : (
            <span className="text-muted-foreground italic">Sin predicción</span>
          )}
          <Lock className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        </div>
      ) : (
        <select
          value={selectedTeam?.id ?? ''}
          onChange={(e) => onSelect(e.target.value)}
          className="h-9 w-full rounded-lg border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/40"
        >
          <option value="">Elegir equipo...</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.flag_emoji} {t.name_es}</option>
          ))}
        </select>
      )}
      {selectedTeam && !locked && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <TeamFlag code={selectedTeam.flag_emoji} label={selectedTeam.name_es} />
          <span className="truncate text-xs font-semibold text-muted-foreground">{selectedTeam.name_es}</span>
          {isChampion && <Trophy className="h-3 w-3 text-brand-gold shrink-0" />}
        </div>
      )}
    </div>
  )
}

export default function BracketPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [predictions, setPredictions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = getAccessToken()
    setToken(t)
    const supabase = createAnonClient()

    supabase.from('teams').select('id, name_es, flag_emoji, code').order('name_es').then(({ data }) => {
      setTeams(data ?? [])
      setLoading(false)
    })

    if (t) {
      const authed = createAuthedClient(t)
      getCurrentUserId(t).then((uid) => {
        if (!uid) return
        setUserId(uid)
        authed.from('bracket_predictions').select('stage, slot_key, team_id').eq('user_id', uid).then(({ data: p }) => {
          const map: Record<string, string> = {}
          for (const pred of (p ?? [])) map[`${pred.stage}:${pred.slot_key}`] = pred.team_id ?? ''
          setPredictions(map)
        })
      })
    }
  }, [])

  async function handleSelect(stage: string, slotKey: string, teamId: string) {
    if (!token || !userId) { toast.error('Iniciá sesión para guardar.'); return }
    const key = `${stage}:${slotKey}`
    setPredictions((prev) => ({ ...prev, [key]: teamId }))
    setSaving((prev) => ({ ...prev, [key]: true }))

    const authed = createAuthedClient(token)
    const { error } = await authed.from('bracket_predictions').upsert(
      { user_id: userId, stage, slot_key: slotKey, team_id: teamId || null },
      { onConflict: 'user_id, stage, slot_key' }
    )
    setSaving((prev) => ({ ...prev, [key]: false }))
    if (error) toast.error(error.message)
    else toast.success('Guardado')
  }

  const teamMap = new Map(teams.map((t) => [t.id, t]))
  const totalSlots = STAGES.reduce((s, st) => s + st.slots, 0)
  const filledSlots = Object.values(predictions).filter(Boolean).length

  if (loading) return (
    <div className="space-y-5">
      <div className="h-20 animate-pulse rounded-2xl bg-muted/60" />
      <div className="h-96 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )

  return (
    <div className="space-y-5 sm:space-y-7">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Bracket Eliminatorio</h1>
              <p className="text-sm text-muted-foreground">Predecí el camino hasta el campeón</p>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <div className="text-2xl font-extrabold tabular-nums text-brand-red">{filledSlots}/{totalSlots}</div>
            <div className="text-xs text-muted-foreground">predicciones</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-red transition-all duration-500"
              style={{ width: `${totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Points guide */}
      <div className="flex flex-wrap gap-2 text-xs">
        {STAGES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 shadow-sm">
            <span className="font-semibold text-brand-red">{s.short}</span>
            <span className="text-muted-foreground">{s.label}</span>
            <Badge variant="secondary" className="ml-1 text-[10px]">{s.points} pts</Badge>
          </div>
        ))}
      </div>

      {/* Visual bracket — horizontal scroll on mobile */}
      <div className="overflow-x-auto pb-4">
        <div className="flex min-w-max gap-2">
          {STAGES.map((stage, stageIdx) => {
            const slotKeys = Array.from({ length: stage.slots }, (_, i) => `${stage.key}-${i + 1}`)
            return (
              <div key={stage.key} className="flex flex-col gap-2" style={{ width: '180px' }}>
                {/* Stage header */}
                <div className={`rounded-lg px-3 py-2 text-center text-xs font-bold uppercase tracking-wider ${
                  stage.key === 'final' ? 'bg-brand-gold text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {stage.label}
                  <span className="ml-1 font-normal opacity-70">· {stage.points}pts</span>
                </div>

                {/* Connector arrow */}
                {stageIdx > 0 && (
                  <div className="absolute" style={{ display: 'none' }} />
                )}

                {/* Slots */}
                <div className="flex flex-1 flex-col justify-around gap-2">
                  {slotKeys.map((slotKey, slotIdx) => {
                    const key = `${stage.key}:${slotKey}`
                    const selectedId = predictions[key] ?? ''
                    const selectedTeam = teamMap.get(selectedId)
                    const isLast = stage.key === 'final'
                    const isChampion = isLast && slotIdx === 0

                    return (
                      <SlotCard
                        key={slotKey}
                        label={
                          stage.key === 'final'
                            ? (slotIdx === 0 ? '🏆 Campeón' : '🥈 Subcampeón')
                            : slotIdx === 0 && stage.key === 'semifinal'
                            ? 'Semi 1'
                            : `${stage.short} ${slotIdx + 1}`
                        }
                        selectedTeam={selectedTeam}
                        teams={teams}
                        onSelect={(teamId) => handleSelect(stage.key, slotKey, teamId)}
                        locked={saving[key] ?? false}
                        isChampion={isChampion}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Champion callout */}
          <div className="flex flex-col justify-center" style={{ width: '100px' }}>
            <div className="rounded-xl border-2 border-brand-gold bg-brand-gold/10 p-3 text-center">
              <Trophy className="mx-auto mb-2 h-8 w-8 text-brand-gold" />
              <p className="text-xs font-bold text-brand-gold">CAMPEÓN</p>
              {(() => {
                const championId = predictions['final:final-1']
                const champion = teamMap.get(championId ?? '')
                return champion ? (
                  <div className="mt-2 flex flex-col items-center gap-1">
                    <TeamFlag code={champion.flag_emoji} label={champion.name_es} className="h-5 w-7" />
                    <span className="text-[10px] font-semibold leading-tight text-center">{champion.name_es}</span>
                  </div>
                ) : (
                  <p className="mt-2 text-[10px] text-muted-foreground">Sin elegir</p>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Points breakdown */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">¿Cómo se suman puntos en el bracket?</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STAGES.map((s) => (
            <div key={s.key} className="rounded-lg bg-muted/40 px-3 py-2 text-center">
              <div className="text-xl font-extrabold text-brand-red">{s.points}</div>
              <div className="text-xs text-muted-foreground">pts · {s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Cada acierto (equipo que avanza a esa ronda) suma los puntos indicados. El campeón vale <span className="font-bold">15 pts</span>.
        </p>
      </div>
    </div>
  )
}
