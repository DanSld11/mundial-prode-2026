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
  flag_emoji text, -- codigo de bandera para FlagCDN (ej: mx, gb-eng) o emoji legacy
  group_name text not null check (group_name in ('A','B','C','D','E','F','G','H','I','J','K','L')),
  confederation text,       -- CONMEBOL, UEFA, etc.
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLA: players (jugadores por equipo)
-- =============================================
create table public.players (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  shirt_number integer,
  position text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index players_team_id_idx on public.players(team_id);
create index players_active_idx on public.players(active);

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
  predicted_outcome text check (predicted_outcome in ('home', 'away', 'draw')),
  predicted_home_score integer,
  predicted_away_score integer,
  predicted_winner_id uuid references public.teams(id),  -- null si predice empate
  predicted_scorer_id uuid references public.players(id),
  outcome_points integer not null default 0,
  scorer_points integer not null default 0,
  exact_score_points integer not null default 0,
  points_earned integer default 0,
  is_exact_score boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)  -- una predicción por partido por usuario
);

-- =============================================
-- TABLA: match_goal_scorers (goleadores reales)
-- =============================================
create table public.match_goal_scorers (
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (match_id, player_id)
);

create index match_goal_scorers_player_id_idx on public.match_goal_scorers(player_id);

-- =============================================
-- TABLA: scoring_settings (puntos configurables)
-- =============================================
create table public.scoring_settings (
  prediction_type text primary key check (prediction_type in ('outcome', 'scorer', 'exact_score')),
  points integer not null check (points >= 0),
  updated_at timestamptz not null default now()
);

insert into public.scoring_settings (prediction_type, points)
values ('outcome', 1), ('scorer', 2), ('exact_score', 3);

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
  stage text not null check (stage in ('round_of_32', 'round_of_16', 'quarterfinal', 'semifinal', 'third_place', 'final')),
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

create or replace function public.recalculate_profile_points(p_user_id uuid)
returns void as $$
begin
  update public.profiles
  set
    total_points = coalesce((select sum(points_earned) from public.predictions where user_id = p_user_id), 0),
    updated_at = now()
  where id = p_user_id;
end;
$$ language plpgsql security definer;

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
  v_outcome text;
  v_outcome_points integer := 1;
  v_scorer_points integer := 2;
  v_exact_points integer := 3;
  v_calc_outcome integer;
  v_calc_scorer integer;
  v_calc_exact integer;
begin
  if p_home_score > p_away_score then v_outcome := 'home';
  elsif p_away_score > p_home_score then v_outcome := 'away';
  else v_outcome := 'draw';
  end if;

  select points into v_outcome_points from public.scoring_settings where prediction_type = 'outcome';
  select points into v_scorer_points from public.scoring_settings where prediction_type = 'scorer';
  select points into v_exact_points from public.scoring_settings where prediction_type = 'exact_score';

  for v_pred in
    select * from public.predictions where match_id = p_match_id
  loop
    v_calc_outcome := case
      when v_pred.predicted_outcome is not null and v_pred.predicted_outcome = v_outcome then coalesce(v_outcome_points, 1)
      else 0
    end;

    v_calc_scorer := case
      when v_pred.predicted_scorer_id is not null and exists (
        select 1 from public.match_goal_scorers mgs
        where mgs.match_id = p_match_id and mgs.player_id = v_pred.predicted_scorer_id
      ) then coalesce(v_scorer_points, 2)
      else 0
    end;

    v_calc_exact := case
      when v_pred.predicted_home_score is not null
        and v_pred.predicted_away_score is not null
        and v_pred.predicted_home_score = p_home_score
        and v_pred.predicted_away_score = p_away_score
      then coalesce(v_exact_points, 3)
      else 0
    end;

    update public.predictions
    set
      outcome_points = v_calc_outcome,
      scorer_points = v_calc_scorer,
      exact_score_points = v_calc_exact,
      points_earned = v_calc_outcome + v_calc_scorer + v_calc_exact,
      is_exact_score = (v_calc_exact > 0),
      updated_at = now()
    where id = v_pred.id;

    perform public.recalculate_profile_points(v_pred.user_id);
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
