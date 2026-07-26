-- Resolve the live question by its position in the ordered quiz sequence.
-- quiz_sessions.current_question_index is a zero-based array index; it is not
-- the persisted sort_order value. This also keeps all correct-answer data
-- private until the teacher reveals the current question.

create or replace function public.get_live_game_snapshot(
  game_pin text,
  p_participant_id uuid default null,
  p_client_token uuid default null
) returns jsonb
language plpgsql stable security definer set search_path=public as $$
declare
  target public.quiz_sessions;
  selected_quiz public.quizzes;
  current_item public.quiz_questions;
  player public.session_participants;
  current_player_response public.live_responses;
  player_valid boolean := false;
  question_ids jsonb := '[]'::jsonb;
  question_count integer := 0;
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

  select * into selected_quiz
  from public.quizzes
  where id=target.quiz_id;

  select
    coalesce(jsonb_agg(item.question_id order by item.sort_order,item.id),'[]'::jsonb),
    count(*)::integer
  into question_ids,question_count
  from public.quiz_questions item
  where item.quiz_id=target.quiz_id;

  if target.current_question_index>=0 then
    select item.* into current_item
    from public.quiz_questions item
    where item.quiz_id=target.quiz_id
    order by item.sort_order,item.id
    offset target.current_question_index
    limit 1;
  end if;

  if player_valid and current_item.id is not null then
    select * into current_player_response
    from public.live_responses response
    where response.session_id=target.id
      and response.participant_id=player.id
      and response.question_id=current_item.question_id
    limit 1;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id',participant.id,
    'nickname',participant.nickname,
    'score',participant.score-case
      when target.revealed_question_index=target.current_question_index then 0
      else coalesce(current_response.awarded_points,0)
    end,
    'currentStreak',case
      when target.revealed_question_index=target.current_question_index then participant.current_streak
      when current_response.id is not null then coalesce((current_response.score_detail->>'streakBefore')::integer,0)
      else participant.current_streak
    end,
    'bestStreak',case
      when target.revealed_question_index=target.current_question_index then participant.best_streak
      when current_response.id is not null then coalesce((current_response.score_detail->>'bestStreakBefore')::integer,0)
      else participant.best_streak
    end,
    'powerups',participant.powerups,
    'badges',participant.badges
  ) order by participant.score desc,participant.joined_at),'[]'::jsonb)
  into participants
  from public.session_participants participant
  left join lateral (
    select response.id,response.awarded_points,response.score_detail
    from public.live_responses response
    where response.session_id=target.id
      and response.participant_id=participant.id
      and response.question_id=current_item.question_id
    limit 1
  ) current_response on true
  where participant.session_id=target.id;

  if current_item.id is not null then
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
        when question.type::text='multiple_choice'
          and player_valid
          and exists(
            select 1 from public.powerup_events event
            where event.session_id=target.id
              and event.participant_id=player.id
              and event.question_id=question.id
              and event.powerup_type='fifty_fifty'
          )
        then jsonb_build_object(
          'hiddenOptionIds',(
            select coalesce(jsonb_agg(hidden.id order by hidden.sort_order),'[]'::jsonb)
            from (
              select option.id,option.sort_order
              from public.question_options option
              where option.question_id=question.id and not option.is_correct
              order by option.sort_order
              limit 2
            ) hidden
          )
        )
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
    from public.questions question
    left join lateral (
      select jsonb_agg(jsonb_build_object(
        'id',option.id,
        'label',option.label,
        'text',option.text,
        'isCorrect',case
          when target.revealed_question_index=target.current_question_index then option.is_correct
          else false
        end,
        'sortOrder',option.sort_order
      ) order by option.sort_order) as items
      from public.question_options option
      where option.question_id=question.id
    ) options on true
    where question.id=current_item.question_id;
  end if;

  if player_valid then
    select coalesce(jsonb_object_agg(response.question_id::text,jsonb_build_object(
      'answer',response.submitted_answer,
      'correct',case
        when target.revealed_question_index=target.current_question_index then response.is_correct
        else null
      end,
      'responseTimeMs',response.response_time_ms,
      'awardedPoints',case
        when target.revealed_question_index=target.current_question_index then response.awarded_points
        else 0
      end,
      'streakAfter',case
        when target.revealed_question_index=target.current_question_index then coalesce((response.score_detail->>'streakAfter')::integer,player.current_streak)
        else coalesce((response.score_detail->>'streakBefore')::integer,0)
      end,
      'powerupUsed',response.powerup_type,
      'scoreDetail',case
        when target.revealed_question_index=target.current_question_index then response.score_detail
        else '{}'::jsonb
      end
    )),'{}'::jsonb)
    into player_answers
    from public.live_responses response
    where response.session_id=target.id and response.participant_id=player.id;

    if current_item.id is not null then
      select jsonb_build_object('type',event.powerup_type,'questionId',event.question_id)
      into active_powerup
      from public.powerup_events event
      where event.session_id=target.id
        and event.participant_id=player.id
        and event.question_id=current_item.question_id
        and not exists(
          select 1 from public.live_responses response
          where response.session_id=target.id
            and response.participant_id=player.id
            and response.question_id=event.question_id
        )
      order by event.created_at desc
      limit 1;
    end if;
  end if;

  return jsonb_build_object(
    'state',target.status::text,
    'currentQuestionId',current_item.question_id,
    'questionCount',question_count,
    'snapshotError',case
      when target.status in ('live','paused') and target.current_question_index>=0 and current_item.id is null
      then 'quiz_has_no_question_at_index'
      else null
    end,
    'session',jsonb_build_object(
      'id',target.id,
      'quizId',target.quiz_id,
      'teacherId',target.teacher_id,
      'classId',target.class_id,
      'pin',target.pin,
      'status',target.status::text,
      'currentQuestionIndex',target.current_question_index,
      'currentQuestionId',current_item.question_id,
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
      'score',player.score-case
        when target.revealed_question_index=target.current_question_index then 0
        else coalesce(current_player_response.awarded_points,0)
      end,
      'currentStreak',case
        when target.revealed_question_index=target.current_question_index then player.current_streak
        when current_player_response.id is not null then coalesce((current_player_response.score_detail->>'streakBefore')::integer,0)
        else player.current_streak
      end,
      'bestStreak',case
        when target.revealed_question_index=target.current_question_index then player.best_streak
        when current_player_response.id is not null then coalesce((current_player_response.score_detail->>'bestStreakBefore')::integer,0)
        else player.best_streak
      end,
      'powerups',player.powerups,
      'badges',player.badges,
      'activePowerup',active_powerup,
      'answers',player_answers
    ) else null end
  );
