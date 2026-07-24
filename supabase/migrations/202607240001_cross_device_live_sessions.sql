-- Cross-device live sessions.
-- Keeps quiz_sessions as the canonical live-session table and exposes only a
-- PIN-scoped snapshot to student devices.

alter table public.quiz_sessions add column if not exists updated_at timestamptz not null default now();

create or replace function public.normalize_live_pin() returns trigger
language plpgsql set search_path=public as $$
begin
  new.pin := upper(trim(new.pin));
  return new;
end $$;

drop trigger if exists quiz_sessions_normalize_pin on public.quiz_sessions;
create trigger quiz_sessions_normalize_pin
before insert or update of pin on public.quiz_sessions
for each row execute function public.normalize_live_pin();

drop trigger if exists quiz_sessions_set_updated_at on public.quiz_sessions;
create trigger quiz_sessions_set_updated_at
before update on public.quiz_sessions
for each row execute function public.set_updated_at();

update public.quiz_sessions set pin=upper(trim(pin)) where pin<>upper(trim(pin));
create unique index if not exists quiz_sessions_normalized_pin_uidx on public.quiz_sessions(upper(pin));

drop policy if exists sessions_teacher_all on public.quiz_sessions;
create policy sessions_teacher_all on public.quiz_sessions for all
using (teacher_id=auth.uid())
with check (teacher_id=auth.uid());

drop policy if exists sessions_active_read on public.quiz_sessions;
create policy sessions_active_read on public.quiz_sessions for select to anon, authenticated
using (status in ('waiting','live','paused'));

drop policy if exists participants_teacher_read on public.session_participants;
create policy participants_teacher_read on public.session_participants for select
using (exists(
  select 1 from public.quiz_sessions session
  where session.id=session_id and session.teacher_id=auth.uid()
));

drop policy if exists participants_active_read on public.session_participants;
create policy participants_active_read on public.session_participants for select to anon, authenticated
using (exists(
  select 1 from public.quiz_sessions session
  where session.id=session_id and session.status in ('waiting','live','paused')
));

drop policy if exists participants_join on public.session_participants;
create policy participants_join on public.session_participants for insert to anon, authenticated
with check (exists(
  select 1 from public.quiz_sessions session
  where session.id=session_id and session.status in ('waiting','live','paused')
));

-- Live question payloads are served by the PIN-scoped snapshot below. Removing
-- the broad live policy prevents answer_data from being queried directly.
drop policy if exists questions_live_read on public.questions;

create or replace function public.get_live_session_status(game_pin text)
returns text
language sql stable security definer set search_path=public as $$
  select status::text
  from public.quiz_sessions
  where upper(pin)=upper(trim(game_pin))
  order by created_at desc
  limit 1
$$;

create or replace function public.join_live_session(game_pin text, player_nickname text)
returns table(participant_id uuid, client_token uuid, session_id uuid)
language plpgsql security definer set search_path=public as $$
declare
  target public.quiz_sessions;
  new_participant public.session_participants;
begin
  if char_length(trim(player_nickname)) not between 1 and 40 then
    raise exception 'INVALID_NICKNAME';
  end if;

  select * into target
  from public.quiz_sessions
  where upper(pin)=upper(trim(game_pin))
  order by created_at desc
  limit 1;

  if target.id is null then raise exception 'GAME_NOT_FOUND'; end if;
  if target.status='ended' then raise exception 'GAME_ENDED'; end if;
  if target.status not in ('waiting','live','paused') then raise exception 'GAME_NOT_JOINABLE'; end if;

  insert into public.session_participants(session_id,student_id,nickname)
  values(target.id,auth.uid(),trim(player_nickname))
  returning * into new_participant;

  return query select new_participant.id,new_participant.client_token,target.id;
end $$;

create or replace function public.get_live_game_snapshot(
  game_pin text,
  p_participant_id uuid default null,
  p_client_token uuid default null
) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare
  target public.quiz_sessions;
  selected_quiz public.quizzes;
  player public.session_participants;
  player_valid boolean := false;
  question_ids jsonb := '[]'::jsonb;
  participants jsonb := '[]'::jsonb;
  current_question jsonb;
  player_answers jsonb := '{}'::jsonb;
  active_powerup jsonb;
