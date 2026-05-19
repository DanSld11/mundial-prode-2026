import { createServerSupabaseClient } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Match, Team } from '@/types'
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
                      {match.status === 'finished' ? (
                        <span className="font-bold text-lg">
                          {match.home_score} - {match.away_score}
                        </span>
                      ) : (
                        <form
                          action="/admin/update-result"
                          method="post"
                          className="flex items-center gap-1 justify-center"
                        >
                          <input type="hidden" name="match_id" value={match.id} />
                          <Input
                            name="home_score"
                            type="number"
                            min={0}
                            max={20}
                            defaultValue={0}
                            className="w-12 h-8 text-center p-0"
                            required
                          />
                          <span className="text-xs">-</span>
                          <Input
                            name="away_score"
                            type="number"
                            min={0}
                            max={20}
                            defaultValue={0}
                            className="w-12 h-8 text-center p-0"
                            required
                          />
                          <Button type="submit" size="sm" variant="outline" className="h-7 text-xs ml-2">
                            Guardar
                          </Button>
                        </form>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} />
                        <span className="text-sm">{match.away_team?.name_es}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {match.status === 'finished' ? (
                        <Badge className="bg-green-600">Finalizado</Badge>
                      ) : (
                        <Badge variant="outline">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {match.status === 'finished' && (
                        <span className="text-xs text-green-600">✓ Guardado</span>
                      )}
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
