import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const secret = process.env.ADMIN_SECRET
  if (!secret || request.headers.get('x-admin-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Con service role key
  const resService = await fetch(`${baseUrl}/rest/v1/teams?select=count`, {
    headers: { 'apikey': serviceKey!, 'Authorization': `Bearer ${serviceKey!}`, 'Prefer': 'count=exact' },
  })
  const countService = resService.headers.get('content-range')?.split('/')[1] || '0'

  // Con anon key
  const resAnon = await fetch(`${baseUrl}/rest/v1/teams?select=count`, {
    headers: { 'apikey': anonKey!, 'Prefer': 'count=exact' },
  })
  const countAnon = resAnon.headers.get('content-range')?.split('/')[1] || '0'

  // Sample con service role
  const resSample = await fetch(`${baseUrl}/rest/v1/teams?select=name_es,group_name&limit=5`, {
    headers: { 'apikey': serviceKey!, 'Authorization': `Bearer ${serviceKey!}` },
  })
  const sample = await resSample.json()

  return NextResponse.json({
    countWithServiceKey: parseInt(countService),
    countWithAnonKey: parseInt(countAnon),
    anonStatus: resAnon.status,
    serviceStatus: resService.status,
    sample: Array.isArray(sample) ? sample.slice(0, 5) : [],
  })
}
