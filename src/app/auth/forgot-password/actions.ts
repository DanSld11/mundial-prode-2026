'use server'

import { createServiceRoleClient } from '@/lib/server-client'

export async function sendPasswordRecoveryAction(email: string, redirectTo: string) {
  const admin = createServiceRoleClient()

  // Verificar si el email existe en auth.users
  const { data: usersData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const exists = (usersData?.users ?? []).some(
    u => u.email?.toLowerCase() === email.toLowerCase()
  )

  if (!exists) {
    return { error: 'No existe una cuenta con ese email. Verificá el correo ingresado.' }
  }

  // Llamar al endpoint de recuperación
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`,
    {
      method: 'POST',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, redirect_to: redirectTo }),
    }
  )

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    return { error: data.msg || data.error_description || 'Error al enviar el correo.' }
  }

  return { success: true }
}
