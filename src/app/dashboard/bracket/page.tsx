import { getBracketData } from './actions'
import BracketClient from './BracketClient'

export const dynamic = 'force-dynamic'

export default async function BracketPage() {
  const { uid, matches, predictions } = await getBracketData()

  return (
    <BracketClient
      uid={uid}
      matches={matches as any}
      predictions={predictions as any}
    />
  )
}
