import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Test 1: Variables de entorno
  const envStatus = {
    hasUrl: !!url,
    hasServiceKey: !!serviceKey,
    hasAnonKey: !!anonKey,
    urlValue: url ? url.substring(0, 20) + '...' : 'MISSING',
    serviceKeyLength: serviceKey ? serviceKey.length : 0,
  }

  if (!url || !serviceKey) {
    return NextResponse.json({
      error: 'Missing environment variables',
      envStatus,
    }, { status: 500 })
  }

  // Test 2: Conexion a Supabase
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  let dbStatus = 'unknown'
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    if (error) {
      dbStatus = `ERROR: ${error.message}`
    } else {
      dbStatus = 'OK - profiles table exists'
    }
  } catch (e: any) {
    dbStatus = `EXCEPTION: ${e.message}`
  }

  // Test 3: Intentar crear usuario
  let createUserStatus = 'unknown'
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test' + Date.now() + '@test.com',
      password: 'test123',
      email_confirm: true,
      user_metadata: { username: 'testuser' },
    })
    if (error) {
      createUserStatus = `ERROR: ${error.message}`
    } else {
      createUserStatus = `OK - User ${data.user?.email} created`
      // Borrar usuario de prueba
      await supabase.auth.admin.deleteUser(data.user!.id)
    }
  } catch (e: any) {
    createUserStatus = `EXCEPTION: ${e.message}`
  }

  return NextResponse.json({
    envStatus,
    dbStatus,
    createUserStatus,
  })
}
