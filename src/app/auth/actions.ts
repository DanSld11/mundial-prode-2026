'use server'
// =============================================
// AUTH ACTIONS — Server Actions de Next.js
// =============================================

import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { Profile } from '@/types'

// ── LOGIN ──
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Completá todos los campos.' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login')) {
      return { error: 'Email o contraseña incorrectos.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ── REGISTER ──
export async function registerAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const favoriteTeam = formData.get('favorite_team') as string

  if (!email || !password || !username) {
    return { error: 'Completá todos los campos obligatorios.' }
  }

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }

  if (username.length < 3 || username.length > 20) {
    return { error: 'El nombre de usuario debe tener entre 3 y 20 caracteres.' }
  }

  const supabase = await createServerSupabaseClient()

  // Verificar si el username ya existe
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single()

  if (existingUser) {
    return { error: 'Ese nombre de usuario ya está en uso.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        favorite_team: favoriteTeam || null,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este email ya está registrado.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

// ── LOGOUT ──
export async function logoutAction() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete('sb-access-token')
  cookieStore.delete('sb-refresh-token')
  revalidatePath('/', 'layout')
  redirect('/')
}

// ── OBTENER USUARIO ACTUAL ──
export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile as unknown as Profile | null
}
