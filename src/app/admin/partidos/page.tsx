import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Match, Player, Team } from '@/types'
import { TeamFlag } from '@/components/team-flag'

interface MatchWithTeams extends Omit<Match, 'home_team' | 'away_team'> {
  home_team: Pick<Team, 'name_es' | 'flag_emoji' | 'code'> | null
  away_team: Pick<Team, 'name_es' | 'flag_emoji' | 'code'> | null
}

export default async function AdminPartidosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(name_es, flag_emoji, code),
      away_team:teams!matches_away_team_id_fkey(name_es, flag_emoji, code)
    `)
    .order('match_date', { ascending: true })

  const matches = (matchesData ?? []) as unknown as MatchWithTeams[]
  const { data: playersData } = await supabase
    .from('players')
    .select('*, team:teams(id,name_es,code,flag_emoji)')
    .eq('active', true)
    .order('name')

  const { data: scorersData } = await supabase
    .from('match_goal_scorers')
    .select('match_id, player_id')

  const players = (playersData ?? []) as unknown as Player[]
  const scorerMap = new Map<string, Set<string>>()
  ;(scorersData ?? []).forEach((row: any) => {
    if (!scorerMap.has(row.match_id)) scorerMap.set(row.match_id, new Set())
    scorerMap.get(row.match_id)?.add(row.player_id)
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Gestión de Partidos</h2>
        <p className="text-muted-foreground">Carga resultados para calcular puntos automáticamente.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead className="text-center">Resultado</TableHead>
                    <TableHead>Visitante</TableHead>
                    <TableHead>Goleadores</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="text-xs text-muted-foreground">{match.match_number}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(match.match_date), 'dd/MM HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{match.group_name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TeamFlag code={match.home_team?.flag_emoji} label={match.home_team?.name_es} />
                        <span className="text-sm">{match.home_team?.name_es}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <form id={`result-${match.id}`} action="/admin/update-result" method="post" className="flex items-center gap-1 justify-center">
                        <input type="hidden" name="match_id" value={match.id} />
                        <Input
                          name="home_score"
                          type="number"
                          min={0}
                          max={20}
                          defaultValue={match.home_score ?? 0}
                          className="w-12 h-8 text-center p-0"
                          required
                        />
                        <span className="text-xs">-</span>
                        <Input
                          name="away_score"
                          type="number"
                          min={0}
                          max={20}
                          defaultValue={match.away_score ?? 0}
                          className="w-12 h-8 text-center p-0"
                          required
                        />
                      </form>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} />
                        <span className="text-sm">{match.away_team?.name_es}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <select
                        name="scorer_ids"
                        form={`result-${match.id}`}
                        multiple
                        defaultValue={Array.from(scorerMap.get(match.id) ?? [])}
                        className="h-20 min-w-48 rounded-lg border bg-background px-2 py-1 text-xs"
                      >
                        {players
                          .filter((player) => player.team_id === match.home_team_id || player.team_id === match.away_team_id)
                          .map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.team_id === match.home_team_id ? match.home_team?.code : match.away_team?.code} · {player.shirt_number ? `${player.shirt_number} ` : ''}{player.name}
                            </option>
                          ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      {match.status === 'finished' ? (
                        <Badge className="bg-green-600">Finalizado</Badge>
                      ) : (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button type="submit" form={`result-${match.id}`} size="sm" variant="outline" className="h-7 text-xs">
                        {match.status === 'finished' ? 'Actualizar' : 'Guardar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
