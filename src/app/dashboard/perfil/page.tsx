'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getAccessToken, createAuthedClient } from '@/lib/auth-client'
import { Lock, Medal, Target, Trophy, TrendingUp, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ProfileStats {
  position: number | null
  total_points: number
  predictions_correct: number
  exact_scores: number
  total_predictions: number
  pending_predictions: number
}

export default function PerfilPage() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [token, setToken] = useState<string | null>(null)
  const [tokenChecked, setTokenChecked] = useState(false)
  const [stats, setStats] = useState<ProfileStats | null>(null)

  const supabase = useMemo(() => token ? createAuthedClient(token) : createAuthedClient(''), [token])

  useEffect(() => {
    setToken(getAccessToken() ?? null)
    setTokenChecked(true)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      if (!tokenChecked) return
      if (!token) { setLoading(false); return }

      const { data: userData } = await supabase.auth.getUser(token)
      if (!userData.user) { setLoading(false); return }

      const uid = userData.user.id
      setUserId(uid)
      setEmail(userData.user.email ?? '')

      const [profileRes, leaderboardRes, predsRes] = await Promise.all([
        supabase.from('profiles').select('username').eq('id', uid).single(),
        supabase.from('leaderboard').select('position, total_points, predictions_correct, exact_scores').eq('id', uid).single(),
        supabase.from('predictions').select('id, points_earned, match:matches(status)').eq('user_id', uid),
      ])

      setUsername(profileRes.data?.username ?? '')

      const allPreds = predsRes.data ?? []
      const pending = allPreds.filter((p: any) => p.match?.status !== 'finished').length

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
  }, [supabase, token, tokenChecked])

  async function updateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!userId || username.trim().length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres.')
      return
    }
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim(), updated_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) toast.error(error.message)
    else toast.success('Perfil actualizado')
    setSavingProfile(false)
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8) { toast.error('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== passwordConfirm) { toast.error('Las contraseñas no coinciden.'); return }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { toast.error(error.message) }
    else { toast.success('Contraseña actualizada'); setPassword(''); setPasswordConfirm('') }
    setSavingPassword(false)
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

  if (!token || !userId) return (
    <div className="rounded-xl border bg-card p-8 text-center">
      <h1 className="text-xl font-bold">Sesión no disponible</h1>
      <p className="mt-2 text-sm text-muted-foreground">Vuelve a iniciar sesión para editar tu perfil.</p>
    </div>
  )

  const accuracy = stats && stats.total_predictions > 0
    ? Math.round((stats.predictions_correct / stats.total_predictions) * 100)
    : 0

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-red text-white shadow-sm text-2xl font-bold">
            {username ? username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide">{username || 'Mi Perfil'}</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
            {stats?.position && (
              <p className="mt-1 text-xs text-muted-foreground">
                Puesto <span className="font-bold text-brand-red">#{stats.position}</span> en el ranking
              </p>
            )}
          </div>
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
              style={{ width: `${stats.total_predictions > 0 ? Math.round(((stats.total_predictions - stats.pending_predictions) / stats.total_predictions) * 100) : 0}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>{stats.pending_predictions} pendientes de jugar</span>
            <span>{stats.predictions_correct} acertadas · {stats.exact_scores} exactas</span>
          </div>
        </div>
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
    </div>
  )
}
