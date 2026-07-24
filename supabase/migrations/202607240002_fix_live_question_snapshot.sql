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

revoke execute on function public.get_live_game_snapshot(text,uuid,uuid) from public;
grant execute on function public.get_live_game_snapshot(text,uuid,uuid) to anon,authenticated;
