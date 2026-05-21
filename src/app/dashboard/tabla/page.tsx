'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Table2, Medal } from 'lucide-react'
import { createAnonClient } from '@/lib/auth-client'
import { cacheGet, cacheSet } from '@/lib/local-cache'

const CACHE_KEY = 'tabla:leaderboard'

export default function TablaPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = cacheGet<any[]>(CACHE_KEY)
    if (cached) { setEntries(cached); setLoading(false) }

    const supabase = createAnonClient()
    supabase.from('leaderboard').select('*').order('position').then(({ data }) => {
      const d = data ?? []
      setEntries(d)
      setLoading(false)
      cacheSet(CACHE_KEY, d, 2 * 60_000) // 2 min cache
    })
  }, [])

  if (loading) return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-muted/60" />
          <div className="space-y-2"><div className="h-5 w-40 rounded bg-muted/60" /><div className="h-3 w-32 rounded bg-muted/60" /></div>
        </div>
      </div>
      <div className="mx-auto max-w-4xl rounded-xl border bg-card shadow-sm overflow-hidden">
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} className="flex items-center gap-3 border-b px-4 py-3 animate-pulse">
            <div className="h-7 w-7 rounded-full bg-muted/60" />
            <div className="h-4 flex-1 max-w-[160px] rounded bg-muted/60" />
            <div className="ml-auto h-5 w-14 rounded bg-muted/60" />
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-5 sm:space-y-7">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <Table2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Tabla de Posiciones</h1>
            <p className="text-sm text-muted-foreground">Ranking de jugadores</p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <h3 className="font-semibold text-muted-foreground">Aún no hay jugadores</h3>
        </div>
      ) : (
        <Card className="mx-auto max-w-4xl overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Pos</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">Pts</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Aciertos</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Exactos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e, idx) => (
                  <TableRow
                    key={e.id}
                    className="transition-colors"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <TableCell>
                      {e.position === 1 ? <Medal className="h-5 w-5 text-yellow-500 drop-shadow" /> :
                       e.position === 2 ? <Medal className="h-5 w-5 text-gray-400" /> :
                       e.position === 3 ? <Medal className="h-5 w-5 text-amber-700" /> :
                       <span className="text-muted-foreground font-mono">{e.position}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                          {e.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{e.username}</span>
                        {idx === 0 && <span className="ml-1 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">líder</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-sm font-bold tabular-nums ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                        idx === 1 ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                        idx === 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        'bg-muted text-muted-foreground'
                      }`}>{e.total_points}</span>
                    </TableCell>
                    <TableCell className="text-center hidden sm:table-cell tabular-nums text-sm">{e.predictions_correct}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell tabular-nums text-sm">{e.exact_scores}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
