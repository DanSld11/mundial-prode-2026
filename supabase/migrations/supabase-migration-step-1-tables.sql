-- =============================================
-- PASO 1: TABLAS Y COLUMNAS
-- Ejecutar primero en Supabase SQL Editor
-- =============================================

create extension if not exists "uuid-ossp";

create table if not exists public.players (
  id uuid default uuid_generate_v4() primary key,
  team_id uuid references public.teams(id) on delete cascade not null,
  name text not null,
  shirt_number integer,
  position text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists players_team_id_idx on public.players(team_id);
create index if not exists players_active_idx on public.players(active);

create table if not exists public.match_goal_scorers (
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (match_id, player_id)
);

create index if not exists match_goal_scorers_player_id_idx on public.match_goal_scorers(player_id);

create table if not exists public.scoring_settings (
  prediction_type text primary key check (prediction_type in ('outcome', 'scorer', 'exact_score')),
  points integer not null check (points >= 0),
  updated_at timestamptz not null default now()
);

insert into public.scoring_settings (prediction_type, points)
values
  ('outcome', 1),
  ('scorer', 2),
  ('exact_score', 3)
on conflict (prediction_type) do nothing;

alter table public.predictions
  alter column predicted_home_score drop not null,
  alter column predicted_away_score drop not null;

alter table public.predictions
  add column if not exists predicted_outcome text check (predicted_outcome in ('home', 'away', 'draw')),
  add column if not exists predicted_scorer_id uuid references public.players(id),
  add column if not exists outcome_points integer not null default 0,
  add column if not exists scorer_points integer not null default 0,
  add column if not exists exact_score_points integer not null default 0;
