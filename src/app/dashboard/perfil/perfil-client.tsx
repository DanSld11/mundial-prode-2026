'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { getAccessToken, createAuthedClient } from '@/lib/auth-client'
import { Bell, BellOff, CheckCircle2, Lock, LogOut, Medal, Share2, Target, Trophy, TrendingUp, UserRound, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { computeBadges } from '@/lib/badges'

interface ProfileStats {
  position: number | null
  total_points: number
  predictions_correct: number
  exact_scores: number
  total_predictions: number
  pending_predictions: number
}

export default function PerfilClient() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [allPredictions, setAllPredictions] = useState<any[]>([])
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('default')

  useEffect(() => {
    async function loadProfile() {
      const token = getAccessToken()
      if (!token) { setLoading(false); return }

      const supabase = createAuthedClient(token)

      const { data: userData } = await supabase.auth.getUser(token)
      if (!userData.user) { setLoading(false); return }

      const uid = userData.user.id
      setUserId(uid)
      setEmail(userData.user.email ?? '')

      const [profileRes, leaderboardRes, predsRes] = await Promise.all([
        supabase.from('profiles').select('username, avatar_url').eq('id', uid).single(),
        supabase.from('leaderboard').select('position, total_points, predictions_correct, exact_scores').eq('id', uid).maybeSingle(),
        supabase.from('predictions').select(`
          id, points_earned, is_exact_score, predicted_home_score, predicted_away_score,
          predicted_outcome, outcome_points, scorer_points, exact_score_points,
          match:matches(
            id, status, home_score, away_score, match_date,
            home_team:teams!matches_home_team_id_fkey(name_es, code, flag_emoji),
            away_team:teams!matches_away_team_id_fkey(name_es, code, flag_emoji)
          )
        `).eq('user_id', uid).order('created_at', { ascending: false }),
      ])

      setUsername(profileRes.data?.username ?? '')
      setAvatarUrl(profileRes.data?.avatar_url ?? null)

      const allPreds = (predsRes.data ?? []) as any[]
      const pending = allPreds.filter((p: any) => p.match?.status !== 'finished').length

      setAllPredictions(allPreds)
      setStats({
        position: leaderboardRes.data?.position ?? null,
        total_points: leaderboardRes.data?.total_points ?? 0,
        predictions_correct: leaderboardRes.data?.predictions_correct ?? 0,
        exact_scores: leaderboardRes.data?.exact_scores ?? 0,
        total_predictions: allPreds.length,
        pending_predictions: pending,
      })

      setLoading(false)
    }

    loadProfile()

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    } else {
      setNotifPermission('unsupported')
    }
  }, [])

  async function subscribePush(force = false): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    try {
      const reg = await navigator.serviceWorker.ready
      let sub = await reg.pushManager.getSubscription()
      if (force && sub) { await sub.unsubscribe(); sub = null }
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        })
      }
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      return res.ok
    } catch (err) {
      console.error('[Push]', err)
      return false
    }
  }

  function urlBase64ToUint8Array(b64: string) {
    const padding = '='.repeat((4 - (b64.length % 4)) % 4)
    const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/')
    return Uint8Array.from([...atob(base64)].map((c) => c.charCodeAt(0)))
  }

  async function requestNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotifPermission(permission)
    if (permission === 'granted') {
      const ok = await subscribePush(true)
      if (ok) toast.success('¡Notificaciones activadas! Este dispositivo recibirá alertas.')
      else toast.error('Permiso concedido pero falló el registro. Intenta de nuevo.')
    } else {
      toast.error('Notificaciones bloqueadas. Podés habilitarlas desde la configuración del navegador.')
    }
  }

  async function reRegisterPush() {
    const ok = await subscribePush(true)
    if (ok) toast.success('Dispositivo re-registrado correctamente.')
    else toast.error('No se pudo re-registrar. Verifica que las notificaciones estén permitidas.')
  }

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!userId || username.trim().length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres.')
      return
    }
    const token = getAccessToken()
    if (!token) return
    setSavingProfile(true)
    const supabase = createAuthedClient(token)
    const { error } = await supabase.from('profiles').update({ username: username.trim(), updated_at: new Date().toISOString() }).eq('id', userId)
    if (error) toast.error(error.message)
    else toast.success('Perfil actualizado')
    setSavingProfile(false)
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== passwordConfirm) { toast.error('Las contraseñas no coinciden.'); return }
    const token = getAccessToken()
    if (!token) return
    setSavingPassword(true)
    // supabase.auth.updateUser() requiere sesión GoTrue interna que no se inicializa
    // con createAuthedClient (persistSession: false). Usamos la REST API directamente.
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
        {
          method: 'PUT',
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.msg || data.error_description || 'Error al cambiar la contraseña.')
      } else {
        toast.success('Contraseña actualizada correctamente')
        setPassword('')
        setPasswordConfirm('')
      }
    } catch {
      toast.error('Error de conexión. Intentá de nuevo.')
    }
    setSavingPassword(false)
  }

  function handleShare() {
    const text = [
      `🏆 Mi progreso en el Prode del Mundial 2026`,
      ``,
      `📊 Puesto #${stats?.position ?? '—'} en el ranking global`,
      `⚽ ${stats?.total_points ?? 0} puntos totales`,
      `✅ ${stats?.predictions_correct ?? 0} predicciones correctas`,
      `🎯 ${stats?.exact_scores ?? 0} marcadores exactos`,
      ``,
      `¡Jugá el prode!`,
    ].join('\n')

    if (navigator.share) {
      navigator.share({ title: 'Mi prode del Mundial 2026', text }).catch(() => null)
    } else {
      navigator.clipboard.writeText(text).then(() => toast.success('¡Copiado al portapapeles!'))
    }
  }

  if (loading) return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />)}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted/60" />
    </div>
  )

  if (!userId) return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <h1 className="text-xl font-bold">Sesión no disponible</h1>
      <p className="mt-2 text-sm text-muted-foreground">Vuelve a iniciar sesión para editar tu perfil.</p>
    </div>
  )

  const badges = computeBadges(allPredictions)
  const earnedBadges = badges.filter((b) => b.earned)
  const accuracy = stats && stats.total_predictions > 0
    ? Math.round((stats.predictions_correct / stats.total_predictions) * 100)
    : 0
  const finishedPreds = allPredictions.filter((p: any) => p.match?.status === 'finished')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="h-16 w-16 rounded-2xl object-cover shadow-sm shrink-0" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm text-2xl font-bold shrink-0">
              {username ? username.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-bebas text-3xl tracking-wide">{username || 'Mi Perfil'}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            {stats?.position && (
              <p className="mt-1 text-xs text-muted-foreground">
                Puesto <span className="font-bold text-brand-red">#{stats.position}</span> en el ranking
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleShare} className="shrink-0 gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Puntos', value: stats.total_points, icon: Trophy, color: 'text-brand-red' },
            { label: 'Aciertos', value: stats.predictions_correct, icon: Target, color: 'text-emerald-500' },
            { label: 'Exactos', value: stats.exact_scores, icon: Medal, color: 'text-brand-gold' },
            { label: 'Precisión', value: `${accuracy}%`, icon: TrendingUp, color: 'text-blue-500' },
          ].map((s) => (
            <Card key={s.label} className="shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {stats && stats.total_predictions > 0 && (
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-semibold">Predicciones realizadas</span>
            <span className="text-muted-foreground tabular-nums">
              {stats.total_predictions - stats.pending_predictions} / {stats.total_predictions} jugadas
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-red transition-all"
              style={{ width: `${Math.round(((stats.total_predictions - stats.pending_predictions) / stats.total_predictions) * 100)}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{stats.pending_predictions} pendientes de jugar</span>
            <span>{stats.predictions_correct} acertadas · {stats.exact_scores} exactas</span>
          </div>
        </div>
      )}

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <span>🏅</span>
            Logros desbloqueados
            <span className="ml-auto text-sm font-normal text-muted-foreground">{earnedBadges.length}/{badges.length}</span>
          </CardTitle>
          <CardDescription>Consigue predicciones correctas y raras para desbloquear todos los logros.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {badges.map((badge) => (
              <div key={badge.id} className={`flex items-start gap-2 rounded-xl border p-3 transition-all ${badge.earned ? 'bg-brand-red/5 border-brand-red/20' : 'bg-muted/20 opacity-40 grayscale'}`}>
                <span className="text-2xl leading-none">{badge.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold">{badge.title}</p>
                  <p className="text-[10px] leading-tight text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifPermission !== 'unsupported' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {notifPermission === 'granted' ? <Bell className="h-4 w-4 text-emerald-500" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
              Notificaciones
            </CardTitle>
            <CardDescription>
              {notifPermission === 'granted'
                ? 'Las notificaciones están activas. Te avisamos cuando haya resultados.'
                : 'Activá las notificaciones para saber cuando se publican resultados.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifPermission === 'granted' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">
                  <Bell className="h-4 w-4 shrink-0" />
                  Notificaciones activadas en este navegador.
                </div>
                <p className="text-xs text-muted-foreground">
                  Si instalaste la app en tu celular y no recibes notificaciones, toca el botón de abajo para re-registrar este dispositivo.
                </p>
                <Button onClick={reRegisterPush} variant="outline" size="sm" className="gap-2">
                  <Bell className="h-3.5 w-3.5" />
                  Re-registrar este dispositivo
                </Button>
              </div>
            ) : notifPermission === 'denied' ? (
              <p className="text-sm text-muted-foreground">Habilitá los permisos de notificación desde la configuración de tu navegador.</p>
            ) : (
              <Button onClick={requestNotifications} variant="outline" className="gap-2">
                <Bell className="h-4 w-4" />
                Activar notificaciones
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Prediction history */}
      {finishedPreds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-4 w-4 text-brand-red" />
              Historial de predicciones
              <span className="ml-auto text-sm font-normal text-muted-foreground">{finishedPreds.length} jugadas</span>
            </CardTitle>
            <CardDescription>Tus predicciones en partidos ya finalizados.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-80 overflow-y-auto">
              {finishedPreds.map((pred: any) => {
                const home = pred.match?.home_team?.code ?? '?'
                const away = pred.match?.away_team?.code ?? '?'
                const actualHome = pred.match?.home_score
                const actualAway = pred.match?.away_score
                const isCorrect = pred.outcome_points > 0
                const pts = pred.points_earned ?? 0
                return (
                  <div key={pred.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    <div className="shrink-0 w-5 flex justify-center">
                      {pred.is_exact_score ? <span>🎯</span> : isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold tabular-nums">{home} {actualHome}–{actualAway} {away}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Tu pick: {pred.predicted_home_score ?? '?'}–{pred.predicted_away_score ?? '?'}
                        {pred.is_exact_score && ' · Marcador exacto 🔥'}
                      </p>
                    </div>
                    {pts > 0 ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">+{pts} pts</span>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">0 pts</span>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit username */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-4 w-4 text-brand-red" />
            Nombre de usuario
          </CardTitle>
          <CardDescription>Mínimo 3 caracteres, máximo 30.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={30} required />
            <Button type="submit" disabled={savingProfile} className="bg-brand-red text-white hover:bg-red-700">
              {savingProfile ? 'Guardando...' : 'Guardar usuario'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-brand-red" />
            Cambiar contraseña
          </CardTitle>
          <CardDescription>Usa una contraseña de al menos 8 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updatePassword} className="space-y-4">
            <Input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
            <Input type="password" placeholder="Confirmar contraseña" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} minLength={8} required />
            <Button type="submit" disabled={savingPassword} className="bg-brand-red text-white hover:bg-red-700">
              {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <form action="/auth/logout" method="post">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </form>
    </div>
  )
}
