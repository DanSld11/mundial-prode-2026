-- =============================================
-- PASO 2: DESACTIVAR RLS TEMPORALMENTE
-- Ejecutar después del paso 1
-- =============================================

alter table public.players disable row level security;
alter table public.match_goal_scorers disable row level security;
alter table public.scoring_settings disable row level security;
