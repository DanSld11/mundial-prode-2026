'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, ArrowRight, Crown } from 'lucide-react'
import { getAccessToken, createAnonClient, getCurrentUserId } from '@/lib/auth-client'
import { STAGE_MULTIPLIERS } from '@/types'

interface BannerData {
  isLeader: boolean
  leaderName: string
  gap: number
  maxRemaining: number
  remainingLabels: string[]
  reachable: boolean
}

export function UltimaChanceBanner() {
  const [data, setData] = useState<BannerData | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    const supabase = createAnonClient()

    async function load() {
      const userId = await getCurrentUserId(token!)
      if (!userId) return

      const [{ data: remaining }, { data: leaders }] = await Promise.all([
        supabase.from('matches')
          .select('stage, status')
          .in('stage', ['third_place', 'final'])
          .neq('status', 'finished'),
        supabase.from('leaderboard')
          .select('id, username, total_points, position')
          .order('position')
          .limit(100),
      ])

      if (!remaining || remaining.length === 0) return // torneo terminado
      if (!leaders || leaders.length === 0) return

      // Máximo teórico por partido restante:
      // (resultado 1 + goleador 2 + exacto 3) × multiplicador + acierto de llave (1 × mult)
      const maxRemaining = remaining.reduce((sum, m) => {
        const mult = STAGE_MULTIPLIERS[m.stage as keyof typeof STAGE_MULTIPLIERS] ?? 1
        return sum + 6 * mult + mult
      }, 0)

      const STAGE_NAMES: Record<string, string> = { third_place: 'el 3er puesto', final: 'la Final' }
      const remainingLabels = remaining.map((m) => STAGE_NAMES[m.stage] ?? m.stage)

      const leader = leaders[0]
      const me = leaders.find((l) => l.id === userId)
      if (!me) return

      if (me.id === leader.id) {
        const second = leaders[1]
        setData({
          isLeader: true,
          leaderName: second?.username ?? '',
          gap: second ? me.total_points - second.total_points : 0,
          maxRemaining,
          remainingLabels,
          reachable: true,
        })
      } else {
        const gap = leader.total_points - me.total_points
        setData({
          isLeader: false,
          leaderName: leader.username,
          gap,
          maxRemaining,
          remainingLabels,
          reachable: gap <= maxRemaining,
        })
      }
    }
    load()
  }, [])

  if (!data) return null

  const partidos = data.remainingLabels.join(' y ')

  return (
    <Link
      href="/dashboard/partidos"
      className="group block overflow-hidden rounded-2xl border shadow-sm transition hover:shadow-md"
      style={{ background: 'linear-gradient(135deg, #7c2d12 0%, #b91c1c 45%, #ea580c 100%)' }}
    >
      <div className="flex items-center gap-4 px-5 py-4 text-white">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur text-2xl">
          {data.isLeader ? <Crown className="h-7 w-7 text-yellow-300" /> : <Flame className="h-7 w-7 text-orange-300" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            {data.isLeader ? 'Vas primero' : 'Última chance'}
          </p>
          {data.isLeader ? (
            <p className="mt-0.5 text-sm font-semibold leading-snug">
              👑 Lideras la tabla con <strong>+{data.gap} pts</strong> sobre {data.leaderName}. Pero ojo: aún hay hasta <strong>{data.maxRemaining} pts</strong> en juego entre {partidos}. No te duermas.
            </p>
          ) : data.reachable ? (
            <p className="mt-0.5 text-sm font-semibold leading-snug">
              🔥 Estás a <strong>{data.gap} pts</strong> de {data.leaderName}. Entre {partidos} hay hasta <strong>{data.maxRemaining} pts</strong> en juego. ¡Todavía puedes remontar! Un marcador exacto en la Final vale 15 pts.
            </p>
          ) : (
            <p className="mt-0.5 text-sm font-semibold leading-snug">
              Estás a {data.gap} pts del líder y quedan {data.maxRemaining} en juego... la mate no da 😅, pero cada punto cuenta para defender tu puesto en la polla. ¡Predice {partidos}!
            </p>
          )}
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-white/50 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </Link>
  )
}
