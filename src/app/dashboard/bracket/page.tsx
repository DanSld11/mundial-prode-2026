import { getBracketData } from './actions'
import BracketTree from './BracketTree'
import { GitBranch } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BracketPage() {
  const { matches } = await getBracketData()

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red text-white shadow-sm">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bebas text-3xl tracking-wide">Llaves Eliminatorias</h1>
            <p className="text-sm text-muted-foreground">Mundial 2026 · Árbol del torneo</p>
          </div>
        </div>
      </div>

      {/* Scroll hint on mobile */}
      <p className="text-xs text-muted-foreground text-center lg:hidden">
        ← Deslizá para ver el bracket completo →
      </p>

      {/* Bracket tree */}
      {matches.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center space-y-3">
          <div className="text-4xl">⏳</div>
          <p className="font-bold text-lg">Fase eliminatoria próximamente</p>
          <p className="text-sm text-muted-foreground">
            Los partidos se cargarán una vez terminada la fase de grupos.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-4 shadow-sm overflow-hidden">
          <BracketTree matches={matches as any} />
        </div>
      )}
    </div>
  )
}
