'use client'

import { useState, useTransition } from 'react'
import { updateKnockoutMatch, lockKnockoutStage, autoSeedR32Action } from './actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Lock, Unlock, Save, CheckCircle2, Loader2, Wand2 } from 'lucide-react'

interface Team {
  id: string
  name_es: string
  code: string
  flag_emoji: string
}

interface Match {
  id: string
  match_number: number
  stage: string
  match_date: string
  status: string
  predictions_locked: boolean
  home_score: number | null
  away_score: number | null
  stadium: string | null
  home_team_id: string | null
  away_team_id: string | null
  home_team: Team | null
  away_team: Team | null
}

const STAGE_LABELS: Record<string, string> = {
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de Final',
  quarterfinal: 'Cuartos de Final',
  semifinal: 'Semifinales',
  third_place: 'Tercer Puesto',
  final: 'Gran Final',
}

const STAGE_ORDER = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']

function toLocalDatetimeValue(isoString: string): string {
  // Convert ISO string to datetime-local input format (YYYY-MM-DDTHH:mm) in Lima time (UTC-5)
  const d = new Date(isoString)
  const limaOffset = -5 * 60
  const localMs = d.getTime() + (limaOffset - d.getTimezoneOffset()) * 60000
  const local = new Date(localMs)
  return local.toISOString().slice(0, 16)
}

function fromLocalDatetimeValue(localStr: string): string {
  // Input is Lima time (UTC-5), convert to ISO
  return new Date(localStr + ':00-05:00').toISOString()
}

