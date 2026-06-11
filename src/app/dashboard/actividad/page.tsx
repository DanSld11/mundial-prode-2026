'use client'

import { useCallback, useEffect, useState } from 'react'
import { createAnonClient } from '@/lib/auth-client'
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 15

interface ActivityItem {
  id: string
  username: string
  home_name: string
  away_name: string
  home_code: string
  away_code: string
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `hace ${days}d`
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function matchEmoji(item: ActivityItem) {
  if (item.is_exact_score) return '🔥'
  if (item.outcome_points > 0) return '✅'
  return '⚽'
}

export default function ActividadPage() {
  const [items, setItems]     = useState<ActivityItem[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    const supabase = createAnonClient()
    const from = p * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    const [{ data }, { count }] = await Promise.all([
      supabase
        .from('activity_feed')
        .select('*')
        .order('scored_at', { ascending: false })
        .range(from, to),
      supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true }),
    ])

    setItems(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(0) }, [load])

  function goTo(p: number) {
    setPage(p)
    load(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-5 pb-10">

      {/* Header */}
      <div className="flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-red text-white">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Actividad</h1>
          <p className="text-sm text-muted-foreground">
            Todos los aciertos del torneo · {total} registros
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-1.5">
        {loading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 animate-pulse">
              <div className="h-7 w-7 rounded-full bg-muted/60 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-3/4 rounded bg-muted/60" />
                <div className="h-3 w-1/2 rounded bg-muted/60" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="rounded-xl border bg-card py-16 text-center text-sm text-muted-foreground">
            Aún no hay actividad registrada.
          </div>
        ) : (
          items.map((item) => {
            const initial = item.username?.charAt(0).toUpperCase() ?? '?'
            const emoji   = matchEmoji(item)

            const chips: { label: string; pts: number; color: string }[] = []
            if (item.outcome_points > 0)
              chips.push({ label: 'Ganador', pts: item.outcome_points, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' })
            if ((item.scorer_points ?? 0) > 0)
              chips.push({ label: item.predicted_scorer_name ?? 'Goleador', pts: item.scorer_points, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' })
            if (item.is_exact_score)
              chips.push({ label: `${item.predicted_home_score}–${item.predicted_away_score}`, pts: item.exact_score_points ?? 0, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' })

            return (
              <div key={item.id} className="flex items-start gap-3 rounded-xl border bg-card px-4 py-2.5 text-sm">
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
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goTo(page - 1)}
            disabled={page === 0 || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-8 min-w-[2rem] rounded-lg px-2 text-sm font-semibold transition-colors ${
                i === page
                  ? 'bg-brand-red text-white'
                  : 'border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages - 1 || loading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
