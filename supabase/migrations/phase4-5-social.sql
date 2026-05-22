-- =============================================
-- FASE 4 & 5: Social Features
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Actualizar RLS de predictions para permitir leer predicciones de partidos finalizados
DROP POLICY IF EXISTS "Usuario ve sus propias predicciones" ON public.predictions;
CREATE POLICY "Predicciones propias o de partidos finalizados" ON public.predictions
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = match_id AND m.status = 'finished'
    )
  );

-- 2. Vista de feed de actividad (solo predicciones exitosas de partidos terminados)
DROP VIEW IF EXISTS public.activity_feed;
CREATE VIEW public.activity_feed AS
  SELECT
    pr.id,
    p.id        AS user_id,
    p.username,
    m.id        AS match_id,
    ht.name_es  AS home_name,
    at2.name_es AS away_name,
    ht.code     AS home_code,
    at2.code    AS away_code,
    ht.flag_emoji  AS home_flag,
    at2.flag_emoji AS away_flag,
    m.home_score,
    m.away_score,
    pr.predicted_home_score,
    pr.predicted_away_score,
    pr.points_earned,
    pr.is_exact_score,
    pr.outcome_points,
    pr.updated_at AS scored_at
  FROM public.predictions pr
  JOIN public.profiles p     ON p.id  = pr.user_id
  JOIN public.matches  m     ON m.id  = pr.match_id
  JOIN public.teams    ht    ON ht.id = m.home_team_id
  JOIN public.teams    at2   ON at2.id= m.away_team_id
  WHERE m.status = 'finished'
    AND pr.points_earned > 0
    AND p.role = 'player'
  ORDER BY pr.updated_at DESC;

-- 3. Tabla de mensajes de polla (chat)
CREATE TABLE IF NOT EXISTS public.pool_messages (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pool_id    UUID REFERENCES public.pools(id)    ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message    TEXT NOT NULL CHECK (length(message) >= 1 AND length(message) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pool_messages_pool_id_idx    ON public.pool_messages(pool_id);
CREATE INDEX IF NOT EXISTS pool_messages_created_at_idx ON public.pool_messages(created_at DESC);

ALTER TABLE public.pool_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Miembros pueden leer mensajes"  ON public.pool_messages;
DROP POLICY IF EXISTS "Miembros pueden enviar mensajes" ON public.pool_messages;

CREATE POLICY "Miembros pueden leer mensajes" ON public.pool_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pool_members pm
      WHERE pm.pool_id = pool_messages.pool_id AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Miembros pueden enviar mensajes" ON public.pool_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.pool_members pm
      WHERE pm.pool_id = pool_messages.pool_id AND pm.user_id = auth.uid()
    )
  );
