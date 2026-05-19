import { createPublicServerClient } from '@/lib/server-client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table2, Trophy, Medal } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'

export default async function TablaPage() {
  const supabase = createPublicServerClient()
  const { data } = await supabase
    .from('leaderboard')
    .select('*')
    .order('position', { ascending: true })

  const entries = (data ?? []) as unknown as LeaderboardEntry[]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Table2 className="h-6 w-6 text-brand-red" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tabla de Posiciones</h1>
          <p className="text-muted-foreground">Ranking de jugadores y puntos ganados.</p>
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-brand-gold mb-3" />
          <h3 className="font-semibold">Aún no hay jugadores</h3>
          <p className="text-sm text-muted-foreground mt-1">El leaderboard se actualizará cuando los usuarios empiecen a jugar.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium">Pos</th>
                    <th className="px-4 py-3 text-left font-medium">Jugador</th>
                    <th className="px-4 py-3 text-center font-medium">Pts</th>
                    <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Acertadas</th>
                    <th className="px-4 py-3 text-center font-medium hidden sm:table-cell">Exactas</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        {entry.position === 1 && <Medal className="h-5 w-5 text-yellow-500 inline mr-1" />}
                        {entry.position === 2 && <Medal className="h-5 w-5 text-gray-400 inline mr-1" />}
                        {entry.position === 3 && <Medal className="h-5 w-5 text-amber-700 inline mr-1" />}
                        {entry.position > 3 && <span className="text-muted-foreground">{entry.position}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold">
                            {entry.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium">{entry.username}</span>
                          {entry.favorite_team && (
                            <Badge variant="outline" className="text-xs hidden sm:inline">{entry.favorite_team}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-brand-red">{entry.total_points}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">{entry.predictions_correct}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">{entry.exact_scores}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
