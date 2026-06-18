import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/server-client'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const sub = await req.json()
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
      return NextResponse.json({ error: 'Suscripción inválida' }, { status: 400 })
    }

    const db = createServiceRoleClient()

    // Get user_id from session cookie if present
    let userId: string | null = null
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value
    if (token) {
      const { data: { user } } = await db.auth.getUser(token)
      userId = user?.id ?? null
    }

    await db.from('push_subscriptions').upsert({
      endpoint:  sub.endpoint,
      p256dh:    sub.keys.p256dh,
      auth:      sub.keys.auth,
      user_id:   userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'endpoint' })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'Falta endpoint' }, { status: 400 })
    const db = createServiceRoleClient()
    await db.from('push_subscriptions').delete().eq('endpoint', endpoint)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
