import type { SupabaseClient } from '@supabase/supabase-js'

// Fuente única de verdad para total_points de cada perfil.
// Suma TODAS las fuentes de puntos; cualquier fuente nueva se agrega SOLO acá
// y todos los caminos (guardar partido, bracket, recalcular todo) quedan al día.
//
// Fuentes:
//   1. predictions.points_earned          (partidos)
//   2. group_predictions.points_earned    (pronósticos de grupos)
//   3. special_predictions.points_earned  (premios especiales)
//   4. bracket_predictions.points_earned  (llaves eliminatorias)
//   5. user_notifications.points_change   (ajustes manuales del admin)
//   6. ruleta_spins.points_change         (giros de ruleta)

const EARNED_TABLES = ['predictions', 'group_predictions', 'special_predictions', 'bracket_predictions'] as const

export async function recomputeUserTotals(db: SupabaseClient, userIds?: string[]) {
  const withUserFilter = (q: any) =>
    userIds && userIds.length > 0 ? q.in('user_id', userIds) : q

  const earnedQueries = EARNED_TABLES.map((table) =>
    withUserFilter(db.from(table).select('user_id, points_earned').limit(50000))
  )
  const adjQuery = withUserFilter(
    db.from('user_notifications').select('user_id, points_change').eq('type', 'point_adjustment').limit(10000)
  )
  const spinQuery = withUserFilter(
    db.from('ruleta_spins').select('user_id, points_change').limit(10000)
  )

  const results = await Promise.all([...earnedQueries, adjQuery, spinQuery])

  const totals: Record<string, number> = {}
  // Si se pidieron usuarios específicos, inicializar en 0 para que un usuario
  // sin filas en ninguna tabla igual reciba su update (total = 0).
  for (const uid of userIds ?? []) totals[uid] = 0

  for (let i = 0; i < EARNED_TABLES.length; i++) {
    for (const r of results[i].data ?? []) {
      totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_earned ?? 0)
    }
  }
  for (const r of results[EARNED_TABLES.length].data ?? []) {
    totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_change ?? 0)
  }
  for (const r of results[EARNED_TABLES.length + 1].data ?? []) {
    totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.points_change ?? 0)
  }

  const now = new Date().toISOString()
  const entries = Object.entries(totals)
  const PAR = 50
  for (let i = 0; i < entries.length; i += PAR) {
    await Promise.all(
      entries.slice(i, i + PAR).map(([userId, total]) =>
        db.from('profiles').update({ total_points: Math.max(0, total), updated_at: now }).eq('id', userId)
      )
    )
  }

  return totals
}
