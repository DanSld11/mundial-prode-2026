'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { seedTeamsAction, seedMatchesAction, seedPlayersAction, recalculateAllPointsAction, resetTournamentAction } from './actions'
import { createAnonClient } from '@/lib/auth-client'
import { formatPeruLongDateTime } from '@/lib/peru-time'
import { Trophy, RefreshCw, Users, ShieldCheck, Database, CalendarDays, Coins, Activity, TrendingUp, BookOpen, Trash2, AlertTriangle, Bell, Send, GitBranch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'

export default function AdminPage() {
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [loadingRecalc, setLoadingRecalc] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')
  const [loadingBroadcast, setLoadingBroadcast] = useState(false)
  const [loadingTestNotif, setLoadingTestNotif] = useState(false)

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

  async function sendTestNotification() {
    setLoadingTestNotif(true)
    try {
      const res = await fetch('/api/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🔔 Prueba de notificación',
          body: 'Las notificaciones push están funcionando correctamente.',
          url: '/dashboard',
        }),
      })
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else toast.success(`Enviado a ${data.sent} dispositivo(s) · ${data.failed} fallidos`)
    } catch {
      toast.error('Error al enviar la notificación de prueba')
    }
    setLoadingTestNotif(false)
  }

  async function sendBroadcast() {
    if (!notifTitle.trim() || !notifBody.trim()) {
      toast.error('Completa el título y el mensaje')
      return
    }
    setLoadingBroadcast(true)
    try {
      const res = await fetch('/api/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: notifTitle.trim(), body: notifBody.trim(), url: '/dashboard' }),
      })
      const data = await res.json()
      if (data.error) toast.error(data.error)
      else {
        toast.success(`Comunicado enviado a ${data.sent} dispositivo(s)`)
        setNotifTitle('')
        setNotifBody('')
      }
    } catch {
      toast.error('Error al enviar el comunicado')
    }
    setLoadingBroadcast(false)
  }

  async function resetTournament() {
    setShowResetModal(false)
    setLoadingReset(true)
    const result = await resetTournamentAction()
    if (result.error) toast.error(result.error)
    else {
      toast.success('✅ Reset completo: predicciones borradas, partidos a 0, puntos reseteados.')
      setRecentMatches([])
    }
    setLoadingReset(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Cabecera */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 shadow-xl">
        <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}}></div>
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

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-brand-red/20" />
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 relative z-10">
              <GitBranch className="h-5 w-5 text-brand-red" />
              Bracket Eliminatorio
            </CardTitle>
            <CardDescription className="relative z-10">Asignar equipos a octavos, cuartos, semis y final.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <a href="/admin/bracket">
              <Button className="w-full bg-brand-red/10 text-brand-red hover:bg-brand-red/20 shadow-none border-0 font-semibold">
                Gestionar Bracket
              </Button>
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

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/20" />
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 relative z-10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Ajuste de Puntos
            </CardTitle>
            <CardDescription className="relative z-10">Suma o resta puntos a usuarios con motivo.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <a href="/admin/puntos">
              <Button className="w-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border-0 font-semibold">
                Ajustar Puntos
              </Button>
            </a>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-rose-500/20" />
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 relative z-10">
              <Coins className="h-5 w-5 text-rose-500" />
              Ruleta MundialCoins
            </CardTitle>
            <CardDescription className="relative z-10">Activar, configurar premios y gestionar acceso.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <a href="/admin/ruleta">
              <Button className="w-full bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 shadow-none border-0 font-semibold">
                Configurar Ruleta
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Notificaciones Push */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden md:col-span-2 lg:col-span-3">
          <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-violet-500/20" />
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 relative z-10">
              <Bell className="h-5 w-5 text-violet-500" />
              Notificaciones Push
            </CardTitle>
            <CardDescription className="relative z-10">Envía alertas a todos los usuarios que tienen las notificaciones activadas.</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Test rápido */}
              <div className="flex-1 rounded-2xl border border-violet-200/50 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-3">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">🔔 Prueba rápida</p>
                <p className="text-xs text-muted-foreground">Envía una notificación de prueba a todos los dispositivos para verificar que funciona.</p>
                <Button
                  onClick={sendTestNotification}
                  disabled={loadingTestNotif}
                  size="sm"
                  className="bg-violet-500/20 text-violet-700 dark:text-violet-300 hover:bg-violet-500/30 shadow-none border-0 font-semibold"
                >
                  <Bell className={`mr-2 h-3.5 w-3.5 ${loadingTestNotif ? 'animate-pulse' : ''}`} />
                  {loadingTestNotif ? 'Enviando...' : 'Enviar prueba'}
                </Button>
              </div>

              {/* Comunicado global */}
              <div className="flex-[2] rounded-2xl border border-violet-200/50 dark:border-violet-800/30 bg-violet-50/50 dark:bg-violet-950/20 p-4 space-y-3">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">📢 Comunicado global</p>
                <Input
                  placeholder="Título del comunicado"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  maxLength={60}
                  className="bg-background/70"
                />
                <Textarea
                  placeholder="Mensaje para todos los usuarios..."
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  maxLength={200}
                  rows={2}
                  className="bg-background/70 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{notifBody.length}/200</span>
                  <Button
                    onClick={sendBroadcast}
                    disabled={loadingBroadcast || !notifTitle.trim() || !notifBody.trim()}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
                  >
                    <Send className={`mr-2 h-3.5 w-3.5 ${loadingBroadcast ? 'animate-pulse' : ''}`} />
                    {loadingBroadcast ? 'Enviando...' : 'Enviar a todos'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reset zona de peligro */}
      <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/5 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-red-600 dark:text-red-400">Zona de Reset — Inicio del Torneo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Borra predicciones, resultados y puntos. Mantiene usuarios y pollas.</p>
            </div>
          </div>
          <Button
            onClick={() => setShowResetModal(true)}
            disabled={loadingReset}
            variant="outline"
            className="shrink-0 border-red-500 text-red-600 hover:bg-red-500 hover:text-white transition-all h-10 px-5 rounded-xl font-semibold text-sm"
          >
            <Trash2 className={`mr-2 h-4 w-4 ${loadingReset ? 'animate-spin' : ''}`} />
            {loadingReset ? 'Reseteando...' : 'Reset completo'}
          </Button>
        </div>
      </div>

      {/* Modal de confirmación reset */}
      <Modal open={showResetModal} onClose={() => setShowResetModal(false)}>
        <div className="flex flex-col items-center text-center gap-4 pt-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold">¿Resetear el torneo?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Esta acción <strong>no se puede deshacer</strong>. Se borrarán:</p>
            <ul className="mt-3 space-y-1 text-sm text-left mx-auto max-w-xs">
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 className="h-3.5 w-3.5 shrink-0" />Todas las predicciones de partidos</li>
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 className="h-3.5 w-3.5 shrink-0" />Todas las predicciones de grupos</li>
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 className="h-3.5 w-3.5 shrink-0" />Resultados y goleadores de partidos</li>
              <li className="flex items-center gap-2 text-red-600 dark:text-red-400"><Trash2 className="h-3.5 w-3.5 shrink-0" />Puntos de todos los usuarios → 0</li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">✅ Se mantienen los usuarios y las pollas creadas.</p>
          </div>
          <div className="flex w-full gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowResetModal(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={resetTournament}
            >
              Sí, resetear todo
            </Button>
          </div>
        </div>
      </Modal>

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
          <div className="space-y-2">
            {recentMatches.map((m: any) => (
              <div key={m.id} className="rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl px-4 py-3 flex items-center gap-3">
                {/* Equipo local */}
                <div className="flex flex-1 items-center justify-end gap-2 min-w-0">
                  <span className="truncate text-sm font-semibold text-right">{m.home_team?.name_es}</span>
                  <span className="shrink-0 text-xl">{m.home_team?.flag_emoji}</span>
                </div>
                {/* Marcador */}
                <div className="shrink-0 flex flex-col items-center gap-0.5">
                  <div className="bg-brand-red text-white font-bold rounded-lg px-3 py-1 text-sm tabular-nums">
                    {m.home_score} - {m.away_score}
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/50">G{m.group_name}</Badge>
                </div>
                {/* Equipo visitante */}
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <span className="shrink-0 text-xl">{m.away_team?.flag_emoji}</span>
                  <span className="truncate text-sm font-semibold">{m.away_team?.name_es}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
