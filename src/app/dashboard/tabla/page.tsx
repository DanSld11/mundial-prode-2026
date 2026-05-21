'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Table2, Medal } from 'lucide-react'

export default function TablaPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    supabase.from('leaderboard').select('*').order('position').then(({ data }) => {
      setEntries(data ?? [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="py-20 text-center text-muted-foreground text-sm">Cargando tabla...</div>

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
                {entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e.position === 1 ? <Medal className="h-5 w-5 text-yellow-500" /> :
                       e.position === 2 ? <Medal className="h-5 w-5 text-gray-400" /> :
                       e.position === 3 ? <Medal className="h-5 w-5 text-amber-700" /> :
                       <span className="text-muted-foreground">{e.position}</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold">
                          {e.username?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm">{e.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-bold text-lg tabular-nums">{e.total_points}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell tabular-nums">{e.predictions_correct}</TableCell>
                    <TableCell className="text-center hidden sm:table-cell tabular-nums">{e.exact_scores}</TableCell>
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
