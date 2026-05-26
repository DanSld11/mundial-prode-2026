import { getPronosticosData } from './actions'
import GroupCard from './GroupCard'
import SpecialCards from './SpecialCard'
import { Info } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PronosticosPage() {
  const { uid, teams, groupPreds, specialPreds, specialResults, players } = await getPronosticosData()

  if (!uid) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-lg font-semibold">Debés iniciar sesión para ver tus pronósticos.</p>
      </div>
    )
  }

  // Group teams by group_name
  const groupMap: Record<string, typeof teams> = {}
  for (const t of teams) {
    if (!t.group_name) continue
    if (!groupMap[t.group_name]) groupMap[t.group_name] = []
    groupMap[t.group_name].push(t)
  }
  const groupNames = Object.keys(groupMap).sort()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Pronósticos</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Predecí las posiciones de cada grupo y los premios individuales del Mundial 2026.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Los pronósticos de grupo se guardan automáticamente al seleccionar. Cada equipo solo puede
          aparecer una vez por grupo. Las predicciones se cierran al inicio del torneo.
        </p>
      </div>

      {/* ── Fase de Grupos ── */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Posiciones por Grupo</h3>
        {groupNames.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay equipos cargados aún.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {groupNames.map(gName => (
              <GroupCard
                key={gName}
                groupName={gName}
                teams={groupMap[gName]}
                predictions={groupPreds.filter((p: any) => p.group_name === gName)}
                locked={false}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Premios Especiales ── */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Premios Especiales</h3>
        <SpecialCards
          teams={teams}
          players={players}
          predictions={specialPreds}
          results={specialResults}
        />
      </section>
    </div>
  )
}
