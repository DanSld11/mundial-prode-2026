-- =============================================
-- MIGRACION: NUEVO SISTEMA DE PREDICCIONES
-- Ejecutar en Supabase SQL Editor
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

alter table public.players disable row level security;
create index if not exists players_team_id_idx on public.players(team_id);
create index if not exists players_active_idx on public.players(active);

create table if not exists public.match_goal_scorers (
  match_id uuid references public.matches(id) on delete cascade not null,
  player_id uuid references public.players(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  primary key (match_id, player_id)
);

alter table public.match_goal_scorers disable row level security;
create index if not exists match_goal_scorers_player_id_idx on public.match_goal_scorers(player_id);

create table if not exists public.scoring_settings (
  prediction_type text primary key check (prediction_type in ('outcome', 'scorer', 'exact_score')),
  points integer not null check (points >= 0),
  updated_at timestamptz not null default now()
);

alter table public.scoring_settings disable row level security;

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

drop function if exists public.recalculate_profile_points(uuid);

create or replace function public.recalculate_profile_points(p_user_id uuid)
returns void as $fn$
begin
  update public.profiles
  set
    total_points = coalesce((
      select sum(points_earned)
      from public.predictions
      where user_id = p_user_id
    ), 0),
    updated_at = now()
  where id = p_user_id;
end;
$fn$ language plpgsql security definer;

drop function if exists public.update_match_predictions(uuid, integer, integer);

create or replace function public.update_match_predictions(
  p_match_id uuid,
  p_home_score integer,
  p_away_score integer
) returns void as $fn$
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
  if p_home_score > p_away_score then
    v_outcome := 'home';
  elsif p_away_score > p_home_score then
    v_outcome := 'away';
  else
    v_outcome := 'draw';
  end if;

  select points into v_outcome_points from public.scoring_settings where prediction_type = 'outcome';
  select points into v_scorer_points from public.scoring_settings where prediction_type = 'scorer';
  select points into v_exact_points from public.scoring_settings where prediction_type = 'exact_score';

  for v_pred in
    select * from public.predictions where match_id = p_match_id
  loop
    v_calc_outcome := 0;
    v_calc_scorer := 0;
    v_calc_exact := 0;

    if v_pred.predicted_outcome is not null and v_pred.predicted_outcome = v_outcome then
      v_calc_outcome := coalesce(v_outcome_points, 1);
    end if;

    if v_pred.predicted_scorer_id is not null and exists (
        select 1
        from public.match_goal_scorers mgs
        where mgs.match_id = p_match_id
          and mgs.player_id = v_pred.predicted_scorer_id
      ) then
      v_calc_scorer := coalesce(v_scorer_points, 2);
    end if;

    if v_pred.predicted_home_score is not null
        and v_pred.predicted_away_score is not null
        and v_pred.predicted_home_score = p_home_score
        and v_pred.predicted_away_score = p_away_score then
      v_calc_exact := coalesce(v_exact_points, 3);
    end if;

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
$fn$ language plpgsql security definer;

create or replace view public.leaderboard as
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