begin
  select * into target
  from public.quiz_sessions
  where upper(pin)=upper(trim(game_pin))
  order by created_at desc
  limit 1;

  if target.id is null then
    return jsonb_build_object('state','not_found');
  end if;

  if p_participant_id is not null and p_client_token is not null then
    select * into player
    from public.session_participants
    where id=p_participant_id
      and session_id=target.id
      and client_token=p_client_token;
    player_valid := player.id is not null;
  end if;

  if target.status='ended' and not player_valid then
    return jsonb_build_object('state','ended');
  end if;

  select * into selected_quiz from public.quizzes where id=target.quiz_id;

  select coalesce(jsonb_agg(item.question_id order by item.sort_order),'[]'::jsonb)
  into question_ids
  from public.quiz_questions item
  where item.quiz_id=target.quiz_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',participant.id,
    'nickname',participant.nickname,
    'score',participant.score,
    'currentStreak',participant.current_streak,
    'bestStreak',participant.best_streak,
    'powerups',participant.powerups,
    'badges',participant.badges
  ) order by participant.score desc,participant.joined_at),'[]'::jsonb)
  into participants
  from public.session_participants participant
  where participant.session_id=target.id;

  select jsonb_build_object(
    'id',question.id,
    'courseId',question.course_id,
    'syllabusPointId',question.syllabus_point_id,
    'type',question.type::text,
    'prompt',question.prompt,
    'answerData',case
      when target.revealed_question_index=target.current_question_index then question.answer_data
      when question.type::text='matching' then jsonb_build_object(
        'leftItems',(select coalesce(jsonb_agg(pair.value->>'left' order by pair.ordinality),'[]'::jsonb) from jsonb_array_elements(question.answer_data->'pairs') with ordinality pair(value,ordinality)),
        'choices',(select coalesce(jsonb_agg(pair.value->>'right' order by pair.ordinality desc),'[]'::jsonb) from jsonb_array_elements(question.answer_data->'pairs') with ordinality pair(value,ordinality))
      )
      when question.type::text='drag_drop' then jsonb_build_object(
        'zones',coalesce(question.answer_data->'zones','[]'::jsonb),
        'items',(select coalesce(jsonb_agg(jsonb_build_object('text',item.value->>'text') order by item.ordinality),'[]'::jsonb) from jsonb_array_elements(question.answer_data->'items') with ordinality item(value,ordinality))
      )
      when question.type::text='ordering' then jsonb_build_object('items',coalesce(question.answer_data->'items','[]'::jsonb))
      else '{}'::jsonb
    end,
    'explanation',case when target.revealed_question_index=target.current_question_index then question.explanation else '' end,
    'difficulty',question.difficulty::text,
    'questionStyle',question.question_style,
    'calculator',question.calculator,
    'estimatedTimeSeconds',question.estimated_time_seconds,
    'marksEstimate',question.marks_estimate,
    'tags',to_jsonb(question.tags),
    'options',coalesce(options.items,'[]'::jsonb)
  )
  into current_question
  from public.quiz_questions item
  join public.questions question on question.id=item.question_id
  left join lateral (
    select jsonb_agg(jsonb_build_object(
      'id',option.id,
      'label',option.label,
      'text',option.text,
      'isCorrect',case
        when target.revealed_question_index=target.current_question_index then option.is_correct
        when player_valid and exists(
          select 1 from public.powerup_events event
          where event.session_id=target.id
            and event.participant_id=player.id
            and event.question_id=question.id
            and event.powerup_type='fifty_fifty'
        ) then option.is_correct
        else false
      end,
      'sortOrder',option.sort_order
    ) order by option.sort_order) as items
    from public.question_options option
    where option.question_id=question.id
  ) options on true
  where item.quiz_id=target.quiz_id
    and item.sort_order=target.current_question_index;

  if player_valid then
    select coalesce(jsonb_object_agg(response.question_id::text,jsonb_build_object(
      'answer',response.submitted_answer,
      'correct',response.is_correct,
      'responseTimeMs',response.response_time_ms,
      'awardedPoints',response.awarded_points,
      'streakAfter',coalesce((response.score_detail->>'streakAfter')::integer,player.current_streak),
      'powerupUsed',response.powerup_type,
      'scoreDetail',response.score_detail
    )),'{}'::jsonb)
    into player_answers
    from public.live_responses response
    where response.session_id=target.id and response.participant_id=player.id;

    select jsonb_build_object('type',event.powerup_type,'questionId',event.question_id)
    into active_powerup
    from public.powerup_events event
    where event.session_id=target.id
      and event.participant_id=player.id
      and event.question_id=(
        select item.question_id from public.quiz_questions item
        where item.quiz_id=target.quiz_id and item.sort_order=target.current_question_index
      )
      and not exists(
        select 1 from public.live_responses response
        where response.session_id=target.id
          and response.participant_id=player.id
          and response.question_id=event.question_id
      )
    order by event.created_at desc
    limit 1;
  end if;

  return jsonb_build_object(
    'state',target.status::text,
    'session',jsonb_build_object(
      'id',target.id,
      'quizId',target.quiz_id,
      'teacherId',target.teacher_id,
      'classId',target.class_id,
      'pin',target.pin,
      'status',target.status::text,
      'currentQuestionIndex',target.current_question_index,
      'revealedQuestionIndex',target.revealed_question_index,
      'questionStartedAt',target.question_started_at,
      'startedAt',target.started_at,
      'endedAt',target.ended_at,
      'participants',participants
    ),
    'quiz',jsonb_build_object(
      'id',selected_quiz.id,
      'teacherId',selected_quiz.teacher_id,
      'title',selected_quiz.title,
      'courseId',selected_quiz.course_id,
      'mode',selected_quiz.mode::text,
      'settings',selected_quiz.settings,
      'createdAt',selected_quiz.created_at,
      'questionIds',question_ids
    ),
    'question',current_question,
    'player',case when player_valid then jsonb_build_object(
      'id',player.id,
      'nickname',player.nickname,
      'score',player.score,
      'currentStreak',player.current_streak,
      'bestStreak',player.best_streak,
      'powerups',player.powerups,
      'badges',player.badges,
      'activePowerup',active_powerup,
      'answers',player_answers
    ) else null end
  );
