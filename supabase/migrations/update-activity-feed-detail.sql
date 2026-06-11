-- Actualiza activity_feed para incluir desglose por tipo de acierto
-- y nombre del goleador predicho

DROP VIEW IF EXISTS public.activity_feed;

CREATE VIEW public.activity_feed AS
  SELECT
    pr.id,
    p.id           AS user_id,
    p.username,
    m.id           AS match_id,
    ht.name_es     AS home_name,
    at2.name_es    AS away_name,
    ht.code        AS home_code,
    at2.code       AS away_code,
    ht.flag_emoji  AS home_flag,
    at2.flag_emoji AS away_flag,
    m.home_score,
    m.away_score,
    pr.predicted_home_score,
    pr.predicted_away_score,
    pr.points_earned,
    pr.is_exact_score,
    pr.outcome_points,
    pr.scorer_points,
    pr.exact_score_points,
    pl.name        AS predicted_scorer_name,
    pr.updated_at  AS scored_at
  FROM public.predictions pr
  JOIN public.profiles p      ON p.id   = pr.user_id
  JOIN public.matches  m      ON m.id   = pr.match_id
  JOIN public.teams    ht     ON ht.id  = m.home_team_id
  JOIN public.teams    at2    ON at2.id = m.away_team_id
  LEFT JOIN public.players pl ON pl.id  = pr.predicted_scorer_id
  WHERE m.status = 'finished'
    AND pr.points_earned > 0
    AND p.role = 'player'
  ORDER BY pr.updated_at DESC;
