-- MathPulse live gameplay extensions. Additive and safe for existing question/attempt data.

alter type public.question_type add value if not exists 'true_false';
alter type public.question_type add value if not exists 'fill_blank';

alter table public.quiz_sessions add column if not exists revealed_question_index integer not null default -1;
alter table public.quiz_sessions add column if not exists question_started_at timestamptz;
alter table public.session_participants add column if not exists current_streak integer not null default 0 check (current_streak >= 0);
alter table public.session_participants add column if not exists best_streak integer not null default 0 check (best_streak >= 0);
alter table public.session_participants add column if not exists powerups jsonb not null default '{"double_points":1,"fifty_fifty":1,"time_freeze":1,"shield":1}'::jsonb;
alter table public.session_participants add column if not exists badges jsonb not null default '[]'::jsonb;
alter table public.live_responses add column if not exists score_detail jsonb not null default '{}'::jsonb;
alter table public.live_responses add column if not exists powerup_type text;
alter table public.answers add column if not exists score_detail jsonb not null default '{}'::jsonb;

create table if not exists public.student_session_state (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  participant_id uuid not null references public.session_participants(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  current_score integer not null default 0 check (current_score >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  powerups jsonb not null default '{"double_points":1,"fifty_fifty":1,"time_freeze":1,"shield":1}'::jsonb,
  badges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  unique(session_id, participant_id)
);

create table if not exists public.powerup_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  participant_id uuid not null references public.session_participants(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  question_id uuid not null references public.questions(id) on delete cascade,
  powerup_type text not null check (powerup_type in ('double_points','fifty_fifty','time_freeze','shield')),
  effect jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(session_id, participant_id, question_id)
);

create table if not exists public.badge_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  participant_id uuid not null references public.session_participants(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  badge_type text not null check (badge_type in ('fastest_correct','hot_streak','comeback','topic_master','perfect_round')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(session_id, participant_id, badge_type)
);

create index if not exists student_session_state_session_idx on public.student_session_state(session_id);
create index if not exists powerup_events_session_idx on public.powerup_events(session_id, question_id);
create index if not exists badge_events_session_idx on public.badge_events(session_id);

alter table public.student_session_state enable row level security;
alter table public.powerup_events enable row level security;
alter table public.badge_events enable row level security;

create policy student_session_state_teacher_read on public.student_session_state for select using (
  exists(select 1 from public.quiz_sessions session where session.id=session_id and session.teacher_id=auth.uid())
);
create policy student_session_state_self_read on public.student_session_state for select using (student_id=auth.uid());
create policy powerup_events_teacher_read on public.powerup_events for select using (
  exists(select 1 from public.quiz_sessions session where session.id=session_id and session.teacher_id=auth.uid())
);
create policy powerup_events_self_read on public.powerup_events for select using (student_id=auth.uid());
create policy badge_events_teacher_read on public.badge_events for select using (
  exists(select 1 from public.quiz_sessions session where session.id=session_id and session.teacher_id=auth.uid())
);
create policy badge_events_self_read on public.badge_events for select using (student_id=auth.uid());

grant select on public.student_session_state,public.powerup_events,public.badge_events to authenticated;

create or replace function public.initialize_live_participant_state() returns trigger
language plpgsql security definer set search_path=public as $$
declare enabled boolean;
begin
  select coalesce((quiz.settings->>'enablePowerups')::boolean,true) into enabled
  from public.quiz_sessions session join public.quizzes quiz on quiz.id=session.quiz_id where session.id=new.session_id;
  if not enabled then
    new.powerups := '{"double_points":0,"fifty_fifty":0,"time_freeze":0,"shield":0}'::jsonb;
    update public.session_participants set powerups=new.powerups where id=new.id;
  end if;
  insert into public.student_session_state(session_id,participant_id,student_id,powerups)
  values(new.session_id,new.id,new.student_id,new.powerups) on conflict(session_id,participant_id) do nothing;
  return new;
end $$;

drop trigger if exists initialize_live_participant_state on public.session_participants;
create trigger initialize_live_participant_state after insert on public.session_participants
for each row execute function public.initialize_live_participant_state();

create or replace function public.use_live_powerup(
  p_session_id uuid,p_participant_id uuid,p_client_token uuid,p_question_id uuid,p_powerup_type text
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare inventory jsonb; remaining integer; effect jsonb;
begin
  if p_powerup_type not in ('double_points','fifty_fifty','time_freeze','shield') then raise exception 'Unknown powerup'; end if;
  if not exists(select 1 from public.session_participants participant where participant.id=p_participant_id and participant.session_id=p_session_id and participant.client_token=p_client_token) then raise exception 'Invalid participant token'; end if;
  if not exists(select 1 from public.quiz_sessions session join public.quiz_questions item on item.quiz_id=session.quiz_id join public.quizzes quiz on quiz.id=session.quiz_id where session.id=p_session_id and session.status='live' and item.question_id=p_question_id and item.sort_order=session.current_question_index and coalesce((quiz.settings->>'enablePowerups')::boolean,true)) then raise exception 'Powerups are not available'; end if;
  select powerups into inventory from public.student_session_state where session_id=p_session_id and participant_id=p_participant_id for update;
  remaining := coalesce((inventory->>p_powerup_type)::integer,0);
  if remaining < 1 then raise exception 'Powerup already used'; end if;
  effect := case p_powerup_type when 'double_points' then '{"multiplier":2}'::jsonb when 'fifty_fifty' then '{"hideIncorrectChoices":2}'::jsonb when 'time_freeze' then '{"scoreTimeCreditMs":8000}'::jsonb else '{"preserveStreakOnIncorrect":true}'::jsonb end;
  update public.student_session_state set powerups=jsonb_set(powerups,array[p_powerup_type],to_jsonb(remaining-1)),updated_at=now() where session_id=p_session_id and participant_id=p_participant_id;
  update public.session_participants set powerups=jsonb_set(powerups,array[p_powerup_type],to_jsonb(remaining-1)) where id=p_participant_id;
  insert into public.powerup_events(session_id,participant_id,student_id,question_id,powerup_type,effect)
  select p_session_id,p_participant_id,student_id,p_question_id,p_powerup_type,effect from public.session_participants where id=p_participant_id;
  return effect;
end $$;

create or replace function public.submit_live_response(p_session_id uuid,p_participant_id uuid,p_client_token uuid,p_question_id uuid,p_answer jsonb,p_response_time_ms integer)
returns table(correct boolean, awarded integer, total_score integer)
language plpgsql security definer set search_path=public as $$
declare
  q public.questions; quiz_settings jsonb; participant public.session_participants; is_right boolean := false;
  earned integer := 0; base_points integer := 0; speed_bonus integer := 0; streak_bonus integer := 0;
  multiplier integer := 1; effective_ms integer; limit_ms integer; powerup text; next_streak integer; detail jsonb;
begin
  select * into participant from public.session_participants p where p.id=p_participant_id and p.session_id=p_session_id and p.client_token=p_client_token for update;
  if participant.id is null then raise exception 'Invalid participant token'; end if;
  select question.* into q from public.quiz_sessions session join public.quiz_questions item on item.quiz_id=session.quiz_id join public.questions question on question.id=item.question_id where session.id=p_session_id and session.status='live' and item.question_id=p_question_id and item.sort_order=session.current_question_index;
  if q.id is null then raise exception 'Question is not active'; end if;
  select quiz.settings into quiz_settings from public.quiz_sessions session join public.quizzes quiz on quiz.id=session.quiz_id where session.id=p_session_id;

  if q.type::text='numeric_answer' then is_right := abs((p_answer#>>'{}')::numeric-(q.answer_data->>'answer')::numeric)<=coalesce((q.answer_data->>'tolerance')::numeric,0);
  elsif q.type::text in ('short_answer','fill_blank') then is_right := lower(trim(p_answer#>>'{}'))=lower(trim(q.answer_data->>'answer')) or exists(select 1 from jsonb_array_elements_text(coalesce(q.answer_data->'acceptedAnswers','[]'::jsonb)) accepted where lower(trim(accepted))=lower(trim(p_answer#>>'{}')));
  elsif q.type::text='multi_select' then is_right := (select array_agg(lower(trim(value)) order by lower(trim(value))) from jsonb_array_elements_text(p_answer))=(select array_agg(lower(trim(value)) order by lower(trim(value))) from jsonb_array_elements_text(coalesce(q.answer_data->'answers','[]'::jsonb)));
  elsif q.type::text='true_false' then is_right := p_answer=q.answer_data->'answer';
  elsif q.type::text='ordering' then is_right := p_answer=coalesce(q.answer_data->'correctOrder',q.answer_data->'items');
  elsif q.type::text='matching' then is_right := p_answer=(select jsonb_object_agg(pair->>'left',pair->>'right') from jsonb_array_elements(q.answer_data->'pairs') pair);
  elsif q.type::text='drag_drop' then is_right := p_answer=(select jsonb_object_agg(item->>'text',item->>'correctZone') from jsonb_array_elements(q.answer_data->'items') item);
  else is_right := lower(trim(p_answer#>>'{}'))=lower(trim(q.answer_data->>'answer')); end if;

  select powerup_type into powerup from public.powerup_events where session_id=p_session_id and participant_id=p_participant_id and question_id=p_question_id order by created_at desc limit 1;
  limit_ms := greatest(1000,coalesce((quiz_settings->>'timeLimitSeconds')::integer,30)*1000);
  effective_ms := greatest(0,p_response_time_ms-case when powerup='time_freeze' then 8000 else 0 end);
  if is_right then
    if coalesce(quiz_settings->>'pointsMode','speed_bonus')='accuracy_only' then base_points:=1000;
    elsif coalesce(quiz_settings->>'pointsMode','speed_bonus')='standard' then base_points:=800; speed_bonus:=round(200*greatest(0,1-effective_ms::numeric/limit_ms));
    else base_points:=600; speed_bonus:=round(400*greatest(0,1-effective_ms::numeric/limit_ms)); end if;
    if coalesce((quiz_settings->>'enableStreakBonuses')::boolean,true) then streak_bonus:=least(participant.current_streak,5)*50; end if;
    if powerup='double_points' then multiplier:=2; end if;
    earned:=(base_points+speed_bonus+streak_bonus)*multiplier; next_streak:=participant.current_streak+1;
  else next_streak:=case when powerup='shield' then participant.current_streak else 0 end; end if;
  detail:=jsonb_build_object('basePoints',base_points,'speedBonus',speed_bonus,'streakBonus',streak_bonus,'multiplier',multiplier,'total',earned,'effectiveResponseTimeMs',effective_ms,'shieldUsed',not is_right and powerup='shield');
  insert into public.live_responses(session_id,participant_id,question_id,submitted_answer,is_correct,response_time_ms,awarded_points,score_detail,powerup_type) values(p_session_id,p_participant_id,p_question_id,p_answer,is_right,p_response_time_ms,earned,detail,powerup);
  update public.session_participants set score=score+earned,current_streak=next_streak,best_streak=greatest(best_streak,next_streak) where id=p_participant_id returning score into total_score;
  update public.student_session_state set current_score=total_score,current_streak=next_streak,best_streak=greatest(best_streak,next_streak),updated_at=now() where session_id=p_session_id and participant_id=p_participant_id;
  if next_streak>=3 then insert into public.badge_events(session_id,participant_id,student_id,badge_type,metadata) values(p_session_id,p_participant_id,participant.student_id,'hot_streak',jsonb_build_object('questionId',p_question_id)) on conflict do nothing; end if;
  correct:=is_right;awarded:=earned;return next;
end $$;

revoke execute on function public.use_live_powerup(uuid,uuid,uuid,uuid,text) from public;
grant execute on function public.use_live_powerup(uuid,uuid,uuid,uuid,text) to anon,authenticated;

do $$ begin alter publication supabase_realtime add table public.student_session_state; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.powerup_events; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.badge_events; exception when duplicate_object then null; end $$;