end $$;

create or replace function public.submit_live_response(
  p_session_id uuid,
  p_participant_id uuid,
  p_client_token uuid,
  p_question_id uuid,
  p_answer jsonb,
  p_response_time_ms integer
) returns table(correct boolean, awarded integer, total_score integer)
language plpgsql security definer set search_path=public as $$
declare
  q public.questions;
  quiz_settings jsonb;
  participant public.session_participants;
  is_right boolean := false;
  earned integer := 0;
  base_points integer := 0;
  speed_bonus integer := 0;
  streak_bonus integer := 0;
  multiplier integer := 1;
  effective_ms integer;
  limit_ms integer;
  powerup text;
  next_streak integer;
  detail jsonb;
begin
  select * into participant
  from public.session_participants selected
  where selected.id=p_participant_id
    and selected.session_id=p_session_id
    and selected.client_token=p_client_token
  for update;
  if participant.id is null then raise exception 'Invalid participant token'; end if;

  select question.* into q
  from public.quiz_sessions session
  join public.quiz_questions item on item.quiz_id=session.quiz_id
  join public.questions question on question.id=item.question_id
  where session.id=p_session_id
    and session.status='live'
    and item.question_id=p_question_id
    and item.sort_order=session.current_question_index;
  if q.id is null then raise exception 'Question is not active'; end if;

  select quiz.settings into quiz_settings
  from public.quiz_sessions session
  join public.quizzes quiz on quiz.id=session.quiz_id
  where session.id=p_session_id;

  if q.type::text='numeric_answer' then
    is_right := abs((p_answer#>>'{}')::numeric-(q.answer_data->>'answer')::numeric)<=coalesce((q.answer_data->>'tolerance')::numeric,0);
  elsif q.type::text in ('short_answer','fill_blank') then
    is_right := lower(trim(p_answer#>>'{}'))=lower(trim(q.answer_data->>'answer'))
      or exists(
        select 1 from jsonb_array_elements_text(coalesce(q.answer_data->'acceptedAnswers','[]'::jsonb)) accepted
        where lower(trim(accepted))=lower(trim(p_answer#>>'{}'))
      );
  elsif q.type::text='multi_select' then
    is_right := (select array_agg(lower(trim(value)) order by lower(trim(value))) from jsonb_array_elements_text(p_answer))
      =(select array_agg(lower(trim(value)) order by lower(trim(value))) from jsonb_array_elements_text(coalesce(q.answer_data->'answers','[]'::jsonb)));
  elsif q.type::text='true_false' then
    is_right := lower(trim(p_answer#>>'{}'))=lower(trim(q.answer_data->>'answer'));
  elsif q.type::text='ordering' then
    is_right := p_answer=coalesce(q.answer_data->'correctOrder',q.answer_data->'items');
  elsif q.type::text='matching' then
    is_right := p_answer=(select jsonb_object_agg(pair->>'left',pair->>'right') from jsonb_array_elements(q.answer_data->'pairs') pair);
  elsif q.type::text='drag_drop' then
    is_right := p_answer=(select jsonb_object_agg(item->>'text',item->>'correctZone') from jsonb_array_elements(q.answer_data->'items') item);
  else
    is_right := lower(trim(p_answer#>>'{}'))=lower(trim(q.answer_data->>'answer'));
  end if;

  select event.powerup_type into powerup
  from public.powerup_events event
  where event.session_id=p_session_id and event.participant_id=p_participant_id and event.question_id=p_question_id
  order by event.created_at desc limit 1;

  limit_ms := greatest(1000,coalesce((quiz_settings->>'timeLimitSeconds')::integer,30)*1000);
  effective_ms := greatest(0,p_response_time_ms-case when powerup='time_freeze' then 8000 else 0 end);
  if is_right then
    if coalesce(quiz_settings->>'pointsMode','speed_bonus')='accuracy_only' then
      base_points:=1000;
    elsif coalesce(quiz_settings->>'pointsMode','speed_bonus')='standard' then
      base_points:=800;
      speed_bonus:=round(200*greatest(0,1-effective_ms::numeric/limit_ms));
    else
      base_points:=600;
      speed_bonus:=round(400*greatest(0,1-effective_ms::numeric/limit_ms));
    end if;
    if coalesce((quiz_settings->>'enableStreakBonuses')::boolean,true) then
      streak_bonus:=least(participant.current_streak,5)*50;
    end if;
    if powerup='double_points' then multiplier:=2; end if;
    earned:=(base_points+speed_bonus+streak_bonus)*multiplier;
    next_streak:=participant.current_streak+1;
  else
    next_streak:=case when powerup='shield' then participant.current_streak else 0 end;
  end if;

  detail:=jsonb_build_object(
    'basePoints',base_points,
    'speedBonus',speed_bonus,
    'streakBonus',streak_bonus,
    'multiplier',multiplier,
    'total',earned,
    'effectiveResponseTimeMs',effective_ms,
    'shieldUsed',not is_right and powerup='shield',
    'streakAfter',next_streak
  );
  insert into public.live_responses(session_id,participant_id,question_id,submitted_answer,is_correct,response_time_ms,awarded_points,score_detail,powerup_type)
  values(p_session_id,p_participant_id,p_question_id,p_answer,is_right,p_response_time_ms,earned,detail,powerup);
  update public.session_participants
  set score=score+earned,current_streak=next_streak,best_streak=greatest(best_streak,next_streak)
  where id=p_participant_id returning score into total_score;
  update public.student_session_state
  set current_score=total_score,current_streak=next_streak,best_streak=greatest(best_streak,next_streak),updated_at=now()
  where session_id=p_session_id and participant_id=p_participant_id;
  if next_streak>=3 then
    insert into public.badge_events(session_id,participant_id,student_id,badge_type,metadata)
    values(p_session_id,p_participant_id,participant.student_id,'hot_streak',jsonb_build_object('questionId',p_question_id))
    on conflict do nothing;
  end if;
  correct:=is_right;
  awarded:=earned;
  return next;
end $$;

revoke execute on function public.get_live_session_status(text) from public;
revoke execute on function public.get_live_game_snapshot(text,uuid,uuid) from public;
revoke execute on function public.join_live_session(text,text) from public;
revoke execute on function public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer) from public;
grant execute on function public.get_live_session_status(text) to anon,authenticated;
grant execute on function public.get_live_game_snapshot(text,uuid,uuid) to anon,authenticated;
grant execute on function public.join_live_session(text,text) to anon,authenticated;
grant execute on function public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer) to anon,authenticated;

grant select on public.quiz_sessions to anon,authenticated;
revoke select on public.session_participants from anon,authenticated;
grant select(id,session_id,student_id,nickname,score,joined_at,current_streak,best_streak,powerups,badges)
on public.session_participants to authenticated;
grant select(id,session_id,nickname,score,joined_at,current_streak,best_streak,powerups,badges)
on public.session_participants to anon;

do $$ begin
  alter publication supabase_realtime add table public.quiz_sessions;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.session_participants;
exception when duplicate_object then null; end $$;
