'use client'

import { TeamFlag } from '@/components/team-flag'
import { formatPeruTime } from '@/lib/peru-time'
import { Trophy, Star } from 'lucide-react'

// ── Layout constants ───────────────────────────────────────────────────
const CARD_H    = 54   // match card height (px)
const CARD_W    = 158  // match card width  (px)
const INNER_GAP = 4    // gap between the two cards within a R32 pair
const PAIR_SEP  = 20   // gap between R32 pairs (creates the "breathing room")
const INTER_COL = 52   // horizontal space between right edge of col and left of next
const HEADER_H  = 34   // space at the top for round labels

const pairH = CARD_H * 2 + INNER_GAP + PAIR_SEP  // 132

// ── Y-position helpers (all include HEADER_H offset) ──────────────────
const r32Y  = (i: number) => HEADER_H + Math.floor(i / 2) * pairH + (i % 2) * (CARD_H + INNER_GAP)
const r32C  = (i: number) => r32Y(i) + CARD_H / 2
const r16Y  = (i: number) => (r32C(i * 2) + r32C(i * 2 + 1)) / 2 - CARD_H / 2
const r16C  = (i: number) => r16Y(i) + CARD_H / 2
const qfY   = (i: number) => (r16C(i * 2) + r16C(i * 2 + 1)) / 2 - CARD_H / 2
const qfC   = (i: number) => qfY(i) + CARD_H / 2
const sfY   = (i: number) => (qfC(i * 2) + qfC(i * 2 + 1)) / 2 - CARD_H / 2
const sfC   = (i: number) => sfY(i) + CARD_H / 2
const finY  = () => (sfC(0) + sfC(1)) / 2 - CARD_H / 2
const trdY  = () => sfY(1) + CARD_H + 28   // 3rd-place below SF bottom

// ── Column X positions ─────────────────────────────────────────────────
const COL_STEP = CARD_W + INTER_COL   // 210
const CX = {
  r32: 0,
  r16: COL_STEP,
  qf:  COL_STEP * 2,
  sf:  COL_STEP * 3,
  fin: COL_STEP * 4,
}
const TOTAL_W = CX.fin + CARD_W
// midpoint X between each adjacent pair of columns (for SVG elbow lines)
const midX = (col: number) => CX[Object.keys(CX)[col] as keyof typeof CX] + CARD_W + INTER_COL / 2

// ── Match numbers per round ───────────────────────────────────────────
const R32 = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88]
const R16 = [89, 90, 91, 92, 93, 94, 95, 96]
const QF  = [97, 98, 99, 100]
const SF  = [101, 102]
const FIN = 104
const TRD = 103

// ── Types ─────────────────────────────────────────────────────────────
interface Team  { id: string; name_es: string; code: string; flag_emoji: string }
interface Match {
  id: string
  match_number: number
  stage: string
  match_date: string
  status: string
  home_score: number | null
  away_score: number | null
  home_team: Team | null
  away_team: Team | null
}