end $$;

revoke execute on function public.get_live_game_snapshot(text,uuid,uuid) from public;
grant execute on function public.get_live_game_snapshot(text,uuid,uuid) to anon,authenticated;

-- Keep scoring server-side during the answering phase. The internal scorer
-- records the real result, while the public RPC returns only the score that was
-- visible before this question. Snapshot results remain masked until reveal.
alter function public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer)
  rename to submit_live_response_scored;

revoke all on function public.submit_live_response_scored(uuid,uuid,uuid,uuid,jsonb,integer)
  from public,anon,authenticated;

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
  previous_score integer;
  previous_streak integer;
  previous_best_streak integer;
  active_index integer;
  revealed_index integer;
begin
  select
    participant.score,
    participant.current_streak,
    participant.best_streak,
    session.current_question_index,
    session.revealed_question_index
  into
    previous_score,
    previous_streak,
    previous_best_streak,
    active_index,
    revealed_index
  from public.session_participants participant
  join public.quiz_sessions session on session.id=participant.session_id
  where participant.id=p_participant_id
    and participant.session_id=p_session_id
    and participant.client_token=p_client_token;

  if previous_score is null then raise exception 'Invalid participant token'; end if;
  if active_index>=0 and revealed_index=active_index then raise exception 'Question is no longer accepting answers'; end if;

  perform *
  from public.submit_live_response_scored(
    p_session_id,
    p_participant_id,
    p_client_token,
    p_question_id,
    p_answer,
    p_response_time_ms
  );

  update public.live_responses response
  set score_detail=response.score_detail||jsonb_build_object(
    'streakBefore',previous_streak,
    'bestStreakBefore',previous_best_streak
  )
  where response.session_id=p_session_id
    and response.participant_id=p_participant_id
    and response.question_id=p_question_id;

  return query select null::boolean,0,previous_score;
end $$;

revoke execute on function public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer) from public;
grant execute on function public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer) to anon,authenticated;
