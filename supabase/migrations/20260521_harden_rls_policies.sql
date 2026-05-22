-- Harden RLS policies for production access.
-- This migration is idempotent and can be run after the older setup scripts.

create or replace function public.prevent_profile_privilege_escalation()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    if new.role is distinct from old.role then
      raise exception 'Users cannot change their own role';
    end if;

    if new.total_points is distinct from old.total_points then
      raise exception 'Users cannot change their own points';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists prevent_profile_privilege_escalation on public.profiles;
create trigger prevent_profile_privilege_escalation
  before update on public.profiles
  for each row execute function public.prevent_profile_privilege_escalation();

alter table public.profiles enable row level security;

drop policy if exists "Perfil visible para todos" on public.profiles;
drop policy if exists "Usuario edita su propio perfil" on public.profiles;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users update their own non-privileged profile fields"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

do $$
begin
  if to_regclass('public.teams') is not null then
    alter table public.teams enable row level security;
    drop policy if exists "Teams are publicly readable" on public.teams;
    create policy "Teams are publicly readable" on public.teams for select using (true);
  end if;

  if to_regclass('public.matches') is not null then
    alter table public.matches enable row level security;
    drop policy if exists "Matches are publicly readable" on public.matches;
    create policy "Matches are publicly readable" on public.matches for select using (true);
  end if;

  if to_regclass('public.players') is not null then
    alter table public.players enable row level security;
    drop policy if exists "Players are publicly readable" on public.players;
    create policy "Players are publicly readable" on public.players for select using (true);
  end if;

  if to_regclass('public.match_goal_scorers') is not null then
    alter table public.match_goal_scorers enable row level security;
    drop policy if exists "Match goal scorers are publicly readable" on public.match_goal_scorers;
    create policy "Match goal scorers are publicly readable" on public.match_goal_scorers for select using (true);
  end if;

  if to_regclass('public.scoring_settings') is not null then
    alter table public.scoring_settings enable row level security;
    drop policy if exists "Scoring settings are publicly readable" on public.scoring_settings;
    create policy "Scoring settings are publicly readable" on public.scoring_settings for select using (true);
  end if;
end $$;

alter table public.predictions enable row level security;

drop policy if exists "Usuario ve sus propias predicciones" on public.predictions;
drop policy if exists "Usuario crea sus predicciones" on public.predictions;
drop policy if exists "Usuario edita sus predicciones (si no esta bloqueado)" on public.predictions;
drop policy if exists "Usuario edita sus predicciones (si no está bloqueado)" on public.predictions;
drop policy if exists "Users can read their own match predictions" on public.predictions;
drop policy if exists "Users can create unlocked own match predictions" on public.predictions;
drop policy if exists "Users can update unlocked own match predictions" on public.predictions;
drop policy if exists "Users can delete unlocked own match predictions" on public.predictions;

create policy "Users can read their own match predictions"
  on public.predictions for select
  using (auth.uid() = user_id);

create policy "Users can create unlocked own match predictions"
  on public.predictions for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.matches
      where matches.id = match_id
        and matches.predictions_locked
    )
  );

create policy "Users can update unlocked own match predictions"
  on public.predictions for update
  using (
    auth.uid() = user_id
    and not exists (
      select 1 from public.matches
      where matches.id = match_id
        and matches.predictions_locked
    )
  )
  with check (auth.uid() = user_id);

create policy "Users can delete unlocked own match predictions"
  on public.predictions for delete
  using (
    auth.uid() = user_id
    and not exists (
      select 1 from public.matches
      where matches.id = match_id
        and matches.predictions_locked
    )
  );

alter table public.bracket_predictions enable row level security;

drop policy if exists "Bracket visible para todos" on public.bracket_predictions;
drop policy if exists "Usuario crea su bracket" on public.bracket_predictions;
drop policy if exists "Usuario edita su bracket" on public.bracket_predictions;
drop policy if exists "Bracket predictions are publicly readable" on public.bracket_predictions;
drop policy if exists "Users create their own bracket predictions" on public.bracket_predictions;
drop policy if exists "Users update their own bracket predictions" on public.bracket_predictions;

create policy "Bracket predictions are publicly readable"
  on public.bracket_predictions for select
  using (true);

create policy "Users create their own bracket predictions"
  on public.bracket_predictions for insert
  with check (auth.uid() = user_id);

create policy "Users update their own bracket predictions"
  on public.bracket_predictions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

do $$
begin
  if to_regclass('public.group_predictions') is not null then
    alter table public.group_predictions enable row level security;
    drop policy if exists "Users manage their own group predictions" on public.group_predictions;
    create policy "Users manage their own group predictions"
      on public.group_predictions for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if to_regclass('public.special_predictions') is not null then
    alter table public.special_predictions enable row level security;
    drop policy if exists "Users manage their own special predictions" on public.special_predictions;
    create policy "Users manage their own special predictions"
      on public.special_predictions for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if to_regclass('public.group_results') is not null then
    alter table public.group_results enable row level security;
    drop policy if exists "Group results are publicly readable" on public.group_results;
    create policy "Group results are publicly readable" on public.group_results for select using (true);
  end if;

  if to_regclass('public.special_results') is not null then
    alter table public.special_results enable row level security;
    drop policy if exists "Special results are publicly readable" on public.special_results;
    create policy "Special results are publicly readable" on public.special_results for select using (true);
  end if;

  if to_regclass('public.wallets') is not null then
    alter table public.wallets enable row level security;
    drop policy if exists "Users read their own wallet" on public.wallets;
    create policy "Users read their own wallet" on public.wallets for select using (auth.uid() = user_id);
  end if;

  if to_regclass('public.wallet_transactions') is not null then
    alter table public.wallet_transactions enable row level security;
    drop policy if exists "Users read their own wallet transactions" on public.wallet_transactions;
    create policy "Users read their own wallet transactions" on public.wallet_transactions for select using (auth.uid() = user_id);
  end if;

  if to_regclass('public.pools') is not null then
    alter table public.pools enable row level security;
    drop policy if exists "Pools are readable to authenticated users" on public.pools;
    create policy "Pools are readable to authenticated users" on public.pools for select using (auth.role() = 'authenticated');
  end if;

  if to_regclass('public.pool_members') is not null then
    alter table public.pool_members enable row level security;
    drop policy if exists "Pool members are readable to authenticated users" on public.pool_members;
    create policy "Pool members are readable to authenticated users" on public.pool_members for select using (auth.role() = 'authenticated');
  end if;
end $$;
