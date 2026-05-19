// =============================================
// TIPOS TYPESCRIPT — MUNDIAL PRODE 2026
// =============================================

export type Role = 'player' | 'admin'
export type Stage = 'group' | 'round_of_32' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'third_place' | 'final'
export type MatchStatus = 'scheduled' | 'live' | 'finished'
export type GroupName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L'

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
  predicted_home_score: number
  predicted_away_score: number
  predicted_winner_id: string | null
  points_earned: number
  is_exact_score: boolean
  created_at: string
  updated_at: string
  // joined
  match?: Match
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
  correct_winner: 2,       // acertar ganador / empate
  exact_score: 4,          // acertar marcador exacto
  group_stage_qualifier: 1, // acertar equipo que clasifica
  round_of_16_winner: 3,
  quarterfinal_winner: 5,
  semifinal_winner: 8,
  champion: 15,
  runner_up: 10,
  third_place: 6,
} as const

export type PointsConfig = typeof POINTS_CONFIG
