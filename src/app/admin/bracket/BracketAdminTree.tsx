'use client'

import { useState, useTransition } from 'react'
import { TeamFlag } from '@/components/team-flag'
import { saveMatchResult } from './actions'
import { toast } from 'sonner'
import { Pencil, X, Save, CheckCircle2, Loader2, Trophy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// ── Layout constants (mirror BracketTree) ──────────────────────────────
const CARD_H    = 80
const CARD_W    = 196
const INNER_GAP = 6
const PAIR_SEP  = 22
const INTER_COL = 56
const HEADER_H  = 36

const pairH = CARD_H * 2 + INNER_GAP + PAIR_SEP

const r32Y  = (i: number) => HEADER_H + Math.floor(i / 2) * pairH + (i % 2) * (CARD_H + INNER_GAP)
const r32C  = (i: number) => r32Y(i) + CARD_H / 2
const r16Y  = (i: number) => (r32C(i * 2) + r32C(i * 2 + 1)) / 2 - CARD_H / 2
const r16C  = (i: number) => r16Y(i) + CARD_H / 2
const qfY   = (i: number) => (r16C(i * 2) + r16C(i * 2 + 1)) / 2 - CARD_H / 2
const qfC   = (i: number) => qfY(i) + CARD_H / 2
const sfY   = (i: number) => (qfC(i * 2) + qfC(i * 2 + 1)) / 2 - CARD_H / 2
const sfC   = (i: number) => sfY(i) + CARD_H / 2
const finY  = () => (sfC(0) + sfC(1)) / 2 - CARD_H / 2
const trdY  = () => sfY(1) + CARD_H + 32

const COL_STEP = CARD_W + INTER_COL
const CX = { r32: 0, r16: COL_STEP, qf: COL_STEP * 2, sf: COL_STEP * 3, fin: COL_STEP * 4 }
const TOTAL_W = CX.fin + CARD_W
const midX = (col: number) => col * COL_STEP + CARD_W + INTER_COL / 2

const R32 = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88]
const R16 = [89, 90, 91, 92, 93, 94, 95, 96]
const QF  = [97, 98, 99, 100]
const SF  = [101, 102]
const FIN = 104
const TRD = 103

// ── Types ──────────────────────────────────────────────────────────────
interface Team  { id: string; name_es: string; code: string; flag_emoji: string }
interface Match {
  id: string; match_number: number; stage: string; match_date: string; status: string
  home_score: number | null; away_score: number | null
  home_team_id: string | null; away_team_id: string | null
  home_team: Team | null; away_team: Team | null
}

// ── SVG connectors (same as BracketTree) ──────────────────────────────
function buildPaths(
  leftEdge: number, jX: number, rightEdge: number,
  pairs: [number, number][], nextCenters: number[],
): string {
  return pairs.map(([t, b], i) => {
    const nc = nextCenters[i]
    return `M${leftEdge},${t} H${jX} V${nc} M${leftEdge},${b} H${jX} V${nc} M${jX},${nc} H${rightEdge}`
  }).join(' ')
}

function BracketSVG() {
  const totalH = Math.max(r32Y(15) + CARD_H, trdY() + CARD_H) + 24
  const r32C_ = R32.map((_, i) => r32C(i))
  const r16C_ = R16.map((_, i) => r16C(i))
  const qfC_  = QF.map((_, i)  => qfC(i))
  const sfC_  = SF.map((_, i)  => sfC(i))
  const finC  = finY() + CARD_H / 2

  const mkPairs = (arr: number[], n: number): [number, number][] =>
    Array.from({ length: n }, (_, i) => [arr[i * 2], arr[i * 2 + 1]])

  const p1 = buildPaths(CX.r32+CARD_W, midX(0), CX.r16, mkPairs(r32C_, 8), r16C_)
  const p2 = buildPaths(CX.r16+CARD_W, midX(1), CX.qf,  mkPairs(r16C_, 4), qfC_)
  const p3 = buildPaths(CX.qf +CARD_W, midX(2), CX.sf,  mkPairs(qfC_, 2),  sfC_)
  const p4 = buildPaths(CX.sf +CARD_W, midX(3), CX.fin, [[sfC_[0], sfC_[1]]], [finC])

  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, width: TOTAL_W, height: totalH, pointerEvents: 'none' }} aria-hidden>
      {[p1, p2, p3, p4].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
      ))}
    </svg>
  )
}

