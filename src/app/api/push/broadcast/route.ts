import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/server-client'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:dardiles.msb@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { title, body, url } = await req.json()
    if (!title || !body) {
      return NextResponse.json({ error: 'title y body son requeridos' }, { status: 400 })
    }

    const db = createServiceRoleClient()
    const { data: subscriptions } = await db
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    if (!subscriptions?.length) {
      return NextResponse.json({ sent: 0, message: 'No hay suscriptores' })
    }

    const payload = JSON.stringify({
      title,
      body,
      tag: `broadcast-${Date.now()}`,
      url: url || '/dashboard',
    })

    let sent = 0
    let failed = 0

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        failed++
      }
    }

    return NextResponse.json({ sent, failed, total: subscriptions.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
