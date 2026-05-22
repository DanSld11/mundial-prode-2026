'use client'

import { useEffect, useState } from 'react'
import { createAnonClient } from '@/lib/auth-client'
import { Zap } from 'lucide-react'

interface ActivityItem {
  id: string
  username: string
  home_name: string
  away_name: string
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
  scored_at: string
}

function activityText(item: ActivityItem): { text: string; emoji: string } {
  if (item.is_exact_score) {
    return {
      text: `acertó el marcador exacto del ${item.home_code} vs ${item.away_code}`,
      emoji: '🔥',
    }
  }
  if (item.outcome_points > 0) {
    return {
      text: `acertó el resultado del ${item.home_code} vs ${item.away_code}`,
      emoji: '✅',
    }
  }
  return {
    text: `sumó puntos en ${item.home_code} vs ${item.away_code}`,
    emoji: '⚽',
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

export function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createAnonClient()
    supabase
      .from('activity_feed')
      .select('*')
      .order('scored_at', { ascending: false })
      .limit(15)
      .then(({ data }) => {
        setItems(data ?? [])
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
              <div className="h-3 w-1/3 rounded bg-muted/60" />
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
      {items.map((item) => {
        const { text, emoji } = activityText(item)
        const initial = item.username?.charAt(0).toUpperCase() ?? '?'
        return (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate">
                <span className="font-semibold">{item.username}</span>{' '}
                <span className="text-muted-foreground">{text}</span>{' '}
                <span>{emoji}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                {item.home_score}–{item.away_score} · {timeAgo(item.scored_at)}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
              +{item.points_earned}
            </span>
          </div>
        )
      })}
    </div>
  )
}
