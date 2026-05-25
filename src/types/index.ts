// =============================================
// TIPOS TYPESCRIPT — MUNDIAL PERÚ 2026
// =============================================

export type Role = 'player' | 'admin'
export type Stage = 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export type GroupName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'
export type PredictedOutcome = 'home' | 'away' | 'draw'
export type PredictionType = 'outcome' | 'scorer' | 'exact_score'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  favorite_team: string | null
  role: Role
  total_points: number
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  name_es: string
  code: string         // ej: 'ARG', 'BRA'
  flag_emoji: string | null  // codigo FlagCDN (mx, gb-eng) o emoji legacy
  group_name: GroupName
  confederation: string | null
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  name: string
  shirt_number: number | null
  position: string | null
  active: boolean
  created_at: string
  updated_at: string
  team?: Team
}

export interface Match {
  id: string
  match_number: number
  stage: Stage
  group_name: GroupName | null
  home_team_id: string | null
  away_team_id: string | null
  home_score: number | null
  away_score: number | null
  winner_team_id: string | null
  is_draw: boolean
  match_date: string
  venue: string | null
  city: string | null
  status: MatchStatus
  predictions_locked: boolean
  created_at: string
  updated_at: string
  // joined
  home_team?: Team
  away_team?: Team
  winner_team?: Team
}

export interface Prediction {
  id: string
  user_id: string
  match_id: string
  predicted_outcome: PredictedOutcome | null
  predicted_winner_id: string | null
  predicted_scorer_id: string | null
  predicted_home_score: number | null
  predicted_away_score: number | null
  outcome_points: number
  scorer_points: number
  exact_score_points: number
  points_earned: number
  is_exact_score: boolean
  created_at: string
  updated_at: string
  // joined
  match?: Match
  predicted_scorer?: Player
}

export interface ScoringSetting {
  prediction_type: PredictionType
  points: number
  updated_at: string
}

export interface BracketPrediction {
  id: string
  user_id: string
  stage: Stage
  slot_key: string
  team_id: string | null
  points_earned: number
  created_at: string
  updated_at: string
  // joined
  team?: Team
}

// ── Wallet ──────────────────────────────────────────────
export interface Wallet {
  user_id: string
  balance: number
  total_deposited: number
  total_wagered: number
  total_won: number
  updated_at: string
}

export type TransactionType = 'deposit' | 'pool_entry' | 'pool_prize' | 'refund' | 'admin_adjustment'

export interface WalletTransaction {
  id: string
  user_id: string
  amount: number
  balance_after: number
  type: TransactionType
  description: string | null
  pool_id: string | null
  created_at: string
}

// ── Pollas (grupos de apuesta) ───────────────────────────
export type PoolStatus = 'open' | 'active' | 'finished' | 'paid'

export interface Pool {
  id: string
  name: string
  description: string | null
  invite_code: string
  created_by: string
  entry_fee: number
  max_participants: number | null
  prize_1st: number
  prize_2nd: number
  prize_3rd: number
  status: PoolStatus
  created_at: string
  updated_at: string
  // joined
  creator?: { username: string }
  member_count?: number
}

export interface PoolMember {
  pool_id: string
  user_id: string
  joined_at: string
  final_position: number | null
  prize_earned: number
  paid_out: boolean
  // joined
  profile?: { username: string; total_points: number; avatar_url: string | null }
}

export interface LeaderboardEntry {
  id: string
  username: string
  avatar_url: string | null
  favorite_team: string | null
  total_points: number
  predictions_correct: number
  exact_scores: number
  predictions_total: number
  position: number
}

// Puntuación del sistema
export const POINTS_CONFIG = {
  outcome: 1,              // acertar ganador / empate
  scorer: 2,               // acertar jugador que anota
  exact_score: 3,          // acertar marcador exacto
  correct_winner: 1,
  group_stage_qualifier: 1, // acertar equipo que clasifica
  round_of_16_winner: 3,
  quarterfinal_winner: 5,
  semifinal_winner: 8,
  champion: 15,
  runner_up: 10,
  third_place: 6,
} as const

export const STAGE_MULTIPLIERS: Record<Stage, number> = {
  group: 1,
  round_of_32: 1.5,
  round_of_16: 1.5,
  quarterfinal: 2,
  semifinal: 2.5,
  third_place: 2.5,
  final: 3,
}

export type PointsConfig = typeof POINTS_CONFIG
