import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/server-client'
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:dardiles.msb@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function GET(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret') ?? req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = createServiceRoleClient()

  // Find matches starting in 13–18 minutes from now (5-min cron window)
  const now = new Date()
  const from = new Date(now.getTime() + 13 * 60_000).toISOString()
  const to   = new Date(now.getTime() + 18 * 60_000).toISOString()

  const { data: matches } = await db
    .from('matches')
    .select('id, match_date, home_team:teams!matches_home_team_id_fkey(name_es, flag_emoji), away_team:teams!matches_away_team_id_fkey(name_es, flag_emoji)')
    .eq('status', 'scheduled')
    .eq('predictions_locked', false)
    .gte('match_date', from)
    .lte('match_date', to)

  if (!matches?.length) {
    return NextResponse.json({ sent: 0, message: 'No matches in window' })
  }

  const { data: subscriptions } = await db
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, user_id')

  if (!subscriptions?.length) {
    return NextResponse.json({ sent: 0, message: 'No subscriptions' })
  }

  let sent = 0
  let failed = 0

  for (const match of matches) {
    const home = (match.home_team as any)?.name_es ?? 'Local'
    const away = (match.away_team as any)?.name_es ?? 'Visitante'

    const payload = JSON.stringify({
      title: '⚽ Partido en 15 minutos',
      body:  `${home} vs ${away} está por comenzar. ¡Haz tu predicción!`,
      tag:   `remind-${match.id}`,
      url:   `/dashboard/partidos/${match.id}`,
    })

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err: any) {
        // Remove expired/invalid subscriptions (410 Gone)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
        }
        failed++
      }
    }
  }

  return NextResponse.json({ sent, failed, matches: matches.length })
}
