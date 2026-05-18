-- =============================================
-- MUNDIAL PRODE 2026 — SUPABASE SCHEMA
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- EXTENSION
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLA: profiles (usuarios del prode)
-- =============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  favorite_team text,
  role text not null default 'player' check (role in ('player', 'admin')),
  total_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
create policy "Perfil visible para todos" on public.profiles for select using (true);
create policy "Usuario edita su propio perfil" on public.profiles for update using (auth.uid() = id);

-- Trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TABLA: teams (equipos del mundial)
-- =============================================
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  name_es text not null,  -- nombre en español
  code text not null unique,  -- código FIFA 3 letras: ARG, BRA, etc.
  flag_emoji text,
  group_name text not null check (group_name in ('A','B','C','D','E','F','G','H')),
  confederation text,       -- CONMEBOL, UEFA, etc.
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLA: matches (partidos)
-- =============================================
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  match_number integer not null,
  stage text not null check (stage in (
    'group', 'round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final'
  )),
  group_name text,  -- solo para fase de grupos
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_score integer,  -- null hasta que se juegue
  away_score integer,
  winner_team_id uuid references public.teams(id),  -- null si empate
  is_draw boolean default false,
  match_date timestamptz not null,
  venue text,
  city text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  predictions_locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLA: predictions (predicciones de usuarios)
-- =============================================
create table public.predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  match_id uuid references public.matches(id) on delete cascade not null,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  predicted_winner_id uuid references public.teams(id),  -- null si predice empate
  points_earned integer default 0,
  is_exact_score boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)  -- una predicción por partido por usuario
);

-- RLS para predicciones
alter table public.predictions enable row level security;
create policy "Usuario ve sus propias predicciones" on public.predictions
  for select using (auth.uid() = user_id);
create policy "Usuario crea sus predicciones" on public.predictions
  for insert with check (auth.uid() = user_id);
create policy "Usuario edita sus predicciones (si no está bloqueado)" on public.predictions
  for update using (
    auth.uid() = user_id
    and not (select predictions_locked from public.matches where id = match_id)
  );

-- =============================================
-- TABLA: bracket_predictions (predicciones del bracket)
-- =============================================
create table public.bracket_predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stage text not null check (stage in ('round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'final')),
  slot_key text not null,   -- ej: "QF1", "SF2", "CHAMPION"
  team_id uuid references public.teams(id),
  points_earned integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, stage, slot_key)
);

-- RLS bracket
alter table public.bracket_predictions enable row level security;
create policy "Bracket visible para todos" on public.bracket_predictions for select using (true);
create policy "Usuario crea su bracket" on public.bracket_predictions
  for insert with check (auth.uid() = user_id);
create policy "Usuario edita su bracket" on public.bracket_predictions
  for update using (auth.uid() = user_id);

-- =============================================
-- FUNCIÓN: calcular puntos de una predicción
-- =============================================
create or replace function public.calculate_prediction_points(
  p_predicted_home integer,
  p_predicted_away integer,
  p_actual_home integer,
  p_actual_away integer
) returns integer as $$
declare
  v_points integer := 0;
  v_predicted_winner text;
  v_actual_winner text;
begin
  -- Determinar ganador predicho
  if p_predicted_home > p_predicted_away then v_predicted_winner := 'home';
  elsif p_predicted_away > p_predicted_home then v_predicted_winner := 'away';
  else v_predicted_winner := 'draw';
  end if;

  -- Determinar ganador real
  if p_actual_home > p_actual_away then v_actual_winner := 'home';
  elsif p_actual_away > p_actual_home then v_actual_winner := 'away';
  else v_actual_winner := 'draw';
  end if;

  -- Resultado exacto: 4 puntos
  if p_predicted_home = p_actual_home and p_predicted_away = p_actual_away then
    return 4;
  end if;

  -- Solo ganador correcto: 2 puntos
  if v_predicted_winner = v_actual_winner then
    return 2;
  end if;

  return 0;
end;
$$ language plpgsql;

-- =============================================
-- FUNCIÓN: actualizar puntos al cargar resultado
-- =============================================
create or replace function public.update_match_predictions(
  p_match_id uuid,
  p_home_score integer,
  p_away_score integer
) returns void as $$
declare
  v_pred record;
  v_points integer;
begin
  -- Actualizar cada predicción del partido
  for v_pred in
    select * from public.predictions where match_id = p_match_id
  loop
    v_points := public.calculate_prediction_points(
      v_pred.predicted_home_score,
      v_pred.predicted_away_score,
      p_home_score,
      p_away_score
    );

    update public.predictions
    set
      points_earned = v_points,
      is_exact_score = (v_pred.predicted_home_score = p_home_score and v_pred.predicted_away_score = p_away_score),
      updated_at = now()
    where id = v_pred.id;

    -- Actualizar total de puntos del usuario
    update public.profiles
    set
      total_points = total_points + v_points,
      updated_at = now()
    where id = v_pred.user_id;
  end loop;
end;
$$ language plpgsql security definer;

-- =============================================
-- VISTA: leaderboard
-- =============================================
create view public.leaderboard as
  select
    p.id,
    p.username,
    p.avatar_url,
    p.favorite_team,
    p.total_points,
    count(pr.id) filter (where pr.points_earned > 0) as predictions_correct,
    count(pr.id) filter (where pr.is_exact_score) as exact_scores,
    count(pr.id) as predictions_total,
    rank() over (order by p.total_points desc) as position
  from public.profiles p
  left join public.predictions pr on pr.user_id = p.id
  where p.role = 'player'
  group by p.id
  order by p.total_points desc;
