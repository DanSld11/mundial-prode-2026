import { getPronosticosData } from './actions'
import GroupCard from './GroupCard'
import SpecialCards from './SpecialCard'
import { Info, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PronosticosPage() {
  const { uid, teams, groupPreds, specialPreds, specialResults, players, tournamentStart } = await getPronosticosData()

  // El torneo bloqueó los pronósticos si ya arrancó el primer partido
  const isLocked = !!tournamentStart && new Date(tournamentStart) <= new Date()

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

      {/* Info / lock banner */}
      {isLocked ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 px-4 py-3">
          <Lock className="h-4 w-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pronósticos cerrados — el torneo ya comenzó</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              Ya no es posible modificar tus pronósticos. Los puntos se calcularán al finalizar la fase de grupos.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 px-4 py-3 text-sm text-blue-800 dark:text-blue-300">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Los pronósticos de grupo se guardan automáticamente al seleccionar. Cada equipo solo puede
            aparecer una vez por grupo. <strong>Las predicciones se cierran automáticamente al inicio del torneo.</strong>
          </p>
        </div>
      )}

      {/* ── Fase de Grupos ── */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Posiciones por Grupo</h3>
        {groupNames.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay equipos cargados aún.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {groupNames.map(gName => (
              <GroupCard
                key={gName}
                groupName={gName}
                teams={groupMap[gName]}
                predictions={groupPreds.filter((p: any) => p.group_name === gName)}
                locked={isLocked}
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
          tournamentStarted={isLocked}
        />
      </section>
    </div>
  )
}