function MatchRow({ match, teams }: { match: Match; teams: Team[] }) {
  const [homeTeamId, setHomeTeamId] = useState(match.home_team_id ?? '')
  const [awayTeamId, setAwayTeamId] = useState(match.away_team_id ?? '')
  const [matchDate, setMatchDate] = useState(toLocalDatetimeValue(match.match_date))
  const [stadium, setStadium] = useState(match.stadium ?? '')
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      const res = await updateKnockoutMatch(
        match.id,
        homeTeamId || null,
        awayTeamId || null,
        fromLocalDatetimeValue(matchDate),
        stadium,
      )
      if (res.error) {
        toast.error(res.error)
      } else {
        setSaved(true)
        toast.success(`Partido ${match.match_number} actualizado`)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  const isDirty =
    homeTeamId !== (match.home_team_id ?? '') ||
    awayTeamId !== (match.away_team_id ?? '') ||
    matchDate !== toLocalDatetimeValue(match.match_date) ||
    stadium !== (match.stadium ?? '')

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">#{match.match_number}</span>
          {match.status === 'finished' && (
            <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-600">
              <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Finalizado
            </Badge>
          )}
          {match.predictions_locked && match.status !== 'finished' && (
            <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-600">
              <Lock className="h-2.5 w-2.5 mr-1" /> Bloqueado
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={pending || !isDirty}
          className={`h-7 px-3 text-xs gap-1 ${saved ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
        >
          {pending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="h-3 w-3" /> Guardado</>
          ) : (
            <><Save className="h-3 w-3" /> Guardar</>
          )}
        </Button>
      </div>

      {/* Teams row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <TeamSelect
          value={homeTeamId}
          onChange={setHomeTeamId}
          teams={teams}
          exclude={awayTeamId}
          label="Local"
        />
        <span className="text-xs font-bold text-muted-foreground">VS</span>
        <TeamSelect
          value={awayTeamId}
          onChange={setAwayTeamId}
          teams={teams}
          exclude={homeTeamId}
          label="Visitante"
        />
      </div>

      {/* Date + Stadium row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Fecha (Lima)</label>
          <Input
            type="datetime-local"
            value={matchDate}
            onChange={(e) => setMatchDate(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Estadio</label>
          <Input
            placeholder="Estadio..."
            value={stadium}
            onChange={(e) => setStadium(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </div>
  )
}

function TeamSelect({
  value, onChange, teams, exclude, label,
}: {
  value: string
  onChange: (v: string) => void
  teams: Team[]
  exclude: string
  label: string
}) {
  const selected = teams.find((t) => t.id === value)

  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        {selected && (
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base leading-none">
            {selected.flag_emoji}
          </span>
        )}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-9 pr-2 ${selected ? 'pl-8' : 'pl-2'}`}
        >
          <option value="">— Por definir —</option>
          {teams
            .filter((t) => t.id !== exclude)
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.flag_emoji} {t.name_es}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}

function StageSection({
  stage, matches, teams,
}: {
  stage: string
  matches: Match[]
  teams: Team[]
}) {
  const [lockPending, startLock] = useTransition()
  const allLocked = matches.every((m) => m.predictions_locked)

  function handleToggleLock() {
    startLock(async () => {
      const res = await lockKnockoutStage(stage, !allLocked)
      if (res.error) toast.error(res.error)
      else toast.success(allLocked ? 'Predicciones abiertas' : 'Predicciones bloqueadas')
    })
  }

  const filled = matches.filter((m) => m.home_team_id && m.away_team_id).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-base">{STAGE_LABELS[stage]}</h3>
          <span className="text-xs text-muted-foreground">{filled}/{matches.length} equipos definidos</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleLock}
          disabled={lockPending}
          className={`h-7 gap-1 text-xs ${allLocked ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : 'border-emerald-500 text-emerald-600 hover:bg-emerald-50'}`}
        >
          {allLocked ? <><Unlock className="h-3 w-3" /> Abrir predicciones</> : <><Lock className="h-3 w-3" /> Bloquear predicciones</>}
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        {matches.map((m) => (
          <MatchRow key={m.id} match={m} teams={teams} />
        ))}
      </div>
    </div>
  )
}

export default function BracketAdminClient({
  matches: initialMatches,
  teams,
  onCreateStructure,
  creating,
}: {
  matches: Match[]
  teams: Team[]
  onCreateStructure: () => void
  creating: boolean
}) {
  const [seeding, startSeed] = useTransition()
  const stagesWithMatches = STAGE_ORDER.filter((s) => initialMatches.some((m) => m.stage === s))

  function handleAutoSeed() {
    startSeed(async () => {
      const res = await autoSeedR32Action()
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`✅ ${res.seeded} partidos R32 poblados${res.skipped ? ` (${res.skipped} sin resultados de grupos)` : ''}`)
        if (res.errors && res.errors.length > 0) toast.error(res.errors.join(', '))
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Crear estructura */}
      {initialMatches.length < 32 && (
        <div className="rounded-2xl border-2 border-dashed border-brand-red/30 bg-brand-red/5 p-6 text-center space-y-3">
          <p className="font-semibold text-lg">Estructura del bracket no creada</p>
          <p className="text-sm text-muted-foreground">
            Crea los {32 - initialMatches.length} partidos de la fase eliminatoria con fechas aproximadas.
            Después podrás asignar equipos y ajustar fechas.
          </p>
          <Button
            onClick={onCreateStructure}
            disabled={creating}
            className="bg-brand-red hover:bg-red-600 text-white"
          >
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {creating ? 'Creando...' : '⚡ Crear estructura eliminatoria'}
          </Button>
        </div>
      )}

      {/* Auto-seed R32 */}
      {initialMatches.some((m) => m.stage === 'round_of_32') && (
        <div className="rounded-xl border bg-muted/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sm">Auto-poblar Ronda de 32</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Asigna equipos desde los resultados de grupos (1A vs 2B, 1B vs 2A, etc.). Los 4 slots para 3ros se asignan manualmente.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoSeed}
            disabled={seeding}
            className="shrink-0 gap-1.5 border-violet-500 text-violet-700 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
          >
            {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {seeding ? 'Poblando...' : 'Auto-poblar desde grupos'}
          </Button>
        </div>
      )}

      {/* Por stage */}
      {stagesWithMatches.map((stage) => (
        <StageSection
          key={stage}
          stage={stage}
          matches={initialMatches.filter((m) => m.stage === stage)}
          teams={teams}
        />
      ))}

      {stagesWithMatches.length === 0 && initialMatches.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          Primero creá la estructura del bracket con el botón de arriba.
        </p>
      )}
    </div>
  )
}