// ── SVG connector lines ───────────────────────────────────────────────
// Draws elbow lines: [ top ] ─┐
//                    [ bot ] ─┘── [ next ]
function buildConnectorPaths(
  leftEdge: number,   // right edge of left column (= CX[col] + CARD_W)
  junctionX: number,  // midX between columns
  rightEdge: number,  // left edge of right column
  pairs: [number, number][],  // [topCenter, botCenter][]
  nextCenters: number[],      // center of each right-column match
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

  const r32Pairs: [number, number][] = Array.from({ length: 8 }, (_, i) => [r32Centers[i * 2], r32Centers[i * 2 + 1]])
  const r16Pairs: [number, number][] = Array.from({ length: 4 }, (_, i) => [r16Centers[i * 2], r16Centers[i * 2 + 1]])
  const qfPairs:  [number, number][] = Array.from({ length: 2 }, (_, i) => [qfCenters[i * 2], qfCenters[i * 2 + 1]])
  const sfPair:   [number, number][] = [[sfCenters[0], sfCenters[1]]]

  const p1 = buildConnectorPaths(CX.r32 + CARD_W, midX(0), CX.r16, r32Pairs, r16Centers)
  const p2 = buildConnectorPaths(CX.r16 + CARD_W, midX(1), CX.qf,  r16Pairs, qfCenters)
  const p3 = buildConnectorPaths(CX.qf  + CARD_W, midX(2), CX.sf,  qfPairs,  sfCenters)
  const p4 = buildConnectorPaths(CX.sf  + CARD_W, midX(3), CX.fin, sfPair,   [finCenter])

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

// ── Match card ────────────────────────────────────────────────────────
function MatchCard({ match }: { match: Match | undefined }) {
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
        match.match_number === FIN ? 'border-yellow-400 dark:border-yellow-600 shadow-yellow-100 dark:shadow-yellow-900/20 shadow-md' : ''
      }`}
    >
      {/* Home row */}
      <div className={`flex-1 flex items-center gap-1.5 px-2 min-w-0 ${homeWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
        {hasTeams ? (
          <>
            <TeamFlag code={match.home_team!.flag_emoji} label={match.home_team!.name_es} className="h-3.5 w-5 shrink-0" />
            <span className={`text-[11px] font-bold truncate flex-1 leading-none ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
              {match.home_team!.code}
            </span>
            {finished && (
              <span className={`text-xs font-extrabold tabular-nums shrink-0 ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                {match.home_score}
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] italic text-muted-foreground/50">A definir</span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border shrink-0" />

      {/* Away row */}
      <div className={`flex-1 flex items-center gap-1.5 px-2 min-w-0 ${awayWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
        {hasTeams ? (
          <>
            <TeamFlag code={match.away_team!.flag_emoji} label={match.away_team!.name_es} className="h-3.5 w-5 shrink-0" />
            <span className={`text-[11px] font-bold truncate flex-1 leading-none ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
              {match.away_team!.code}
            </span>
            {finished && (
              <span className={`text-xs font-extrabold tabular-nums shrink-0 ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
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

// ── Round column header ────────────────────────────────────────────────
function ColHeader({ x, label }: { x: number; label: string }) {
  return (
    <div
      style={{ position: 'absolute', top: 0, left: x, width: CARD_W }}
      className="flex items-center justify-center h-7 rounded-md bg-muted/50"
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  )
}

// ── Main bracket tree component ───────────────────────────────────────
export default function BracketTree({ matches }: { matches: Match[] }) {
  const map = new Map(matches.map((m) => [m.match_number, m]))
  const totalH = Math.max(r32Y(15) + CARD_H, trdY() + CARD_H) + 32

  const col = (num: number) => <MatchCard match={map.get(num)} />

  // Label for upcoming match date (tooltip-style tiny text below card)
  function dateLabel(num: number) {
    const m = map.get(num)
    if (!m || m.status === 'finished') return null
    return (
      <div className="text-[9px] text-muted-foreground/70 text-center mt-0.5 truncate" style={{ width: CARD_W }}>
        {formatPeruTime(m.match_date)}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto overflow-y-auto pb-4" style={{ maxHeight: '80vh' }}>
      <div style={{ position: 'relative', width: TOTAL_W, height: totalH }}>

        {/* SVG connector lines */}
        <BracketSVG />

        {/* ── Column headers ── */}
        <ColHeader x={CX.r32} label="Dieciseisavos" />
        <ColHeader x={CX.r16} label="Octavos" />
        <ColHeader x={CX.qf}  label="Cuartos" />
        <ColHeader x={CX.sf}  label="Semis" />
        <ColHeader x={CX.fin} label="Final" />

        {/* ── R32 (16 matches, 8 pairs) ── */}
        {R32.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: r32Y(i), left: CX.r32 }}>
            {col(num)}
            {dateLabel(num)}
          </div>
        ))}

        {/* ── R16 (8 matches) ── */}
        {R16.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: r16Y(i), left: CX.r16 }}>
            {col(num)}
            {dateLabel(num)}
          </div>
        ))}

        {/* ── QF (4 matches) ── */}
        {QF.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: qfY(i), left: CX.qf }}>
            {col(num)}
            {dateLabel(num)}
          </div>
        ))}

        {/* ── SF (2 matches) ── */}
        {SF.map((num, i) => (
          <div key={num} style={{ position: 'absolute', top: sfY(i), left: CX.sf }}>
            {col(num)}
            {dateLabel(num)}
          </div>
        ))}

        {/* ── Final ── */}
        <div style={{ position: 'absolute', top: finY(), left: CX.fin }}>
          <div className="mb-0.5 flex items-center justify-center gap-1">
            <Trophy className="h-2.5 w-2.5 text-yellow-500" />
            <span className="text-[9px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Gran Final</span>
          </div>
          {col(FIN)}
        </div>

        {/* ── 3rd place ── */}
        <div style={{ position: 'absolute', top: trdY(), left: CX.fin }}>
          <div className="mb-0.5 flex items-center justify-center">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">3er Puesto</span>
          </div>
          {col(TRD)}
        </div>
      </div>
    </div>
  )
}
