-- =============================================
-- MUNDIAL PRODE 2026 — RESET COMPLETO + SCHEMA
-- Ejecutar TODO en Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. BORRAR TODO EN ORDEN CORRECTO
-- =============================================
DROP VIEW IF EXISTS public.leaderboard CASCADE;
DROP FUNCTION IF EXISTS public.update_match_predictions(uuid, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_prediction_points(integer, integer, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_profile_points(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.bracket_predictions CASCADE;
DROP TABLE IF EXISTS public.match_goal_scorers CASCADE;
DROP TABLE IF EXISTS public.predictions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;
DROP TABLE IF EXISTS public.scoring_settings CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpiar usuarios de auth (opcional - descomentar si querés borrar TODO)
-- DELETE FROM auth.users WHERE email IN ('admin@prode.com', 'jugador@prode.com');

-- =============================================
-- 2. EXTENSIONES
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 3. TABLA: profiles (usuarios del prode)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  favorite_team TEXT,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfil visible para todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuario edita su propio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, favorite_team)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'favorite_team'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================
-- 4. TABLA: teams (equipos del mundial)
-- =============================================
CREATE TABLE public.teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  flag_emoji TEXT, -- codigo de bandera para FlagCDN (ej: mx, gb-eng) o emoji legacy
  group_name TEXT NOT NULL CHECK (group_name IN ('A','B','C','D','E','F','G','H','I','J','K','L')),
  confederation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  shirt_number INTEGER,
  position TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX players_team_id_idx ON public.players(team_id);
CREATE INDEX players_active_idx ON public.players(active);

-- =============================================
-- 5. TABLA: matches (partidos)
-- =============================================
CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_number INTEGER NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN (
    'group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'
  )),
  group_name TEXT,
  home_team_id UUID REFERENCES public.teams(id),
  away_team_id UUID REFERENCES public.teams(id),
  home_score INTEGER,
  away_score INTEGER,
  winner_team_id UUID REFERENCES public.teams(id),
  is_draw BOOLEAN DEFAULT false,
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  predictions_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. TABLA: predictions (predicciones de usuarios)
-- =============================================
CREATE TABLE public.predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  predicted_outcome TEXT CHECK (predicted_outcome IN ('home', 'away', 'draw')),
  predicted_home_score INTEGER,
  predicted_away_score INTEGER,
  predicted_winner_id UUID REFERENCES public.teams(id),
  predicted_scorer_id UUID REFERENCES public.players(id),
  outcome_points INTEGER NOT NULL DEFAULT 0,
  scorer_points INTEGER NOT NULL DEFAULT 0,
  exact_score_points INTEGER NOT NULL DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  is_exact_score BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, match_id)
);

CREATE TABLE public.match_goal_scorers (
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (match_id, player_id)
);

CREATE INDEX match_goal_scorers_player_id_idx ON public.match_goal_scorers(player_id);

CREATE TABLE public.scoring_settings (
  prediction_type TEXT PRIMARY KEY CHECK (prediction_type IN ('outcome', 'scorer', 'exact_score')),
  points INTEGER NOT NULL CHECK (points >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.scoring_settings (prediction_type, points)
VALUES ('outcome', 1), ('scorer', 2), ('exact_score', 3);

-- RLS para predicciones
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuario ve sus propias predicciones" ON public.predictions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuario crea sus predicciones" ON public.predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuario edita sus predicciones (si no esta bloqueado)" ON public.predictions
  FOR UPDATE USING (
    auth.uid() = user_id
    AND NOT (SELECT predictions_locked FROM public.matches WHERE id = match_id)
  );

-- =============================================
-- 7. TABLA: bracket_predictions (predicciones del bracket)
-- =============================================
CREATE TABLE public.bracket_predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final')),
  slot_key TEXT NOT NULL,
  team_id UUID REFERENCES public.teams(id),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, stage, slot_key)
);

-- RLS bracket
ALTER TABLE public.bracket_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bracket visible para todos" ON public.bracket_predictions FOR SELECT USING (true);
CREATE POLICY "Usuario crea su bracket" ON public.bracket_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuario edita su bracket" ON public.bracket_predictions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.recalculate_profile_points(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_points = COALESCE((SELECT SUM(points_earned) FROM public.predictions WHERE user_id = p_user_id), 0),
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. FUNCION: actualizar puntos al cargar resultado
-- =============================================
CREATE OR REPLACE FUNCTION public.update_match_predictions(
  p_match_id UUID,
  p_home_score INTEGER,
  p_away_score INTEGER
) RETURNS VOID AS $$
DECLARE
  v_pred RECORD;
  v_outcome TEXT;
  v_outcome_points INTEGER := 1;
  v_scorer_points INTEGER := 2;
  v_exact_points INTEGER := 3;
  v_calc_outcome INTEGER;
  v_calc_scorer INTEGER;
  v_calc_exact INTEGER;
BEGIN
  IF p_home_score > p_away_score THEN v_outcome := 'home';
  ELSIF p_away_score > p_home_score THEN v_outcome := 'away';
  ELSE v_outcome := 'draw';
  END IF;

  SELECT points INTO v_outcome_points FROM public.scoring_settings WHERE prediction_type = 'outcome';
  SELECT points INTO v_scorer_points FROM public.scoring_settings WHERE prediction_type = 'scorer';
  SELECT points INTO v_exact_points FROM public.scoring_settings WHERE prediction_type = 'exact_score';

  FOR v_pred IN
    SELECT * FROM public.predictions WHERE match_id = p_match_id
  LOOP
    v_calc_outcome := CASE
      WHEN v_pred.predicted_outcome IS NOT NULL AND v_pred.predicted_outcome = v_outcome THEN COALESCE(v_outcome_points, 1)
      ELSE 0
    END;

    v_calc_scorer := CASE
      WHEN v_pred.predicted_scorer_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.match_goal_scorers mgs
        WHERE mgs.match_id = p_match_id AND mgs.player_id = v_pred.predicted_scorer_id
      ) THEN COALESCE(v_scorer_points, 2)
      ELSE 0
    END;

    v_calc_exact := CASE
      WHEN v_pred.predicted_home_score IS NOT NULL
        AND v_pred.predicted_away_score IS NOT NULL
        AND v_pred.predicted_home_score = p_home_score
        AND v_pred.predicted_away_score = p_away_score
      THEN COALESCE(v_exact_points, 3)
      ELSE 0
    END;

    UPDATE public.predictions
    SET
      outcome_points = v_calc_outcome,
      scorer_points = v_calc_scorer,
      exact_score_points = v_calc_exact,
      points_earned = v_calc_outcome + v_calc_scorer + v_calc_exact,
      is_exact_score = (v_calc_exact > 0),
      updated_at = NOW()
    WHERE id = v_pred.id;

    PERFORM public.recalculate_profile_points(v_pred.user_id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. VISTA: leaderboard
-- =============================================
CREATE VIEW public.leaderboard AS
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.favorite_team,
    p.total_points,
    COUNT(pr.id) FILTER (WHERE pr.points_earned > 0) AS predictions_correct,
    COUNT(pr.id) FILTER (WHERE pr.is_exact_score) AS exact_scores,
    COUNT(pr.id) AS predictions_total,
    RANK() OVER (ORDER BY p.total_points DESC) AS position
  FROM public.profiles p
  LEFT JOIN public.predictions pr ON pr.user_id = p.id
  WHERE p.role = 'player'
  GROUP BY p.id
  ORDER BY p.total_points DESC;
