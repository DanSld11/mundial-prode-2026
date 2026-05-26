'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Table2, Medal, Wifi, Info } from 'lucide-react'
import { createAnonClient } from '@/lib/auth-client'
import { cacheGet, cacheSet } from '@/lib/local-cache'

const CACHE_KEY = 'tabla:leaderboard'

async function fetchLeaderboard(supabase: ReturnType<typeof createAnonClient>) {
  const { data } = await supabase.from('leaderboard').select('*').order('position')
  return data ?? []
}

export default function TablaPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liveIndicator, setLiveIndicator] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const cached = cacheGet<any[]>(CACHE_KEY)
    if (cached) { setEntries(cached); setLoading(false) }

    const supabase = createAnonClient()

    fetchLeaderboard(supabase).then((d) => {
      setEntries(d)
      setLoading(false)
      setLastUpdated(new Date())
      cacheSet(CACHE_KEY, d, 2 * 60_000)
    })

    // Realtime: subscribe to profile point changes
    const channel = supabase
      .channel('leaderboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        setLiveIndicator(true)
        fetchLeaderboard(supabase).then((d) => {
          setEntries(d)
          setLastUpdated(new Date())
          cacheSet(CACHE_KEY, d, 2 * 60_000)
          setTimeout(() => setLiveIndicator(false), 2000)
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bebas text-3xl tracking-wide sm:text-4xl">Tabla de Posiciones</h1>
              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${liveIndicator ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                <Wifi className="h-2.5 w-2.5" />
                {liveIndicator ? 'Actualizando...' : 'En vivo'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}` : 'Ranking de jugadores'}
            </p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <h3 className="font-semibold text-muted-foreground">Aún no hay jugadores</h3>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-3">
          {/* Breakdown info */}
          <div className="flex items-start gap-2 rounded-xl border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              <strong>Aciertos</strong> muestra cuántos resultados de partido predijiste correctamente.
              {' '}<strong>Grupos</strong> y <strong>Especiales</strong> se activarán cuando se puntúen los pronósticos del torneo.
            </span>
          </div>

        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Pos</TableHead>
                  <TableHead>Jugador</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Aciertos</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Grupos</TableHead>
                  <TableHead className="text-center hidden md:table-cell">Especiales</TableHead>
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
                        <div>
                          <span className="font-semibold text-sm">{e.username}</span>
                          {idx === 0 && <span className="ml-1 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">líder</span>}
                          <p className="text-[10px] text-muted-foreground sm:hidden">
                            {e.predictions_correct} aciertos · {e.exact_scores} exactos
                          </p>
                        </div>
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
                    <TableCell className="text-center hidden md:table-cell tabular-nums text-sm font-medium">{e.predictions_correct}</TableCell>
                    <TableCell className="text-center hidden md:table-cell text-xs text-muted-foreground">—</TableCell>
                    <TableCell className="text-center hidden md:table-cell text-xs text-muted-foreground">—</TableCell>
                    <TableCell className="text-center hidden sm:table-cell tabular-nums text-sm">{e.exact_scores}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}
