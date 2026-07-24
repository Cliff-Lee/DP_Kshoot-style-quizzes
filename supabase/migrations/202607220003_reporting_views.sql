-- Reporting views remain relational: every aggregate joins answers -> questions -> syllabus_points.
-- security_invoker keeps the caller's RLS policies in force on Postgres 15+.

create or replace view public.class_syllabus_mastery
with (security_invoker=true) as
select
  a.class_id,
  sp.id as syllabus_point_id,
  sp.code,
  sp.topic_number,
  sp.topic_name,
  sp.level,
  sp.title,
  count(ans.id)::bigint as response_count,
  count(ans.id) filter (where ans.is_correct)::bigint as correct_count,
  round(100.0 * count(ans.id) filter (where ans.is_correct) / nullif(count(ans.id),0),1) as accuracy_percent,
  avg(ans.response_time_ms)::bigint as average_response_time_ms,
  min(ans.created_at) as first_response_at,
  max(ans.created_at) as latest_response_at
from public.attempts a
join public.answers ans on ans.attempt_id=a.id
join public.questions q on q.id=ans.question_id
join public.syllabus_points sp on sp.id=q.syllabus_point_id
where a.class_id is not null
group by a.class_id,sp.id,sp.code,sp.topic_number,sp.topic_name,sp.level,sp.title;

create or replace view public.student_syllabus_mastery
with (security_invoker=true) as
select
  a.student_id,
  a.class_id,
  sp.id as syllabus_point_id,
  sp.code,
  sp.topic_number,
  sp.topic_name,
  sp.level,
  sp.title,
  count(ans.id)::bigint as response_count,
  count(ans.id) filter (where ans.is_correct)::bigint as correct_count,
  round(100.0 * count(ans.id) filter (where ans.is_correct) / nullif(count(ans.id),0),1) as accuracy_percent,
  avg(ans.response_time_ms)::bigint as average_response_time_ms,
  max(ans.created_at) as latest_response_at
from public.attempts a
join public.answers ans on ans.attempt_id=a.id
join public.questions q on q.id=ans.question_id
join public.syllabus_points sp on sp.id=q.syllabus_point_id
group by a.student_id,a.class_id,sp.id,sp.code,sp.topic_number,sp.topic_name,sp.level,sp.title;

create or replace view public.quiz_item_analysis
with (security_invoker=true) as
select
  a.quiz_id,
  ans.question_id,
  q.prompt,
  q.syllabus_point_id,
  sp.code as syllabus_code,
  count(ans.id)::bigint as response_count,
  count(ans.id) filter (where ans.is_correct)::bigint as correct_count,
  round(100.0 * count(ans.id) filter (where ans.is_correct) / nullif(count(ans.id),0),1) as accuracy_percent,
  avg(ans.response_time_ms)::bigint as average_response_time_ms,
  percentile_cont(0.5) within group(order by ans.response_time_ms)::bigint as median_response_time_ms
from public.attempts a
join public.answers ans on ans.attempt_id=a.id
join public.questions q on q.id=ans.question_id
join public.syllabus_points sp on sp.id=q.syllabus_point_id
group by a.quiz_id,ans.question_id,q.prompt,q.syllabus_point_id,sp.code;

grant select on public.class_syllabus_mastery, public.student_syllabus_mastery, public.quiz_item_analysis to authenticated;
