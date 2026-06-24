import { getRuletaPageData } from './actions'
import RuletaClient from './RuletaClient'
import { Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RuletaPage() {
  const data = await getRuletaPageData()

  return (
    <div className="px-4 py-5 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white shadow-md">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold">Ruleta MundialCoins</h1>
          <p className="text-xs text-muted-foreground">Gana o pierde puntos del torneo</p>
        </div>
      </div>

      <RuletaClient
        isActive={data.isActive}
        hasAccess={data.hasAccess}
        priceCoins={data.priceCoins}
        slots={data.slots}
        spins={data.spins}
        coinBalance={data.coinBalance}
        totalPoints={data.totalPoints}
        isAdmin={data.isAdmin}
        hasWeeklyFreeSpin={data.hasWeeklyFreeSpin}
        weeklyFreeSpinResetsAt={data.weeklyFreeSpinResetsAt}
      />
    </div>
  )
}
