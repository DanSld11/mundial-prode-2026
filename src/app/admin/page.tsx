'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { seedTeamsAction, seedMatchesAction, seedPlayersAction, recalculateAllPointsAction } from './actions'
import { createAnonClient } from '@/lib/auth-client'
import { formatPeruLongDateTime } from '@/lib/peru-time'
import { Trophy, RefreshCw, Users, ShieldCheck, Database, CalendarDays, Coins, Activity, TrendingUp, BookOpen } from 'lucide-react'

export default function AdminPage() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [loadingRecalc, setLoadingRecalc] = useState(false)
  const [recentMatches, setRecentMatches] = useState<any[]>([])

  useEffect(() => {
    const supabase = createAnonClient()
    supabase
      .from('matches')
      .select('id, status, home_score, away_score, updated_at, group_name, home_team:teams!matches_home_team_id_fkey(name_es,flag_emoji), away_team:teams!matches_away_team_id_fkey(name_es,flag_emoji)')
      .eq('status', 'finished')
      .order('updated_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setRecentMatches(data ?? []))
  }, [])

  async function seedTeams() {
    setLoadingTeams(true)
    const result = await seedTeamsAction()
    if (result.error) toast.error(result.error)
    else toast.success(`Insertados ${result.count} equipos`)
    setLoadingTeams(false)
  }

  async function seedMatches() {
    setLoadingMatches(true)
    const result = await seedMatchesAction()
    if (result.error) toast.error(result.error)
    else toast.success(`Insertados ${result.count} partidos`)
    setLoadingMatches(false)
  }

  async function seedPlayers() {
    setLoadingPlayers(true)
    const result = await seedPlayersAction()
    if (result.error) toast.error(result.error)
    else toast.success(`¡${result.count} jugadores de los 48 planteles cargados!`)
    setLoadingPlayers(false)
  }

  async function recalculatePoints() {
    setLoadingRecalc(true)
    const result = await recalculateAllPointsAction()
    if (result.error) toast.error(result.error)
    else toast.success(`Puntos recalculados en ${result.count ?? 0} partidos finalizados`)
    setLoadingRecalc(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Cabecera */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-brand-red" />
              Centro de Control
            </h2>
            <p className="text-slate-300 mt-2 text-sm max-w-xl">
              Panel de administración principal. Gestiona los datos del Mundial, recalcula puntos, maneja usuarios y administra las recompensas.
            </p>
          </div>
          <Button 
            onClick={recalculatePoints} 
            disabled={loadingRecalc}
            className="shrink-0 bg-brand-red hover:bg-red-600 text-white shadow-lg shadow-red-900/20 border-0 h-11 px-6 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingRecalc ? 'animate-spin' : ''}`} />
            {loadingRecalc ? 'Recalculando...' : 'Recalcular Puntos'}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Operaciones de Base de Datos */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Base de Datos Inicial
            </CardTitle>
            <CardDescription>Poblar base con datos base del torneo.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 relative z-10">
            <Button variant="secondary" size="sm" onClick={seedTeams} disabled={loadingTeams} className="bg-background shadow-sm">
              {loadingTeams ? 'Cargando...' : '48 Equipos'}
            </Button>
            <Button variant="secondary" size="sm" onClick={seedMatches} disabled={loadingMatches} className="bg-background shadow-sm">
              {loadingMatches ? 'Cargando...' : '72 Partidos'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={seedPlayers}
              disabled={loadingPlayers}
              className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 border-0 shadow-sm"
            >
              {loadingPlayers ? 'Cargando...' : '🌍 ~700 Jugadores'}
            </Button>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              Partidos & Resultados
            </CardTitle>
            <CardDescription>Cargar resultados y actualizar fases.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/partidos">
              <Button className="w-full bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 shadow-none border-0">Gestionar Partidos</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" />
              Usuarios
            </CardTitle>
            <CardDescription>Ver jugadores y contraseñas.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/usuarios">
              <Button className="w-full bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 shadow-none border-0">Ver Usuarios</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Planteles
            </CardTitle>
            <CardDescription>Revisar nóminas por país.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/jugadores">
              <Button className="w-full bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 shadow-none border-0">Ver Planteles</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Puntuación
            </CardTitle>
            <CardDescription>Reglas y multiplicadores.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/puntuacion">
              <Button className="w-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border-0">Configurar Reglas</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-amber-500/20"></div>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 relative z-10">
              <Coins className="h-5 w-5 text-amber-500" />
              Wallet & Pollas
            </CardTitle>
            <CardDescription className="relative z-10">Economía virtual y grupos.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <a href="/admin/wallet">
              <Button className="w-full bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 shadow-none border-0">Economía</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-rose-500" />
              Pronósticos Globales
            </CardTitle>
            <CardDescription>Cargar posiciones y premios.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/pronosticos">
              <Button className="w-full bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 shadow-none border-0">Resolver Torneo</Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-500" />
              Álbum Digital
            </CardTitle>
            <CardDescription>Configurar sobres de figuritas.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/admin/album">
              <Button className="w-full bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 shadow-none border-0">Ajustes Álbum</Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity log */}
      <div className="pt-4">
        <h2 className="mb-4 text-lg font-bold flex items-center gap-2">
          <Activity className="h-5 w-5 text-muted-foreground" />
          Historial de Resultados
        </h2>
        {recentMatches.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-8 text-center bg-card/30 backdrop-blur-sm">
            <p className="text-sm text-muted-foreground">No hay partidos finalizados aún.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-5 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider text-xs">Partido</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wider text-xs">Resultado</th>
                  <th className="px-5 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wider text-xs hidden sm:table-cell">Grupo</th>
                  <th className="px-5 py-3 text-right font-semibold text-muted-foreground uppercase tracking-wider text-xs hidden md:table-cell">Actualizado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {recentMatches.map((m: any) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-background/50 rounded-lg px-2 py-1 border border-border/50">
                          <span className="shrink-0 text-lg">{m.home_team?.flag_emoji}</span>
                          <span className="truncate max-w-[120px] font-semibold">{m.home_team?.name_es}</span>
                        </div>
                        <span className="text-muted-foreground/60 font-medium text-xs uppercase">vs</span>
                        <div className="flex items-center gap-2 bg-background/50 rounded-lg px-2 py-1 border border-border/50">
                          <span className="truncate max-w-[120px] font-semibold">{m.away_team?.name_es}</span>
                          <span className="shrink-0 text-lg">{m.away_team?.flag_emoji}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="inline-flex items-center justify-center bg-brand-red text-white font-bold rounded-lg px-3 py-1 text-base shadow-sm">
                        {m.home_score} - {m.away_score}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <Badge variant="outline" className="bg-background/50 font-semibold text-xs border-border/50">G{m.group_name}</Badge>
                    </td>
                    <td className="px-5 py-4 text-right text-xs text-muted-foreground font-medium hidden md:table-cell">
                      {m.updated_at ? formatPeruLongDateTime(m.updated_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
