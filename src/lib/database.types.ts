export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          favorite_team: string | null
          role: string
          total_points: number
          coins: number
          last_daily_pack_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          favorite_team?: string | null
          role?: string
          total_points?: number
          coins?: number
          last_daily_pack_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          favorite_team?: string | null
          role?: string
          total_points?: number
          coins?: number
          last_daily_pack_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_stickers: {
        Row: {
          id: string
          user_id: string
          team_code: string
          player_name: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_code: string
          player_name: string
          quantity?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_code?: string
          player_name?: string
          quantity?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stickers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      system_settings: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          name_es: string
          code: string
          flag_emoji: string | null
          group_name: string
          confederation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          name_es: string
          code: string
          flag_emoji?: string | null
          group_name: string
          confederation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_es?: string
          code?: string
          flag_emoji?: string | null
          group_name?: string
          confederation?: string | null
          created_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          match_number: number
          stage: string
          group_name: string | null
          home_team_id: string | null
          away_team_id: string | null
          home_score: number | null
          away_score: number | null
          winner_team_id: string | null
          is_draw: boolean
          match_date: string
          venue: string | null
          city: string | null
          status: string
          predictions_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_number: number
          stage: string
          group_name?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          winner_team_id?: string | null
          is_draw?: boolean
          match_date: string
          venue?: string | null
          city?: string | null
          status?: string
          predictions_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_number?: number
          stage?: string
          group_name?: string | null
          home_team_id?: string | null
          away_team_id?: string | null
          home_score?: number | null
          away_score?: number | null
          winner_team_id?: string | null
          is_draw?: boolean
          match_date?: string
          venue?: string | null
          city?: string | null
          status?: string
          predictions_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id: string
          match_id: string
          predicted_home_score: number
          predicted_away_score: number
          predicted_winner_id?: string | null
          points_earned?: number
          is_exact_score?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          match_id?: string
          predicted_home_score?: number
          predicted_away_score?: number
          predicted_winner_id?: string | null
          points_earned?: number
          is_exact_score?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bracket_predictions: {
        Row: {
          id: string
          user_id: string
          stage: string
          slot_key: string
          team_id: string | null
          points_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stage: string
          slot_key: string
          team_id?: string | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stage?: string
          slot_key?: string
          team_id?: string | null
          points_earned?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
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
        Relationships: []
      }
    }
    Functions: {
      calculate_prediction_points: {
        Args: {
          p_predicted_home: number
          p_predicted_away: number
          p_actual_home: number
          p_actual_away: number
        }
        Returns: number
      }
      update_match_predictions: {
        Args: {
          p_match_id: string
          p_home_score: number
          p_away_score: number
        }
        Returns: undefined
      }
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
