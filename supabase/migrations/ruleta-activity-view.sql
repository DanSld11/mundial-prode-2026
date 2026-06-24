-- Vista pública de actividad de la ruleta (sin RLS, como activity_feed)
CREATE OR REPLACE VIEW public.ruleta_activity AS
  SELECT
    rs.id,
    rs.user_id,
    p.username,
    rs.result_label,
    rs.result_type,
    rs.points_change,
    rs.coins_spent,
    rs.is_free_retry,
    rs.created_at
  FROM public.ruleta_spins rs
  JOIN public.profiles p ON p.id = rs.user_id
  ORDER BY rs.created_at DESC;
