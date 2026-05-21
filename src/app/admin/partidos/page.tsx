'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { updateMatchResultAction } from '../actions'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function AdminPartidosPage() {
  const [matches, setMatches] = useState<any[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [scorerMap, setScorerMap] = useState<Map<string, Set<string>>>(new Map())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    Promise.all([
      supabase.from('matches').select(`*, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji,code), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji,code)`).order('match_date', { ascending: true }),
      supabase.from('players').select('*, team:teams(id,name_es,code,flag_emoji)').eq('active', true).order('name'),
      supabase.from('match_goal_scorers').select('match_id, player_id'),
    ]).then(([m, p, s]) => {
      setMatches(m.data ?? [])
      setPlayers(p.data ?? [])
      const map = new Map<string, Set<string>>()
      ;(s.data ?? []).forEach((row: any) => {
        if (!map.has(row.match_id)) map.set(row.match_id, new Set())
        map.get(row.match_id)!.add(row.player_id)
      })
      setScorerMap(map)
      setLoading(false)
    })
  }, [])

  async function handleSave(match: any, homeScore: number, awayScore: number, selectedScorerIds: string[]) {
    setSaving(match.id)
    const fd = new FormData()
    fd.append('match_id', match.id)
    fd.append('home_score', String(homeScore))
    fd.append('away_score', String(awayScore))
    selectedScorerIds.forEach((id) => fd.append('scorer_ids', id))

    const result = await updateMatchResultAction(fd)
    setSaving(null)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(`Resultado guardado · ${homeScore} - ${awayScore} · puntos calculados`)

    // Actualizar estado local sin recargar
    setMatches((prev) =>
      prev.map((m) =>
        m.id === match.id
          ? { ...m, home_score: homeScore, away_score: awayScore, status: 'finished', predictions_locked: true }
          : m
      )
    )
    setScorerMap((prev) => {
      const next = new Map(prev)
      next.set(match.id, new Set(selectedScorerIds))
      return next
    })
  }

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando partidos...</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Gestión de Partidos</h2>
        <p className="text-sm text-muted-foreground">
          Cargá resultados para calcular puntos automáticamente. Horarios en Hora Perú.
        </p>
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
                  <MatchRow
                    key={match.id}
                    match={match}
                    players={players}
                    initialScorers={scorerMap.get(match.id) ?? new Set()}
                    saving={saving === match.id}
                    onSave={handleSave}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MatchRow({
  match,
  players,
  initialScorers,
  saving,
  onSave,
}: {
  match: any
  players: any[]
  initialScorers: Set<string>
  saving: boolean
  onSave: (match: any, home: number, away: number, scorers: string[]) => void
}) {
  const [homeScore, setHomeScore] = useState<number>(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState<number>(match.away_score ?? 0)
  const [selectedScorers, setSelectedScorers] = useState<Set<string>>(new Set(initialScorers))
  const selectRef = useRef<HTMLSelectElement>(null)

  const matchPlayers = players.filter(
    (p) => p.team_id === match.home_team_id || p.team_id === match.away_team_id
  )

  function toggleScorer(playerId: string) {
    setSelectedScorers((prev) => {
      const next = new Set(prev)
      if (next.has(playerId)) next.delete(playerId)
      else next.add(playerId)
      return next
    })
  }

  return (
    <TableRow>
      <TableCell className="text-xs text-muted-foreground">{match.match_number}</TableCell>
      <TableCell className="text-xs whitespace-nowrap">
        {formatPeruShortDateTime(match.match_date)}
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
        <div className="flex items-center gap-1 justify-center">
          <Input
            type="number"
            min={0}
            max={20}
            value={homeScore}
            onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
            className="w-12 h-8 text-center p-0"
          />
          <span className="text-xs">-</span>
          <Input
            type="number"
            min={0}
            max={20}
            value={awayScore}
            onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
            className="w-12 h-8 text-center p-0"
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} />
          <span className="text-sm">{match.away_team?.name_es}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 min-w-48 max-h-24 overflow-y-auto">
          {matchPlayers.length === 0 ? (
            <span className="text-xs text-muted-foreground">Sin jugadores cargados</span>
          ) : (
            matchPlayers.map((player) => (
              <label key={player.id} className="flex items-center gap-2 cursor-pointer text-xs hover:bg-muted/50 rounded px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={selectedScorers.has(player.id)}
                  onChange={() => toggleScorer(player.id)}
                  className="h-3 w-3"
                />
                <span className={`text-[10px] font-mono ${player.team_id === match.home_team_id ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {player.team_id === match.home_team_id ? match.home_team?.code : match.away_team?.code}
                </span>
                {player.shirt_number && <span className="text-muted-foreground">#{player.shirt_number}</span>}
                {player.name}
              </label>
            ))
          )}
        </div>
      </TableCell>
      <TableCell>
        {match.status === 'finished' ? (
          <Badge className="bg-green-600 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Finalizado
          </Badge>
        ) : (
          <Badge variant="outline">Pendiente</Badge>
        )}
      </TableCell>
      <TableCell>
        <Button
          size="sm"
          variant={match.status === 'finished' ? 'outline' : 'default'}
          className={match.status !== 'finished' ? 'bg-brand-red hover:bg-red-700 text-white h-7 text-xs' : 'h-7 text-xs'}
          disabled={saving}
          onClick={() => onSave(match, homeScore, awayScore, Array.from(selectedScorers))}
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : match.status === 'finished' ? 'Actualizar' : 'Guardar'}
        </Button>
      </TableCell>
    </TableRow>
  )
}
