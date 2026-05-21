/**
 * Badge definitions and calculation logic.
 * All computed client-side from the predictions array.
 */

export interface Badge {
  id: string
  emoji: string
  title: string
  description: string
  earned: boolean
}

export function computeBadges(predictions: any[]): Badge[] {
  const finished = predictions.filter((p) => p.match?.status === 'finished')
  const correct = finished.filter((p) => (p.points_earned ?? 0) > 0)
  const exact = finished.filter((p) => p.is_exact_score || (p.exact_score_points ?? 0) > 0)

  // Compute longest streak of correct predictions
  let currentStreak = 0
  let maxStreak = 0
  for (const p of finished) {
    if ((p.points_earned ?? 0) > 0) {
      currentStreak++
      if (currentStreak > maxStreak) maxStreak = currentStreak
    } else {
      currentStreak = 0
    }
  }

  const totalPredictions = predictions.length

  return [
    {
      id: 'first_pick',
      emoji: '🎯',
      title: 'Primera predicción',
      description: 'Hiciste tu primera predicción.',
      earned: totalPredictions >= 1,
    },
    {
      id: 'ten_picks',
      emoji: '📋',
      title: 'Apostador comprometido',
      description: 'Realizaste 10 predicciones.',
      earned: totalPredictions >= 10,
    },
    {
      id: 'full_house',
      emoji: '🏟️',
      title: 'Estadio lleno',
      description: 'Predijiste 30 o más partidos.',
      earned: totalPredictions >= 30,
    },
    {
      id: 'first_correct',
      emoji: '✅',
      title: 'Primer acierto',
      description: 'Acertaste el resultado de un partido.',
      earned: correct.length >= 1,
    },
    {
      id: 'five_correct',
      emoji: '🔥',
      title: 'En racha',
      description: 'Acertaste 5 resultados.',
      earned: correct.length >= 5,
    },
    {
      id: 'ten_correct',
      emoji: '🌟',
      title: 'Adivino',
      description: 'Acertaste 10 resultados.',
      earned: correct.length >= 10,
    },
    {
      id: 'first_exact',
      emoji: '🎰',
      title: 'Marcador exacto',
      description: 'Acertaste el marcador exacto de un partido.',
      earned: exact.length >= 1,
    },
    {
      id: 'three_exact',
      emoji: '💎',
      title: 'Ojo de halcón',
      description: 'Acertaste 3 marcadores exactos.',
      earned: exact.length >= 3,
    },
    {
      id: 'streak_3',
      emoji: '⚡',
      title: 'Racha de 3',
      description: 'Acertaste 3 partidos seguidos.',
      earned: maxStreak >= 3,
    },
    {
      id: 'streak_5',
      emoji: '🚀',
      title: 'Imparable',
      description: 'Acertaste 5 partidos seguidos.',
      earned: maxStreak >= 5,
    },
    {
      id: 'high_accuracy',
      emoji: '🧠',
      title: 'Estratega',
      description: 'Precisión mayor al 60% con 10+ partidos jugados.',
      earned: finished.length >= 10 && correct.length / finished.length >= 0.6,
    },
  ]
}
