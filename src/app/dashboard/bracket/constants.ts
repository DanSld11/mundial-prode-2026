export const KNOCKOUT_STAGES = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'] as const

export const STAGE_LABELS: Record<string, string> = {
  round_of_32: 'Ronda de 32',
  round_of_16: 'Octavos de Final',
  quarterfinal: 'Cuartos de Final',
  semifinal: 'Semifinales',
  third_place: 'Tercer Puesto',
  final: 'Gran Final',
}

export const STAGE_ORDER = ['round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final']
