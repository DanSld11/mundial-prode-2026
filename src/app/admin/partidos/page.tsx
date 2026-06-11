'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TeamFlag } from '@/components/team-flag'
import { formatPeruShortDateTime } from '@/lib/peru-time'
import { updateMatchResultAction } from '../actions'
import { toast } from 'sonner'
import { CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

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
      supabase.from('players').select('*, team:teams(id,name_es,code,flag_emoji)').eq('active', true).order('name').limit(2000),
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
    if (result.error) { toast.error(result.error); return }
    toast.success(`Resultado guardado · ${homeScore} - ${awayScore}`)
    setMatches((prev) => prev.map((m) => m.id === match.id ? { ...m, home_score: homeScore, away_score: awayScore, status: 'finished', predictions_locked: true } : m))
    setScorerMap((prev) => { const next = new Map(prev); next.set(match.id, new Set(selectedScorerIds)); return next })
  }

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando partidos...</div>

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Gestión de Partidos</h2>
        <p className="text-sm text-muted-foreground">Cargá resultados para calcular puntos. Horarios en Hora Perú.</p>
      </div>
      <div className="space-y-3">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            players={players}
            initialScorers={scorerMap.get(match.id) ?? new Set()}
            saving={saving === match.id}
            onSave={handleSave}
          />
        ))}
      </div>
    </div>
  )
}

function MatchCard({
  match, players, initialScorers, saving, onSave,
}: {
  match: any; players: any[]; initialScorers: Set<string>; saving: boolean
  onSave: (match: any, home: number, away: number, scorers: string[]) => void
}) {
  const [homeScore, setHomeScore] = useState<number>(match.home_score ?? 0)
  const [awayScore, setAwayScore] = useState<number>(match.away_score ?? 0)
  const [selectedScorers, setSelectedScorers] = useState<Set<string>>(new Set(initialScorers))
  const [showScorers, setShowScorers] = useState(false)

  const matchPlayers = players.filter((p) => p.team_id === match.home_team_id || p.team_id === match.away_team_id)

  function toggleScorer(id: string) {
    setSelectedScorers((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
      {/* Fila superior: nro, grupo, estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">#{match.match_number}</span>
          <Badge variant="outline" className="text-xs">Grupo {match.group_name}</Badge>
          <span className="text-xs text-muted-foreground">{formatPeruShortDateTime(match.match_date)}</span>
        </div>
        {match.status === 'finished'
          ? <Badge className="bg-green-600 text-white text-xs gap-1"><CheckCircle2 className="h-3 w-3" />Finalizado</Badge>
          : <Badge variant="outline" className="text-xs">Pendiente</Badge>}
      </div>

      {/* Equipos y marcador */}
      <div className="flex items-center gap-2">
        {/* Local */}
        <div className="flex flex-1 items-center gap-2 min-w-0 justify-end">
          <span className="text-sm font-semibold truncate text-right">{match.home_team?.name_es}</span>
          <TeamFlag code={match.home_team?.flag_emoji} label={match.home_team?.name_es} />
        </div>
        {/* Scores */}
        <div className="flex items-center gap-1 shrink-0">
          <Input type="number" min={0} max={20} value={homeScore}
            onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
            className="w-12 h-10 text-center text-base font-bold p-0" />
          <span className="text-sm font-bold text-muted-foreground px-0.5">-</span>
          <Input type="number" min={0} max={20} value={awayScore}
            onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
            className="w-12 h-10 text-center text-base font-bold p-0" />
        </div>
        {/* Visitante */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <TeamFlag code={match.away_team?.flag_emoji} label={match.away_team?.name_es} />
          <span className="text-sm font-semibold truncate">{match.away_team?.name_es}</span>
        </div>
      </div>

      {/* Goleadores colapsable */}
      {matchPlayers.length > 0 && (
        <div>
          <button onClick={() => setShowScorers((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            {showScorers ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            Goleadores {selectedScorers.size > 0 && `· ${selectedScorers.size} seleccionado${selectedScorers.size !== 1 ? 's' : ''}`}
          </button>
          {showScorers && (
            <div className="mt-2 grid grid-cols-2 gap-1 max-h-40 overflow-y-auto rounded-lg border p-2 bg-muted/30">
              {matchPlayers.map((player) => (
                <label key={player.id} className="flex items-center gap-1.5 cursor-pointer text-xs hover:bg-muted rounded px-1 py-0.5">
                  <input type="checkbox" checked={selectedScorers.has(player.id)} onChange={() => toggleScorer(player.id)} className="h-3.5 w-3.5 shrink-0" />
                  <span className={`font-mono text-[10px] shrink-0 ${player.team_id === match.home_team_id ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {player.team_id === match.home_team_id ? match.home_team?.code : match.away_team?.code}
                  </span>
                  <span className="truncate">{player.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botón guardar */}
      <Button size="sm" disabled={saving}
        variant={match.status === 'finished' ? 'outline' : 'default'}
        className={`w-full h-10 text-sm font-semibold ${match.status !== 'finished' ? 'bg-brand-red hover:bg-red-700 text-white' : ''}`}
        onClick={() => onSave(match, homeScore, awayScore, Array.from(selectedScorers))}>
        {saving
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : match.status === 'finished' ? 'Actualizar resultado' : 'Guardar resultado'}
      </Button>
    </div>
  )
}
