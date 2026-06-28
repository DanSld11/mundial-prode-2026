'use client'

import { useEffect, useMemo, useState } from 'react'
import { createAnonClient } from '@/lib/auth-client'
import { Swords, Trophy } from 'lucide-react'
import { formatPeruDateLabel, formatPeruTime } from '@/lib/peru-time'

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
  scorers: GoalScorer[]
}

const STAGE_LABEL: Record<string, string> = {
  group:        'Grupo',
  round_of_32:  'Dieciseisavos',
  round_of_16:  'Octavos',
  quarterfinal: 'Cuartos',
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
  return formatPeruDateLabel(dateStr)
}

export function PoolMatchResults() {
  const supabase = useMemo(() => createAnonClient(), [])
  const [matches, setMatches] = useState<FinishedMatch[]>([])
  const [loading, setLoading] = useState(true)

  async function loadFinishedMatches() {
    const { data: matchData } = await supabase
      .from('matches')
      .select(`
        id, match_number, stage, match_date, home_score, away_score,
        home_team:teams!matches_home_team_id_fkey(id, name_es, flag_emoji),
        away_team:teams!matches_away_team_id_fkey(id, name_es, flag_emoji)
      `)
      .eq('status', 'finished')
      .order('match_date', { ascending: false })
      .limit(20)

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

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-4 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded mb-3" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-8 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <Swords className="h-9 w-9 text-muted-foreground/30 mb-3" />
        <p className="text-sm font-semibold text-muted-foreground">Aún no hay partidos terminados</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Los resultados aparecerán aquí en tiempo real.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const homeWon = match.home_score > match.away_score
        const awayWon = match.away_score > match.home_score
        const homeScorers = match.scorers.filter((s) => s.player?.team_id === match.home_team?.id)
        const awayScorers = match.scorers.filter((s) => s.player?.team_id === match.away_team?.id)

        return (
          <div key={match.id} className="rounded-xl border bg-card overflow-hidden shadow-sm">
            {/* Meta bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {STAGE_LABEL[match.stage] ?? match.stage}
                </span>
                {match.stage === 'final' && <Trophy className="h-3 w-3 text-yellow-500" />}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {timeAgo(match.match_date)} · {formatPeruTime(match.match_date)}
              </span>
            </div>

            {/* Score row */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                {/* Home */}
                <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${homeWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                  <span className="text-xl leading-none">{match.home_team?.flag_emoji}</span>
                  <span className={`text-sm font-bold truncate leading-tight ${homeWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {match.home_team?.name_es}
                  </span>
                </div>

                {/* Score */}
                <div className="text-center shrink-0 px-2">
                  <span className="text-2xl font-extrabold tabular-nums leading-none">
                    {match.home_score}
                    <span className="text-muted-foreground/40 mx-1">–</span>
                    {match.away_score}
                  </span>
                </div>

                {/* Away */}
                <div className={`flex items-center gap-2 justify-end rounded-lg px-2 py-1.5 ${awayWon ? 'bg-emerald-50 dark:bg-emerald-950/20' : ''}`}>
                  <span className={`text-sm font-bold truncate leading-tight text-right ${awayWon ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    {match.away_team?.name_es}
                  </span>
                  <span className="text-xl leading-none">{match.away_team?.flag_emoji}</span>
                </div>
              </div>

              {/* Scorers */}
              {match.scorers.length > 0 && (
                <div className="mt-2 pt-2 border-t flex flex-wrap gap-x-4 gap-y-1">
                  {homeScorers.length > 0 && (
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                      <span className="shrink-0">⚽</span>
                      <span>{homeScorers.map((s) => s.player?.name ?? '—').join(', ')}</span>
                    </div>
                  )}
                  {awayScorers.length > 0 && (
                    <div className="flex items-start gap-1 text-[11px] text-muted-foreground ml-auto text-right">
                      <span>{awayScorers.map((s) => s.player?.name ?? '—').join(', ')}</span>
                      <span className="shrink-0">⚽</span>
                    </div>
                  )}
                  {match.scorers.length > 0 && homeScorers.length === 0 && awayScorers.length === 0 && (
                    <div className="text-[11px] text-muted-foreground">
                      ⚽ {match.scorers.map((s) => s.player?.name ?? '—').join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
