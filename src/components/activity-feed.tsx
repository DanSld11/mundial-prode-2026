'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createAnonClient } from '@/lib/auth-client'

interface MatchItem {
  kind: 'match'
  id: string
  username: string
  home_code: string
  away_code: string
  home_flag: string
  away_flag: string
  home_score: number
  away_score: number
  predicted_home_score: number | null
  predicted_away_score: number | null
  points_earned: number
  is_exact_score: boolean
  outcome_points: number
  scorer_points: number
  exact_score_points: number
  predicted_scorer_name: string | null
  scored_at: string
}

interface RuletaItem {
  kind: 'ruleta'
  id: string
  username: string
  result_label: string
  result_type: string
  points_change: number
  coins_spent: number
  is_free_retry: boolean
  created_at: string
}

interface GroupItem {
  kind: 'group'
  user_id: string
  username: string
  group_name: string
  group_points: number
  positions_correct: number
  scored_at: string
}

type ActivityItem = MatchItem | RuletaItem | GroupItem

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

function MatchCard({ item }: { item: MatchItem }) {
  const initial = item.username?.charAt(0).toUpperCase() ?? '?'
  const emoji = item.is_exact_score ? '🔥' : item.outcome_points > 0 ? '✅' : '⚽'

  const chips: { label: string; pts: number; color: string }[] = []
  if (item.outcome_points > 0)
    chips.push({ label: 'Ganador', pts: item.outcome_points, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' })
  if ((item.scorer_points ?? 0) > 0)
    chips.push({ label: item.predicted_scorer_name ?? 'Goleador', pts: item.scorer_points, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' })
  if (item.is_exact_score)
    chips.push({ label: `${item.predicted_home_score}–${item.predicted_away_score}`, pts: item.exact_score_points ?? 0, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' })

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold mt-0.5">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate">
          <span className="font-semibold">{item.username}</span>
          <span className="text-muted-foreground"> · {item.home_code} vs {item.away_code}</span>
          {' '}<span>{emoji}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {chips.map((chip, i) => (
            <span key={i} className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${chip.color}`}>
              {chip.label}
              <span className="opacity-70 font-bold">+{chip.pts}</span>
            </span>
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">
            {item.home_score}–{item.away_score} · {timeAgo(item.scored_at)}
          </span>
        </div>
      </div>
      <span className="mt-0.5 shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
        +{item.points_earned}
      </span>
    </div>
  )
}

function GroupActivityCard({ item }: { item: GroupItem }) {
  const initial = item.username?.charAt(0).toUpperCase() ?? '?'
  const hasPoints = item.group_points > 0

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mt-0.5">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate">
          <span className="font-semibold">{item.username}</span>
          <span className="text-muted-foreground"> · Grupo {item.group_name} </span>
          <span>{hasPoints ? '🏆' : '⚽'}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          {item.positions_correct > 0 && (
            <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800">
              {item.positions_correct} {item.positions_correct === 1 ? 'pos. acertada' : 'pos. acertadas'}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground ml-1">
            Pronósticos de grupo · {timeAgo(item.scored_at)}
          </span>
        </div>
      </div>
      {hasPoints && (
        <span className="mt-0.5 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
          +{item.group_points}
        </span>
      )}
    </div>
  )
}

function RuletaCard({ item }: { item: RuletaItem }) {
  const initial = item.username?.charAt(0).toUpperCase() ?? '?'
  const isGain    = item.points_change > 0
  const isLoss    = item.points_change < 0
  const isRetry   = item.result_type === 'retry'
  const isNothing = item.result_type === 'nothing'

  const emoji = isRetry ? '🔄' : isNothing ? '🍍' : isGain ? '🎰' : '😬'

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold mt-0.5">
        {initial}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate">
          <span className="font-semibold">{item.username}</span>
          <span className="text-muted-foreground"> · Ruleta </span>
          <span>{emoji}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
            isGain    ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800'
            : isLoss  ? 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/30 dark:border-red-800'
            : isRetry ? 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/30 dark:border-blue-800'
                      : 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800'
          }`}>
            {item.result_label}
          </span>
          <span className="text-[10px] text-muted-foreground ml-1">
            {item.is_free_retry ? 'gratis' : `${item.coins_spent} coins`} · {timeAgo(item.created_at)}
          </span>
        </div>
      </div>
      {item.points_change !== 0 && (
        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
          isGain
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
        }`}>
          {isGain ? '+' : ''}{item.points_change}
        </span>
      )}
    </div>
  )
}

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createAnonClient()
    Promise.all([
      supabase.from('activity_feed').select('*').order('scored_at', { ascending: false }).limit(15),
      supabase.from('ruleta_activity').select('*').order('created_at', { ascending: false }).limit(15),
      supabase.from('group_scoring_activity').select('*').order('scored_at', { ascending: false }).limit(30),
    ]).then(([matchRes, ruletaRes, groupRes]) => {
      const matchItems: MatchItem[] = (matchRes.data ?? []).map((d: any) => ({ kind: 'match', ...d }))
      const ruletaItems: RuletaItem[] = (ruletaRes.data ?? []).map((d: any) => ({ kind: 'ruleta', ...d }))
      const groupItems: GroupItem[] = (groupRes.data ?? []).map((d: any) => ({ kind: 'group', ...d }))

      const merged: ActivityItem[] = [...matchItems, ...ruletaItems, ...groupItems].sort((a, b) => {
        const ta = a.kind === 'match' ? a.scored_at : a.kind === 'group' ? a.scored_at : a.created_at
        const tb = b.kind === 'match' ? b.scored_at : b.kind === 'group' ? b.scored_at : b.created_at
        return new Date(tb).getTime() - new Date(ta).getTime()
      }).slice(0, 25)

      setItems(merged)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 animate-pulse">
            <div className="h-7 w-7 rounded-full bg-muted/60 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Aún no hay actividad. ¡Sé el primero en acertar un partido!
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {items.map((item) =>
        item.kind === 'match'
          ? <MatchCard key={`m-${item.id}`} item={item} />
          : item.kind === 'group'
          ? <GroupActivityCard key={`g-${item.user_id}-${item.group_name}`} item={item} />
          : <RuletaCard key={`r-${item.id}`} item={item} />
      )}
      <Link
        href="/dashboard/actividad"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed bg-muted/20 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        Ver toda la actividad →
      </Link>
    </div>
  )
}
