'use client'

import { TeamFlag } from '@/components/team-flag'
import { Trophy } from 'lucide-react'

// ── Layout constants ───────────────────────────────────────────────────
const CARD_H    = 80   // match card height (px)
const CARD_W    = 196  // match card width  (px) — wide enough for full names
const INNER_GAP = 6    // gap between the two cards within a R32 pair
const PAIR_SEP  = 22   // gap between R32 pairs
const INTER_COL = 56   // horizontal space between right edge of col and left of next
const HEADER_H  = 36   // top space for round labels

const pairH = CARD_H * 2 + INNER_GAP + PAIR_SEP  // 188

// ── Y-position helpers ─────────────────────────────────────────────────
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

// ── Column X positions ─────────────────────────────────────────────────
const COL_STEP = CARD_W + INTER_COL
const CX = {
  r32: 0,
  r16: COL_STEP,
  qf:  COL_STEP * 2,
  sf:  COL_STEP * 3,
  fin: COL_STEP * 4,
}
const TOTAL_W = CX.fin + CARD_W

// midpoint X between adjacent columns (for SVG elbow lines)
const midX = (col: number) => col * COL_STEP + CARD_W + INTER_COL / 2

// ── Match numbers ──────────────────────────────────────────────────────
const R32 = [73, 76, 75, 78, 81, 82, 83, 84, 74, 77, 79, 80, 85, 88, 86, 87]
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
  home_team: Team | null; away_team: Team | null
}

// ── Date helper ────────────────────────────────────────────────────────
function peruDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    d.toLocaleString('es-PE', { timeZone: 'America/Lima', ...opts })
  const day   = fmt({ day: 'numeric' })
  const month = fmt({ month: 'numeric' })
  const time  = fmt({ hour: '2-digit', minute: '2-digit', hour12: false })
  return `${day}/${month} · ${time}`
}

// ── SVG connector lines ────────────────────────────────────────────────
function buildConnectorPaths(
  leftEdge: number,
  junctionX: number,
  rightEdge: number,
  pairs: [number, number][],
  nextCenters: number[],
): string {
  return pairs.map(([topC, botC], i) => {
    const nc = nextCenters[i]
    return [
      `M${leftEdge},${topC} H${junctionX} V${nc}`,
      `M${leftEdge},${botC} H${junctionX} V${nc}`,
      `M${junctionX},${nc} H${rightEdge}`,
    ].join(' ')
  }).join(' ')
}

function BracketSVG() {
  const totalH = Math.max(r32Y(15) + CARD_H, trdY() + CARD_H) + 24

  const r32Centers = R32.map((_, i) => r32C(i))
  const r16Centers = R16.map((_, i) => r16C(i))
  const qfCenters  = QF.map((_, i)  => qfC(i))
  const sfCenters  = SF.map((_, i)  => sfC(i))
  const finCenter  = finY() + CARD_H / 2

  const r32Pairs = Array.from({ length: 8 }, (_, i) => [r32Centers[i*2], r32Centers[i*2+1]] as [number,number])
  const r16Pairs = Array.from({ length: 4 }, (_, i) => [r16Centers[i*2], r16Centers[i*2+1]] as [number,number])
  const qfPairs  = Array.from({ length: 2 }, (_, i) => [qfCenters[i*2], qfCenters[i*2+1]] as [number,number])
  const sfPair   = [[sfCenters[0], sfCenters[1]] as [number,number]]

  const p1 = buildConnectorPaths(CX.r32+CARD_W, midX(0), CX.r16, r32Pairs, r16Centers)
  const p2 = buildConnectorPaths(CX.r16+CARD_W, midX(1), CX.qf,  r16Pairs, qfCenters)
  const p3 = buildConnectorPaths(CX.qf +CARD_W, midX(2), CX.sf,  qfPairs,  sfCenters)
  const p4 = buildConnectorPaths(CX.sf +CARD_W, midX(3), CX.fin, sfPair,   [finCenter])

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: TOTAL_W, height: totalH, pointerEvents: 'none' }}
      aria-hidden
    >
      {[p1, p2, p3, p4].map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border" />
      ))}
    </svg>
  )
}

