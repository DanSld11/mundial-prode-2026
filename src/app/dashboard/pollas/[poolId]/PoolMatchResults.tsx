'use client'

import { useEffect, useMemo, useState } from 'react'
import { createAnonClient } from '@/lib/auth-client'
import { Swords, Trophy } from 'lucide-react'
import { formatPeruTime } from '@/lib/peru-time'
import { TeamFlag } from '@/components/team-flag'

interface GoalScorer {
  player_id: string
  player?: { name: string; team_id: string }
}

interface FinishedMatch {
  id: string
  match_number: number
  stage: string
  match_date: string
  home_score: number
  away_score: number
  home_team: { name_es: string; flag_emoji: string; id: string } | null
  away_team: { name_es: string; flag_emoji: string; id: string } | null
  group_name?: string | null
  scorers: GoalScorer[]
}

const STAGE_LABEL: Record<string, string> = {
  group:        'Grupo',
  round_of_32:  'Dieciseisavos',
  round_of_16:  'Octavos',
  quarterfinal: 'Cuartos de Final',
  semifinal:    'Semifinal',
  third_place:  '3er Puesto',
  final:        'Gran Final',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  return `hace ${days}d`
}

export function PoolMatchResults() {
  const supabase = useMemo(() => createAnonClient(), [])
  const [matches, setMatches] = useState<FinishedMatch[]>([])
  const [loading, setLoading] = useState(true)

  async function loadFinishedMatches() {
    const { data: matchData } = await supabase
      .from('matches')
      .select(`
        id, match_number, stage, match_date, home_score, away_score, group_name,
        home_team:teams!matches_home_team_id_fkey(id, name_es, flag_emoji),
        away_team:teams!matches_away_team_id_fkey(id, name_es, flag_emoji)
      `)
      .eq('status', 'finished')
      .order('match_date', { ascending: false })
      .limit(30)

    if (!matchData) { setLoading(false); return }

    const matchIds = matchData.map((m: any) => m.id)
    const { data: scorerData } = await supabase
      .from('match_goal_scorers')
      .select('match_id, player_id, player:players(name, team_id)')
      .in('match_id', matchIds)

    const scorersByMatch = new Map<string, GoalScorer[]>()
    for (const s of (scorerData ?? [])) {
      const arr = scorersByMatch.get((s as any).match_id) ?? []
      arr.push(s as GoalScorer)
      scorersByMatch.set((s as any).match_id, arr)
    }

    setMatches(
      matchData.map((m: any) => ({
        ...m,
        scorers: scorersByMatch.get(m.id) ?? [],
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    loadFinishedMatches()

    const channel = supabase
      .channel('pool-results-feed')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, () => {
        loadFinishedMatches()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_goal_scorers' }, () => {
        loadFinishedMatches()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
            <div className="h-8 bg-muted/50 border-b" />
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-10 rounded bg-muted" />
                  <div className="h-4 w-20 rounded bg-muted" />
                </div>
                <div className="h-7 w-16 rounded bg-muted" />
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-7 w-10 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* ── Empty state ── */
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Swords className="h-9 w-9 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Aún no hay partidos terminados</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Los resultados aparecerán aquí en tiempo real.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const homeWon = match.home_score > match.away_score
        const awayWon = match.away_score > match.home_score
        const draw    = match.home_score === match.away_score

        const homeScorers = match.scorers.filter((s) => s.player?.team_id === match.home_team?.id)
        const awayScorers = match.scorers.filter((s) => s.player?.team_id === match.away_team?.id)

        const stageLabel = match.stage === 'group' && match.group_name
          ? `Grupo ${match.group_name}`
          : (STAGE_LABEL[match.stage] ?? match.stage)

        return (
          <div key={match.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm">

            {/* ── Meta bar ── */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {stageLabel}
                </span>
                {match.stage === 'final' && <Trophy className="h-3 w-3 text-yellow-500" />}
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {timeAgo(match.match_date)} · {formatPeruTime(match.match_date)}
              </span>
            </div>

            {/* ── Score row ── */}
            <div className="px-3 pt-3 pb-2">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">

                {/* Home team */}
                <div className={`flex items-center gap-2 rounded-xl px-2 py-2 ${homeWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                  <TeamFlag
                    code={match.home_team?.flag_emoji}
                    label={match.home_team?.name_es}
                    className="h-5 w-8 shrink-0 shadow-sm"
                  />
                  <span className={`text-sm font-bold leading-tight truncate ${
                    homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                  }`}>
                    {match.home_team?.name_es ?? '—'}
                  </span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center shrink-0 px-2">
                  <span className={`text-2xl font-extrabold tabular-nums leading-none tracking-tight ${
                    draw ? 'text-muted-foreground' : 'text-foreground'
                  }`}>
                    {match.home_score}
                    <span className="text-muted-foreground/40 mx-1 text-xl">–</span>
                    {match.away_score}
                  </span>
                </div>

                {/* Away team */}
                <div className={`flex items-center gap-2 justify-end rounded-xl px-2 py-2 ${awayWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                  <span className={`text-sm font-bold leading-tight truncate text-right ${
                    awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground'
                  }`}>
                    {match.away_team?.name_es ?? '—'}
                  </span>
                  <TeamFlag
                    code={match.away_team?.flag_emoji}
                    label={match.away_team?.name_es}
                    className="h-5 w-8 shrink-0 shadow-sm"
                  />
                </div>

              </div>
            </div>

            {/* ── Scorers row ── */}
            {match.scorers.length > 0 && (
              <div className="grid grid-cols-[1fr_auto_1fr] gap-1 px-3 pb-3">
                {/* Home scorers */}
                <div className="flex flex-wrap items-start gap-x-1 gap-y-0.5">
                  {homeScorers.map((s) => (
                    <span key={s.player_id} className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <span>⚽</span>
                      <span>{s.player?.name ?? '—'}</span>
                    </span>
                  ))}
                </div>

                {/* Spacer */}
                <div className="w-px" />

                {/* Away scorers */}
                <div className="flex flex-wrap items-start justify-end gap-x-1 gap-y-0.5">
                  {awayScorers.map((s) => (
                    <span key={s.player_id} className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <span>{s.player?.name ?? '—'}</span>
                      <span>⚽</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}
