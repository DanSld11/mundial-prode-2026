import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/server-client'

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = createServiceRoleClient()
  await db.from('user_notifications').update({ dismissed: true }).eq('id', id)
  return NextResponse.json({ ok: true })
}
