-- Actualiza la vista leaderboard agregando columnas separadas:
-- outcomes_correct (ganador), scorers_correct (goleador),
-- exact_scores (marcador), group_points (grupos), special_points (especiales)

CREATE OR REPLACE VIEW public.leaderboard AS
  WITH match_stats AS (
    SELECT
      user_id,
      COUNT(*) FILTER (WHERE outcome_points  > 0) AS outcomes_correct,
      COUNT(*) FILTER (WHERE scorer_points   > 0) AS scorers_correct,
      COUNT(*) FILTER (WHERE is_exact_score)       AS exact_scores
    FROM public.predictions
    GROUP BY user_id
  ),
  group_stats AS (
    SELECT user_id, COALESCE(SUM(points_earned), 0) AS group_points
    FROM public.group_predictions
    GROUP BY user_id
  ),
  special_stats AS (
    SELECT user_id, COALESCE(SUM(points_earned), 0) AS special_points
    FROM public.special_predictions
    GROUP BY user_id
  )
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.favorite_team,
    p.total_points,
    COALESCE(ms.outcomes_correct, 0) AS outcomes_correct,
    COALESCE(ms.scorers_correct,  0) AS scorers_correct,
    COALESCE(ms.exact_scores,     0) AS exact_scores,
    COALESCE(gs.group_points,     0) AS group_points,
    COALESCE(ss.special_points,   0) AS special_points,
    RANK() OVER (ORDER BY p.total_points DESC) AS position
  FROM public.profiles p
  LEFT JOIN match_stats   ms ON ms.user_id = p.id
  LEFT JOIN group_stats   gs ON gs.user_id = p.id
  LEFT JOIN special_stats ss ON ss.user_id = p.id
  WHERE p.role = 'player'
  ORDER BY p.total_points DESC;