// ── Match card ─────────────────────────────────────────────────────────
function MatchCard({ match, isFinal = false }: { match: Match | undefined; isFinal?: boolean }) {
  if (!match) {
    return (
      <div
        style={{ width: CARD_W, height: CARD_H }}
        className="rounded-lg border-2 border-dashed border-muted/40 bg-muted/10"
      />
    )
  }

  const finished = match.status === 'finished'
  const hasTeams = !!(match.home_team && match.away_team)
  const homeWon  = finished && (match.home_score ?? -1) > (match.away_score ?? -1)
  const awayWon  = finished && (match.away_score ?? -1) > (match.home_score ?? -1)

  return (
    <div
      style={{ width: CARD_W, height: CARD_H }}
      className={`rounded-lg border bg-card shadow-sm overflow-hidden flex flex-col ${
        isFinal ? 'border-yellow-400 dark:border-yellow-600 shadow-md' : ''
      }`}
    >
      {/* Date / time header row */}
      <div className="flex items-center justify-center border-b bg-muted/30 px-2" style={{ height: 18 }}>
        <span className="text-[9px] font-semibold text-muted-foreground tracking-wide tabular-nums">
          {finished ? 'Finalizado' : peruDateTime(match.match_date)}
        </span>
      </div>

      {/* Home team row */}
      <div
        className={`flex flex-1 items-center gap-1.5 px-2 min-w-0 ${
          homeWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''
        }`}
      >
        {hasTeams ? (
          <>
            <TeamFlag
              code={match.home_team!.flag_emoji}
              label={match.home_team!.name_es}
              className="h-4 w-6 shrink-0"
            />
            <span
              className={`flex-1 truncate text-[11px] font-semibold leading-tight ${
                homeWon ? 'text-emerald-700 dark:text-emerald-400' : ''
              }`}
            >
              {match.home_team!.name_es}
            </span>
            {finished && (
              <span className={`shrink-0 text-sm font-extrabold tabular-nums ${
                homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
              }`}>
                {match.home_score}
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] italic text-muted-foreground/50">A definir</span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px shrink-0 bg-border" />

      {/* Away team row */}
      <div
        className={`flex flex-1 items-center gap-1.5 px-2 min-w-0 ${
          awayWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''
        }`}
      >
        {hasTeams ? (
          <>
            <TeamFlag
              code={match.away_team!.flag_emoji}
              label={match.away_team!.name_es}
              className="h-4 w-6 shrink-0"
            />
            <span
              className={`flex-1 truncate text-[11px] font-semibold leading-tight ${
                awayWon ? 'text-emerald-700 dark:text-emerald-400' : ''
              }`}
            >
              {match.away_team!.name_es}
            </span>
            {finished && (
              <span className={`shrink-0 text-sm font-extrabold tabular-nums ${
                awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
              }`}>
                {match.away_score}
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] italic text-muted-foreground/50">A definir</span>
        )}
      </div>
    </div>
  )
}

// ── Column round label ─────────────────────────────────────────────────
function ColHeader({ x, label }: { x: number; label: string }) {
  return (
    <div
      style={{ position: 'absolute', top: 0, left: x, width: CARD_W }}
      className="flex items-center justify-center h-7 rounded-md bg-muted/50"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

// ── Main bracket tree ──────────────────────────────────────────────────
export default function BracketTree({ matches }: { matches: Match[] }) {
  const map  = new Map(matches.map((m) => [m.match_number, m]))
  const totalH = Math.max(r32Y(15) + CARD_H, trdY() + CARD_H) + 32

  const card = (num: number, isFinal = false) => (
    <MatchCard match={map.get(num)} isFinal={isFinal} />
  )

  return (
    <div className="overflow-x-auto overflow-y-auto pb-4" style={{ maxHeight: '80vh' }}>
      <div style={{ position: 'relative', width: TOTAL_W, height: totalH }}>

        {/* SVG connecting lines */}
        <BracketSVG />

        {/* Column headers */}
        <ColHeader x={CX.r32} label="Dieciseisavos" />
        <ColHeader x={CX.r16} label="Octavos" />
        <ColHeader x={CX.qf}  label="Cuartos" />
        <ColHeader x={CX.sf}  label="Semis" />
        <ColHeader x={CX.fin} label="Final" />

        {/* R32 */}
        {R32.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: r32Y(i), left: CX.r32 }}>
            {card(num)}
          </div>
        ))}

        {/* R16 */}
        {R16.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: r16Y(i), left: CX.r16 }}>
            {card(num)}
          </div>
        ))}

        {/* QF */}
        {QF.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: qfY(i), left: CX.qf }}>
            {card(num)}
          </div>
        ))}

        {/* SF */}
        {SF.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: sfY(i), left: CX.sf }}>
            {card(num)}
          </div>
        ))}

        {/* Final */}
        <div style={{ position: 'absolute', top: finY(), left: CX.fin }}>
          <div className="mb-1 flex items-center justify-center gap-1">
            <Trophy className="h-3 w-3 text-yellow-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-600 dark:text-yellow-400">
              Gran Final
            </span>
          </div>
          {card(FIN, true)}
        </div>

        {/* 3rd place */}
        <div style={{ position: 'absolute', top: trdY(), left: CX.fin }}>
          <div className="mb-1 flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              3er Puesto
            </span>
          </div>
          {card(TRD)}
        </div>

      </div>
    </div>
  )
}
