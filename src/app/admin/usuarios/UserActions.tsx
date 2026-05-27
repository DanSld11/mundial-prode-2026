'use client'

import { useState, useRef, useEffect } from 'react'
import {
  KeyRound, Eye, EyeOff, X, ShieldAlert, CheckCircle2,
  Loader2, UserX, UserCheck, AlertTriangle, Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { resetUserPasswordAction, disableUserAction, enableUserAction, deleteUserAction } from './actions'

/* ─────────────────────────────────────────────
   RESET PASSWORD MODAL
───────────────────────────────────────────── */
export function ResetPasswordModal({ userId, username }: { userId: string; username: string }) {
  const [open, setOpen]         = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setPassword(''); setConfirm(''); setDone(false); setTimeout(() => inputRef.current?.focus(), 80) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Las contraseñas no coinciden'); return }
    if (password.length < 6)  { toast.error('Mínimo 6 caracteres'); return }
    setLoading(true)
    const result = await resetUserPasswordAction(userId, password)
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    setDone(true)
    toast.success(`Contraseña de @${username} actualizada`)
    setTimeout(() => setOpen(false), 1800)
  }

  const mismatch = confirm.length > 0 && password !== confirm
  const valid    = password.length >= 6 && password === confirm

  const strength = password.length === 0 ? 0
    : password.length < 4 ? 1
    : password.length < 7 ? 2
    : password.length < 10 ? 3 : 4

  return (
    <>
      <button onClick={() => setOpen(true)} title="Cambiar contraseña"
        className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-400">
        <KeyRound className="h-3 w-3" /> Clave
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl">

            <div className="flex items-center justify-between rounded-t-2xl border-b bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
                  <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cambiar contraseña</p>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5">
              {done ? (
                <div className="flex flex-col items-center gap-3 py-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">¡Contraseña actualizada!</p>
                  <p className="text-xs text-muted-foreground">Compartí la nueva clave con el usuario.</p>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/20">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      La contraseña cambia inmediatamente. Compartila de forma segura.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Nueva contraseña</label>
                      <div className="relative">
                        <input ref={inputRef} type={showPw ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
                          required minLength={6}
                          className="h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        <button type="button" onClick={() => setShowPw(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex flex-1 gap-1">
                            {[1,2,3,4].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                strength >= i
                                  ? i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : i === 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                                  : 'bg-muted'
                              }`} />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {['','Muy corta','Corta','Media','Fuerte'][strength]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Confirmar</label>
                      <input type={showPw ? 'text' : 'password'} value={confirm}
                        onChange={e => setConfirm(e.target.value)} placeholder="Repetí la contraseña" required
                        className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 ${
                          mismatch ? 'border-red-400 focus:ring-red-300' : valid ? 'border-emerald-400 focus:ring-emerald-300' : 'focus:ring-amber-400'
                        }`} />
                      {mismatch && <p className="text-[11px] text-red-500">Las contraseñas no coinciden</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setOpen(false)}
                        className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
                      <button type="submit" disabled={loading || !valid}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50">
                        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</> : <><KeyRound className="h-4 w-4" /> Cambiar</>}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─────────────────────────────────────────────
   DELETE USER MODAL
───────────────────────────────────────────── */
export function DeleteUserModal({ userId, username }: { userId: string; username: string }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setConfirm(''); setTimeout(() => inputRef.current?.focus(), 80) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open])

  async function handleDelete() {
    setLoading(true)
    const result = await deleteUserAction(userId)
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    toast.success(`@${username} eliminado correctamente`)
    setOpen(false)
  }

  const isConfirmed = confirm === username

  return (
    <>
      <button onClick={() => setOpen(true)} title="Eliminar usuario"
        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-400">
        <Trash2 className="h-3 w-3" /> Eliminar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl overflow-hidden">

            {/* Header rojo */}
            <div className="bg-gradient-to-br from-rose-600 to-red-700 px-5 py-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <p className="font-bold text-white text-base">Eliminar usuario</p>
              <p className="text-white/70 text-sm mt-0.5">@{username}</p>
            </div>

            <div className="px-5 py-5 space-y-4">
              {/* Advertencia */}
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-3 dark:border-red-800/50 dark:bg-red-950/20">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="text-xs text-red-700 dark:text-red-400 space-y-1">
                  <p className="font-semibold">Esta acción es irreversible.</p>
                  <p>Se eliminará la cuenta, el perfil y todos los datos asociados a <strong>@{username}</strong>.</p>
                </div>
              </div>

              {/* Confirmación escribiendo el username */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Escribí <span className="font-bold text-foreground">{username}</span> para confirmar
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder={username}
                  className={`h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 transition ${
                    confirm.length > 0 && !isConfirmed
                      ? 'border-red-400 focus:ring-red-300'
                      : isConfirmed
                        ? 'border-emerald-400 focus:ring-emerald-300'
                        : 'focus:ring-rose-400'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition">
                  Cancelar
                </button>
                <button onClick={handleDelete} disabled={loading || !isConfirmed}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition">
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Eliminando...</>
                    : <><Trash2 className="h-4 w-4" /> Eliminar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ─────────────────────────────────────────────
   TOGGLE ENABLE / DISABLE USER
───────────────────────────────────────────── */
export function ToggleUserStatus({
  userId, username, isDisabled,
}: { userId: string; username: string; isDisabled: boolean }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [disabled, setDisabled] = useState(isDisabled)

  async function handleConfirm() {
    setLoading(true)
    const result = disabled
      ? await enableUserAction(userId)
      : await disableUserAction(userId)
    setLoading(false)
    if (result.error) { toast.error(result.error); return }
    setDisabled(d => !d)
    setOpen(false)
    toast.success(disabled ? `@${username} habilitado` : `@${username} deshabilitado`)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} title={disabled ? 'Habilitar usuario' : 'Deshabilitar usuario'}
        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition ${
          disabled
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-400'
            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800/60 dark:bg-red-950/30 dark:text-red-400'
        }`}>
        {disabled
          ? <><UserCheck className="h-3 w-3" /> Habilitar</>
          : <><UserX className="h-3 w-3" /> Deshabilitar</>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}>
          <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center justify-between rounded-t-2xl border-b bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${disabled ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                  {disabled
                    ? <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    : <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{disabled ? 'Habilitar usuario' : 'Deshabilitar usuario'}</p>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 ${
                disabled
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/50 dark:bg-emerald-950/20'
                  : 'border-red-200 bg-red-50/60 dark:border-red-800/50 dark:bg-red-950/20'
              }`}>
                <AlertTriangle className={`mt-0.5 h-4 w-4 shrink-0 ${disabled ? 'text-emerald-600' : 'text-red-600'}`} />
                <p className={`text-xs ${disabled ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                  {disabled
                    ? `@${username} podrá volver a iniciar sesión normalmente.`
                    : `@${username} no podrá iniciar sesión hasta que lo habilites de nuevo.`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted">Cancelar</button>
                <button onClick={handleConfirm} disabled={loading}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
                    disabled ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}>
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Procesando...</>
                    : disabled
                      ? <><UserCheck className="h-4 w-4" /> Habilitar</>
                      : <><UserX className="h-4 w-4" /> Deshabilitar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