// ── Result edit modal ─────────────────────────────────────────────────
function ResultModal({
  match,
  onClose,
  onSaved,
}: {
  match: Match
  onClose: () => void
  onSaved: () => void
}) {
  const [homeScore, setHomeScore] = useState<string>(match.home_score?.toString() ?? '')
  const [awayScore, setAwayScore] = useState<string>(match.away_score?.toString() ?? '')
  const [overrideWinner, setOverrideWinner] = useState<string>('')
  const [pending, startTransition] = useTransition()

  const hs = parseInt(homeScore) || 0
  const as_ = parseInt(awayScore) || 0
  const isDraw = homeScore !== '' && awayScore !== '' && hs === as_

  function handleSave() {
    if (homeScore === '' || awayScore === '') { toast.error('Ingresá ambos marcadores'); return }
    if (isDraw && !overrideWinner) { toast.error('Empate: seleccioná quién ganó en penales/prórroga'); return }

    startTransition(async () => {
      const res = await saveMatchResult(
        match.id,
        match.match_number,
        hs,
        as_,
        isDraw ? overrideWinner : null,
      )
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(`✅ Partido ${match.match_number} guardado — ganador avanzado`)
        onSaved()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card shadow-xl space-y-4 p-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Partido #{match.match_number}
            </p>
            <p className="text-sm font-bold mt-0.5">Ingresar resultado</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Teams + scores */}
        <div className="space-y-3">
          {/* Home */}
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2">
              <TeamFlag code={match.home_team?.flag_emoji} label={match.home_team?.name_es} className="h-5 w-7 shrink-0" />
              <span className="text-sm font-semibold truncate">{match.home_team?.name_es ?? 'Local'}</span>
            </div>
            <Input
              type="number"
              min="0"
              max="20"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-16 h-9 text-center text-lg font-extrabold tabular-nums"
              placeholder="0"
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-1 border-t" />
            <span className="mx-3 text-xs font-bold text-muted-foreground">VS</span>
            <div className="flex-1 border-t" />
          </div>

          {/* Away */}
          <div className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2">
              <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} className="h-5 w-7 shrink-0" />
              <span className="text-sm font-semibold truncate">{match.away_team?.name_es ?? 'Visitante'}</span>
            </div>
            <Input
              type="number"
              min="0"
              max="20"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-16 h-9 text-center text-lg font-extrabold tabular-nums"
              placeholder="0"
            />
          </div>
        </div>

        {/* Draw override: who won penalties/ET */}
        {isDraw && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-700 p-3 space-y-2">
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              ⚠️ Empate — ¿quién ganó en prórroga/penales?
            </p>
            <div className="flex gap-2">
              {[match.home_team, match.away_team].map((team) => team && (
                <button
                  key={team.id}
                  onClick={() => setOverrideWinner(team.id)}
                  className={`flex flex-1 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-all ${
                    overrideWinner === team.id
                      ? 'border-brand-red bg-brand-red/10 text-brand-red'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <TeamFlag code={team.flag_emoji} label={team.name_es} className="h-3.5 w-5" />
                  {team.name_es}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 h-9" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button
            className="flex-1 h-9 bg-brand-red hover:bg-red-700 text-white gap-1.5"
            onClick={handleSave}
            disabled={pending || homeScore === '' || awayScore === ''}
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {pending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Admin match card ───────────────────────────────────────────────────
function AdminMatchCard({
  match,
  onEdit,
}: {
  match: Match | undefined
  onEdit?: (m: Match) => void
}) {
  if (!match) {
    return (
      <div style={{ width: CARD_W, height: CARD_H }}
        className="rounded-lg border-2 border-dashed border-muted/40 bg-muted/10 flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground/40 italic">Por definir</span>
      </div>
    )
  }

  const finished = match.status === 'finished'
  const hasTeams = !!(match.home_team && match.away_team)
  const homeWon  = finished && (match.home_score ?? -1) > (match.away_score ?? -1)
  const awayWon  = finished && (match.away_score ?? -1) > (match.home_score ?? -1)
  const canEdit  = hasTeams

  return (
    <div
      style={{ width: CARD_W, height: CARD_H }}
      className={`group relative rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col ${
        finished ? 'border-emerald-400 dark:border-emerald-700' : ''
      } ${match.match_number === FIN ? 'border-yellow-400 dark:border-yellow-600' : ''}`}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-2" style={{ height: 18 }}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
          #{match.match_number}
        </span>
        {finished && (
          <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-2.5 w-2.5" /> Final
          </span>
        )}
      </div>

      {/* Home row */}
      <div className={`flex flex-1 items-center gap-1.5 px-2 min-w-0 ${homeWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
        {hasTeams ? (
          <>
            <TeamFlag code={match.home_team!.flag_emoji} label={match.home_team!.name_es} className="h-4 w-6 shrink-0" />
            <span className={`flex-1 truncate text-[11px] font-semibold ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
              {match.home_team!.name_es}
            </span>
            {finished && <span className={`text-sm font-extrabold tabular-nums shrink-0 ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>{match.home_score}</span>}
          </>
        ) : <span className="text-[10px] italic text-muted-foreground/50">A definir</span>}
      </div>

      <div className="h-px shrink-0 bg-border" />

      {/* Away row */}
      <div className={`flex flex-1 items-center gap-1.5 px-2 min-w-0 ${awayWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
        {hasTeams ? (
          <>
            <TeamFlag code={match.away_team!.flag_emoji} label={match.away_team!.name_es} className="h-4 w-6 shrink-0" />
            <span className={`flex-1 truncate text-[11px] font-semibold ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
              {match.away_team!.name_es}
            </span>
            {finished && <span className={`text-sm font-extrabold tabular-nums shrink-0 ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>{match.away_score}</span>}
          </>
        ) : <span className="text-[10px] italic text-muted-foreground/50">A definir</span>}
      </div>

      {/* Edit overlay (visible on hover) */}
      {canEdit && onEdit && (
        <button
          onClick={() => onEdit(match)}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-black/30 transition-all opacity-0 group-hover:opacity-100"
          title="Ingresar resultado"
        >
          <span className="flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] font-bold shadow-md border">
            {finished ? <RotateCcw className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
            {finished ? 'Editar' : 'Resultado'}
          </span>
        </button>
      )}
    </div>
  )
}

// ── Column header ──────────────────────────────────────────────────────
function ColHeader({ x, label }: { x: number; label: string }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: x, width: CARD_W }}
      className="flex items-center justify-center h-7 rounded-md bg-muted/50">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  )
}

// ── Main admin bracket tree ────────────────────────────────────────────
export default function BracketAdminTree({
  matches: initialMatches,
}: {
  matches: Match[]
}) {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  const [editing, setEditing] = useState<Match | null>(null)

  const map = new Map(matches.map((m) => [m.match_number, m]))
  const totalH = Math.max(r32Y(15) + CARD_H, trdY() + CARD_H) + 32

  async function reload() {
    const res = await fetch(window.location.href, { cache: 'no-store' })
    // Full page data reload via Router
    window.location.reload()
  }

  const card = (num: number, isFin = false) => (
    <AdminMatchCard
      match={map.get(num)}
      onEdit={(m) => setEditing(m)}
    />
  )

  return (
    <>
      {editing && (
        <ResultModal
          match={editing}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}

      <div className="overflow-x-auto overflow-y-auto pb-4" style={{ maxHeight: '80vh' }}>
        <div style={{ position: 'relative', width: TOTAL_W, height: totalH }}>
          <BracketSVG />

          <ColHeader x={CX.r32} label="Dieciseisavos" />
          <ColHeader x={CX.r16} label="Octavos" />
          <ColHeader x={CX.qf}  label="Cuartos" />
          <ColHeader x={CX.sf}  label="Semis" />
          <ColHeader x={CX.fin} label="Final" />

          {R32.map((n, i) => (
            <div key={n} style={{ position: 'absolute', top: r32Y(i), left: CX.r32 }}>{card(n)}</div>
          ))}
          {R16.map((n, i) => (
            <div key={n} style={{ position: 'absolute', top: r16Y(i), left: CX.r16 }}>{card(n)}</div>
          ))}
          {QF.map((n, i) => (
            <div key={n} style={{ position: 'absolute', top: qfY(i), left: CX.qf }}>{card(n)}</div>
          ))}
          {SF.map((n, i) => (
            <div key={n} style={{ position: 'absolute', top: sfY(i), left: CX.sf }}>{card(n)}</div>
          ))}

          <div style={{ position: 'absolute', top: finY(), left: CX.fin }}>
            <div className="mb-1 flex items-center justify-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-600 dark:text-yellow-400">Gran Final</span>
            </div>
            {card(FIN, true)}
          </div>

          <div style={{ position: 'absolute', top: trdY(), left: CX.fin }}>
            <div className="mb-1 flex items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">3er Puesto</span>
            </div>
            {card(TRD)}
          </div>
        </div>
      </div>
    </>
  )
}
