import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: teams, error: teamsError } = await supabase.from('teams').select('name_es, group_name', { count: 'exact' }).limit(5)
  const { count: matchCount, error: matchError } = await supabase.from('matches').select('*', { count: 'exact', head: true })

  return NextResponse.json({
    teamsCount: teams?.length ?? 0,
    totalTeams: (teams as any)?.length ?? 0,
    matchCount: matchCount ?? 0,
    sample: teams?.slice(0, 5) || [],
    teamsError: teamsError?.message || null,
    matchError: matchError?.message || null,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  })
}
