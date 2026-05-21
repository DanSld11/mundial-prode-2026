'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { getAccessToken, createAuthedClient } from '@/lib/auth-client'
import { Lock, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

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

  const supabase = useMemo(() => token ? createAuthedClient(token) : createAuthedClient(''), [token])

  useEffect(() => {
    setToken(getAccessToken() ?? null)
    setTokenChecked(true)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      if (!tokenChecked) return

      if (!token) {
        setLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser(token)
      if (!userData.user) {
        setLoading(false)
        return
      }

      setUserId(userData.user.id)
      setEmail(userData.user.email ?? '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userData.user.id)
        .single()

      setUsername(profile?.username ?? '')
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

    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      toast.error('Las contraseñas no coinciden.')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Contraseña actualizada')
      setPassword('')
      setPasswordConfirm('')
    }

    setSavingPassword(false)
  }

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Cargando perfil...</div>

  if (!token || !userId) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <h1 className="text-xl font-bold">Sesión no disponible</h1>
        <p className="mt-2 text-sm text-muted-foreground">Vuelve a iniciar sesión para editar tu perfil.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Actualiza tu usuario y contraseña desde tu sesión actual.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserRound className="h-4 w-4 text-brand-red" />
            Datos de usuario
          </CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <Input value={username} onChange={(event) => setUsername(event.target.value)} minLength={3} maxLength={30} required />
            <Button type="submit" disabled={savingProfile} className="bg-brand-red text-white hover:bg-red-700">
              {savingProfile ? 'Guardando...' : 'Guardar usuario'}
            </Button>
          </form>
        </CardContent>
      </Card>

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
            <Input type="password" placeholder="Nueva contraseña" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
            <Input type="password" placeholder="Confirmar contraseña" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} minLength={8} required />
            <Button type="submit" disabled={savingPassword} className="bg-brand-red text-white hover:bg-red-700">
              {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
