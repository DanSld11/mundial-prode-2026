-- =============================================
-- PASO 3: FUNCIONES Y LEADERBOARD
-- Ejecutar después del paso 2
-- =============================================

drop function if exists public.recalculate_profile_points(uuid);

create or replace function public.recalculate_profile_points(p_user_id uuid)
returns void
language sql
security definer
as '
  update public.profiles
  set
    total_points = coalesce((
      select sum(points_earned)
      from public.predictions
      where user_id = p_user_id
    ), 0),
    updated_at = now()
  where id = p_user_id;
';

drop function if exists public.update_match_predictions(uuid, integer, integer);

create or replace function public.update_match_predictions(
  p_match_id uuid,
  p_home_score integer,
  p_away_score integer
)
returns void
language sql
security definer
as '
  with point_values as (
    select
      coalesce(max(points) filter (where prediction_type = ''outcome''), 1) as outcome_points,
      coalesce(max(points) filter (where prediction_type = ''scorer''), 2) as scorer_points,
      coalesce(max(points) filter (where prediction_type = ''exact_score''), 3) as exact_points
    from public.scoring_settings
  ),
  actual as (
    select case
      when p_home_score > p_away_score then ''home''
      when p_away_score > p_home_score then ''away''
      else ''draw''
    end as outcome
  ),
  calculated as (
    select
      pr.id,
      case
        when pr.predicted_outcome is not null and pr.predicted_outcome = actual.outcome
        then point_values.outcome_points
        else 0
      end as calc_outcome_points,
      case
        when pr.predicted_scorer_id is not null and exists (
          select 1
          from public.match_goal_scorers mgs
          where mgs.match_id = p_match_id
            and mgs.player_id = pr.predicted_scorer_id
        )
        then point_values.scorer_points
        else 0
      end as calc_scorer_points,
      case
        when pr.predicted_home_score is not null
          and pr.predicted_away_score is not null
          and pr.predicted_home_score = p_home_score
          and pr.predicted_away_score = p_away_score
        then point_values.exact_points
        else 0
      end as calc_exact_score_points
    from public.predictions pr
    cross join point_values
    cross join actual
    where pr.match_id = p_match_id
  )
  update public.predictions pr
  set
    outcome_points = calculated.calc_outcome_points,
    scorer_points = calculated.calc_scorer_points,
    exact_score_points = calculated.calc_exact_score_points,
    points_earned = calculated.calc_outcome_points + calculated.calc_scorer_points + calculated.calc_exact_score_points,
    is_exact_score = calculated.calc_exact_score_points > 0,
    updated_at = now()
  from calculated
  where pr.id = calculated.id;

  update public.profiles p
  set
    total_points = coalesce((
      select sum(pr.points_earned)
      from public.predictions pr
      where pr.user_id = p.id
    ), 0),
    updated_at = now();
';

drop view if exists public.leaderboard;

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
