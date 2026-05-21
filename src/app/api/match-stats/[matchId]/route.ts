import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/server-client'

export async function GET(_req: NextRequest, { params }: { params: { matchId: string } }) {
  try {
    const admin = createServiceRoleClient()

    const [matchRes, predsRes] = await Promise.all([
      admin.from('matches').select('status, home_score, away_score').eq('id', params.matchId).single(),
      admin.from('predictions')
        .select('predicted_outcome, predicted_scorer_id, predicted_home_score, predicted_away_score')
        .eq('match_id', params.matchId),
    ])

    if (matchRes.error || !matchRes.data) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    const preds = predsRes.data ?? []
    const total = preds.length

    if (total === 0) {
      return NextResponse.json({ total: 0, outcomes: {}, scorers: [], exactScores: 0 })
    }

    // Aggregate outcomes
    const outcomeCounts: Record<string, number> = { home: 0, draw: 0, away: 0 }
    const scorerCounts: Record<string, number> = {}
    let exactScores = 0

    for (const p of preds) {
      if (p.predicted_outcome) outcomeCounts[p.predicted_outcome] = (outcomeCounts[p.predicted_outcome] ?? 0) + 1
      if (p.predicted_scorer_id) scorerCounts[p.predicted_scorer_id] = (scorerCounts[p.predicted_scorer_id] ?? 0) + 1
      if (
        matchRes.data.status === 'finished' &&
        p.predicted_home_score === matchRes.data.home_score &&
        p.predicted_away_score === matchRes.data.away_score
      ) exactScores++
    }

    // Top 5 scorers
    const topScorerIds = Object.entries(scorerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }))

    // Resolve scorer names
    let scorers: { id: string; name: string; count: number }[] = []
    if (topScorerIds.length > 0) {
      const { data: players } = await admin
        .from('players')
        .select('id, name')
        .in('id', topScorerIds.map((s) => s.id))
      const playerMap = new Map((players ?? []).map((p) => [p.id, p.name]))
      scorers = topScorerIds.map((s) => ({ id: s.id, name: playerMap.get(s.id) ?? '?', count: s.count }))
    }

    return NextResponse.json({
      total,
      outcomes: {
        home: outcomeCounts.home ?? 0,
        draw: outcomeCounts.draw ?? 0,
        away: outcomeCounts.away ?? 0,
      },
      scorers,
      exactScores,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
