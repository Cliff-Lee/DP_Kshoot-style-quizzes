-- MathPulse core schema
-- Supabase Postgres 15+. Apply with `supabase db reset` locally or `supabase db push` remotely.

create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('student','teacher_free','teacher_premium','school_admin','platform_admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.syllabus_level as enum ('SL','AHL'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_owner_type as enum ('teacher','school','platform'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_visibility as enum ('private','school','public'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_status as enum ('draft','pending_review','approved','archived'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_type as enum ('multiple_choice','numeric_answer','short_answer','drag_drop','matching','ordering','multi_select','graph_or_image_prompt'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_difficulty as enum ('foundation','standard','extension'); exception when duplicate_object then null; end $$;
do $$ begin create type public.question_source as enum ('manual','chatgpt_import','platform_seed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.quiz_mode as enum ('live','assignment','practice'); exception when duplicate_object then null; end $$;
do $$ begin create type public.quiz_session_status as enum ('waiting','live','paused','ended'); exception when duplicate_object then null; end $$;
do $$ begin create type public.import_status as enum ('uploaded','validated','partially_valid','imported','failed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_owner_type as enum ('teacher','school'); exception when duplicate_object then null; end $$;

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  monthly_price numeric(10,2) not null default 0 check (monthly_price >= 0),
  yearly_price numeric(10,2) not null default 0 check (yearly_price >= 0),
  limits jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  plan_id uuid references public.plans(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  role public.user_role not null default 'student',
  school_id uuid references public.schools(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  exam_board text not null,
  subject text not null,
  level text not null,
  active boolean not null default true
);

create table if not exists public.syllabus_points (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  code text not null,
  topic_number smallint not null check (topic_number between 1 and 5),
  topic_name text not null,
  level public.syllabus_level not null,
  title text not null,
  description text not null,
  parent_id uuid references public.syllabus_points(id) on delete set null,
  sort_order integer not null,
  active boolean not null default true,
  unique(course_id, code)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  school_id uuid references public.schools(id) on delete set null,
  name text not null check (char_length(name) between 1 and 100),
  course_id uuid not null references public.courses(id) on delete restrict,
  join_code text not null unique check (join_code ~ '^[A-Z0-9]{6,10}$'),
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.class_members (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  unique(class_id, student_id)
);

create table if not exists public.question_import_batches (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  raw_json jsonb not null,
  status public.import_status not null default 'uploaded',
  imported_count integer not null default 0 check (imported_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  owner_type public.question_owner_type not null default 'teacher',
  owner_id uuid,
  visibility public.question_visibility not null default 'private',
  status public.question_status not null default 'draft',
  course_id uuid not null references public.courses(id) on delete restrict,
  syllabus_point_id uuid not null references public.syllabus_points(id) on delete restrict,
  type public.question_type not null,
  prompt text not null check (char_length(trim(prompt)) > 0),
  answer_data jsonb not null default '{}'::jsonb,
  explanation text not null default '',
  difficulty public.question_difficulty not null default 'standard',
  tags text[] not null default '{}',
  source public.question_source not null default 'manual',
  import_batch_id uuid references public.question_import_batches(id) on delete set null,
  duplicate_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint question_syllabus_course_matches check (course_id is not null and syllabus_point_id is not null)
);

create unique index if not exists questions_teacher_exact_prompt_unique
  on public.questions (created_by, md5(lower(regexp_replace(trim(prompt), '\s+', ' ', 'g'))))
  where status <> 'archived' and created_by is not null and not duplicate_confirmed;

create table if not exists public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  label text not null,
  text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  unique(question_id, sort_order)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  course_id uuid not null references public.courses(id) on delete restrict,
  mode public.quiz_mode not null default 'live',
  settings jsonb not null default '{}'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  sort_order integer not null,
  points integer not null default 1000 check (points >= 0),
  time_limit_seconds integer not null default 30 check (time_limit_seconds between 5 and 900),
  unique(quiz_id, question_id),
  unique(quiz_id, sort_order)
);

create table if not exists public.quiz_assignments (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  assigned_by uuid not null references public.profiles(id) on delete cascade,
  opens_at timestamptz not null default now(),
  due_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(quiz_id, class_id)
);

create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  pin text not null unique check (pin ~ '^[0-9]{6}$'),
  status public.quiz_session_status not null default 'waiting',
  current_question_index integer not null default -1,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- Quick-play participants can be anonymous. client_token is a per-device secret used by RPCs.
create table if not exists public.session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  nickname text not null check (char_length(trim(nickname)) between 1 and 40),
  client_token uuid not null default gen_random_uuid(),
  score integer not null default 0,
  joined_at timestamptz not null default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete restrict,
  session_id uuid references public.quiz_sessions(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score numeric not null default 0,
  max_score numeric not null default 0,
  unique(quiz_id, session_id, student_id)
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submitted_answer jsonb not null,
  is_correct boolean,
  response_time_ms integer not null check (response_time_ms >= 0),
  awarded_points numeric not null default 0,
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create table if not exists public.live_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  participant_id uuid not null references public.session_participants(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict,
  submitted_answer jsonb not null,
  is_correct boolean not null,
  response_time_ms integer not null check (response_time_ms >= 0),
  awarded_points integer not null default 0,
  created_at timestamptz not null default now(),
  unique(session_id, participant_id, question_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_type public.subscription_owner_type not null,
  owner_id uuid not null,
  plan_id uuid not null references public.plans(id) on delete restrict,
  status text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  unique(owner_type, owner_id)
);

create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  event_type text not null,
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists syllabus_points_course_topic_idx on public.syllabus_points(course_id, topic_number, sort_order);
create index if not exists classes_teacher_idx on public.classes(teacher_id) where not archived;
create index if not exists class_members_student_idx on public.class_members(student_id);
create index if not exists questions_owner_idx on public.questions(created_by, status, visibility);
create index if not exists questions_syllabus_idx on public.questions(syllabus_point_id);
create index if not exists quiz_sessions_pin_idx on public.quiz_sessions(pin) where status <> 'ended';
create index if not exists attempts_class_student_idx on public.attempts(class_id, student_id, completed_at);
create index if not exists answers_question_idx on public.answers(question_id, is_correct);
create index if not exists usage_events_owner_month_idx on public.usage_events(owner_id, event_type, created_at);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at before update on public.questions for each row execute procedure public.set_updated_at();

create or replace function public.enforce_question_course() returns trigger language plpgsql set search_path = public as $$
begin
  if not exists (select 1 from public.syllabus_points sp where sp.id = new.syllabus_point_id and sp.course_id = new.course_id) then
    raise exception 'syllabus_point_id must belong to question course_id';
  end if;
  return new;
end $$;
drop trigger if exists questions_enforce_course on public.questions;
create trigger questions_enforce_course before insert or update of course_id, syllabus_point_id on public.questions for each row execute procedure public.enforce_question_course();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('student','teacher_free') then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'student'::public.user_role
  end;
  insert into public.profiles(id,email,display_name,role)
  values(new.id,coalesce(new.email,''),coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'),''),split_part(coalesce(new.email,'student'),'@',1)),requested_role)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.current_role() returns public.user_role
language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid() $$;
create or replace function public.current_school_id() returns uuid
language sql stable security definer set search_path = public as $$ select school_id from public.profiles where id = auth.uid() $$;
create or replace function public.is_teacher() returns boolean
language sql stable security definer set search_path = public as $$ select coalesce(public.current_role() in ('teacher_free','teacher_premium','school_admin','platform_admin'),false) $$;
create or replace function public.owns_class(target_class uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists(select 1 from public.classes where id=target_class and teacher_id=auth.uid()) $$;
create or replace function public.is_class_member(target_class uuid) returns boolean
language sql stable security definer set search_path = public as $$ select exists(select 1 from public.class_members where class_id=target_class and student_id=auth.uid()) $$;

-- RLS is enabled on every tenant/user-data table. Reference data is read-only to clients.
alter table public.plans enable row level security;
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.syllabus_points enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.question_import_batches enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_assignments enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.attempts enable row level security;
alter table public.answers enable row level security;
alter table public.live_responses enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

create policy plans_read on public.plans for select using (true);
create policy courses_read on public.courses for select using (true);
create policy syllabus_read on public.syllabus_points for select using (true);

create policy profiles_self_read on public.profiles for select using (id=auth.uid());
create policy profiles_self_update on public.profiles for update using (id=auth.uid()) with check (id=auth.uid() and role=public.current_role());
create policy profiles_platform_all on public.profiles for all using (public.current_role()='platform_admin') with check (public.current_role()='platform_admin');
create policy profiles_teacher_student_read on public.profiles for select using (exists(select 1 from public.class_members cm join public.classes c on c.id=cm.class_id where cm.student_id=profiles.id and c.teacher_id=auth.uid()));
create policy profiles_school_admin_read on public.profiles for select using (public.current_role() in ('school_admin','platform_admin') and (public.current_role()='platform_admin' or school_id=public.current_school_id()));

create policy schools_members_read on public.schools for select using (id=public.current_school_id() or public.current_role()='platform_admin');
create policy schools_admin_update on public.schools for update using (public.current_role()='school_admin' and id=public.current_school_id() or public.current_role()='platform_admin');

create policy classes_teacher_all on public.classes for all using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
create policy classes_student_read on public.classes for select using (public.is_class_member(id));
create policy classes_school_admin_read on public.classes for select using (public.current_role() in ('school_admin','platform_admin') and (public.current_role()='platform_admin' or school_id=public.current_school_id()));

create policy class_members_teacher_all on public.class_members for all using (public.owns_class(class_id)) with check (public.owns_class(class_id));
create policy class_members_self_read on public.class_members for select using (student_id=auth.uid());
create policy class_members_school_admin_read on public.class_members for select using (exists(select 1 from public.classes c where c.id=class_id and public.current_role() in ('school_admin','platform_admin') and (public.current_role()='platform_admin' or c.school_id=public.current_school_id())));

create policy import_batches_teacher_all on public.question_import_batches for all using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
create policy import_batches_platform_read on public.question_import_batches for select using (public.current_role()='platform_admin');

create policy questions_owner_all on public.questions for all using (created_by=auth.uid()) with check (created_by=auth.uid() and (status<>'approved' or public.current_role()='platform_admin'));
create policy questions_public_teacher_read on public.questions for select using (status='approved' and visibility='public' and public.is_teacher());
create policy questions_school_read on public.questions for select using (visibility='school' and owner_type='school' and owner_id=public.current_school_id() and public.is_teacher());
create policy questions_platform_all on public.questions for all using (public.current_role()='platform_admin') with check (public.current_role()='platform_admin');
create policy questions_live_read on public.questions for select to anon, authenticated using (exists(select 1 from public.quiz_questions qq join public.quiz_sessions qs on qs.quiz_id=qq.quiz_id where qq.question_id=questions.id and qs.status in ('live','paused')));

create policy options_parent_read on public.question_options for select using (exists(select 1 from public.questions q where q.id=question_id));
create policy options_owner_all on public.question_options for all using (exists(select 1 from public.questions q where q.id=question_id and q.created_by=auth.uid())) with check (exists(select 1 from public.questions q where q.id=question_id and q.created_by=auth.uid()));
create policy options_platform_all on public.question_options for all using (public.current_role()='platform_admin') with check (public.current_role()='platform_admin');

create policy quizzes_teacher_all on public.quizzes for all using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
create policy quizzes_assigned_student_read on public.quizzes for select using (exists(select 1 from public.quiz_assignments qa where qa.quiz_id=quizzes.id and public.is_class_member(qa.class_id)));
create policy quizzes_live_read on public.quizzes for select to anon, authenticated using (exists(select 1 from public.quiz_sessions qs where qs.quiz_id=quizzes.id and qs.status in ('waiting','live','paused')));
create policy quiz_questions_teacher_all on public.quiz_questions for all using (exists(select 1 from public.quizzes q where q.id=quiz_id and q.teacher_id=auth.uid())) with check (exists(select 1 from public.quizzes q where q.id=quiz_id and q.teacher_id=auth.uid()));
create policy quiz_questions_student_read on public.quiz_questions for select using (exists(select 1 from public.quiz_assignments qa where qa.quiz_id=quiz_questions.quiz_id and public.is_class_member(qa.class_id)) or exists(select 1 from public.quiz_sessions qs where qs.quiz_id=quiz_questions.quiz_id and qs.status in ('live','paused')));
create policy assignments_teacher_all on public.quiz_assignments for all using (assigned_by=auth.uid() and public.owns_class(class_id)) with check (assigned_by=auth.uid() and public.owns_class(class_id));
create policy assignments_student_read on public.quiz_assignments for select using (public.is_class_member(class_id) and opens_at<=now() and (due_at is null or due_at>=now()));

create policy sessions_teacher_all on public.quiz_sessions for all using (teacher_id=auth.uid()) with check (teacher_id=auth.uid());
create policy sessions_active_read on public.quiz_sessions for select to anon, authenticated using (status in ('waiting','live','paused'));
create policy participants_teacher_read on public.session_participants for select using (exists(select 1 from public.quiz_sessions s where s.id=session_id and s.teacher_id=auth.uid()));
create policy participants_active_read on public.session_participants for select to anon, authenticated using (exists(select 1 from public.quiz_sessions s where s.id=session_id and s.status in ('waiting','live','paused')));
create policy participants_join on public.session_participants for insert to anon, authenticated with check (exists(select 1 from public.quiz_sessions s where s.id=session_id and s.status='waiting'));
create policy live_responses_teacher_read on public.live_responses for select using (exists(select 1 from public.quiz_sessions s where s.id=session_id and s.teacher_id=auth.uid()));

create policy attempts_student_all on public.attempts for all using (student_id=auth.uid()) with check (student_id=auth.uid() and (class_id is null or public.is_class_member(class_id)));
create policy attempts_teacher_read on public.attempts for select using (exists(select 1 from public.quizzes q where q.id=quiz_id and q.teacher_id=auth.uid()) and (class_id is null or public.owns_class(class_id)));
create policy attempts_school_admin_read on public.attempts for select using (exists(select 1 from public.classes c where c.id=class_id and public.current_role() in ('school_admin','platform_admin') and (public.current_role()='platform_admin' or c.school_id=public.current_school_id())));
create policy answers_student_all on public.answers for all using (student_id=auth.uid()) with check (student_id=auth.uid() and exists(select 1 from public.attempts a where a.id=attempt_id and a.student_id=auth.uid()));
create policy answers_teacher_read on public.answers for select using (exists(select 1 from public.attempts a join public.quizzes q on q.id=a.quiz_id where a.id=attempt_id and q.teacher_id=auth.uid() and (a.class_id is null or public.owns_class(a.class_id))));
create policy answers_school_admin_read on public.answers for select using (exists(select 1 from public.attempts a join public.classes c on c.id=a.class_id where a.id=attempt_id and public.current_role() in ('school_admin','platform_admin') and (public.current_role()='platform_admin' or c.school_id=public.current_school_id())));

create policy subscriptions_owner_read on public.subscriptions for select using ((owner_type='teacher' and owner_id=auth.uid()) or (owner_type='school' and owner_id=public.current_school_id() and public.current_role()='school_admin') or public.current_role()='platform_admin');
create policy usage_owner_read on public.usage_events for select using (owner_id=auth.uid() or (owner_id=public.current_school_id() and public.current_role()='school_admin') or public.current_role()='platform_admin');

grant select on public.plans,public.courses,public.syllabus_points to anon,authenticated;
grant select,insert,update,delete on public.schools,public.profiles,public.classes,public.class_members,public.question_import_batches,public.questions,public.question_options,public.quizzes,public.quiz_questions,public.quiz_assignments,public.quiz_sessions,public.session_participants,public.attempts,public.answers,public.live_responses,public.subscriptions,public.usage_events to authenticated;
grant select on public.quizzes,public.quiz_questions,public.quiz_sessions,public.questions,public.question_options,public.session_participants to anon;
grant insert on public.session_participants to anon;

-- Students join by code through a definer function, so other class codes never become readable.
create or replace function public.join_class(class_code text, member_display_name text) returns uuid
language plpgsql security definer set search_path=public as $$
declare target_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select id into target_id from public.classes where join_code=upper(trim(class_code)) and not archived;
  if target_id is null then raise exception 'Class code not found'; end if;
  insert into public.class_members(class_id,student_id,display_name) values(target_id,auth.uid(),trim(member_display_name)) on conflict(class_id,student_id) do update set display_name=excluded.display_name;
  return target_id;
end $$;

create or replace function public.join_live_session(game_pin text, player_nickname text)
returns table(participant_id uuid, client_token uuid, session_id uuid)
language plpgsql security definer set search_path=public as $$
declare target public.quiz_sessions; new_participant public.session_participants;
begin
  select * into target from public.quiz_sessions where pin=trim(game_pin) and status='waiting';
  if target.id is null then raise exception 'Game PIN is not accepting players'; end if;
  insert into public.session_participants(session_id,student_id,nickname) values(target.id,auth.uid(),trim(player_nickname)) returning * into new_participant;
  return query select new_participant.id,new_participant.client_token,target.id;
end $$;

create or replace function public.submit_live_response(p_session_id uuid,p_participant_id uuid,p_client_token uuid,p_question_id uuid,p_answer jsonb,p_response_time_ms integer)
returns table(correct boolean, awarded integer, total_score integer)
language plpgsql security definer set search_path=public as $$
declare q public.questions; is_right boolean; earned integer; current_score integer;
begin
  if not exists(select 1 from public.session_participants p where p.id=p_participant_id and p.session_id=p_session_id and p.client_token=p_client_token) then raise exception 'Invalid participant token'; end if;
  if not exists(select 1 from public.quiz_sessions s join public.quiz_questions qq on qq.quiz_id=s.quiz_id where s.id=p_session_id and s.status='live' and qq.question_id=p_question_id and qq.sort_order=s.current_question_index) then raise exception 'Question is not active'; end if;
  select * into q from public.questions where id=p_question_id;
  is_right := case when q.type='numeric_answer' then abs((p_answer#>>'{}')::numeric-(q.answer_data->>'answer')::numeric)<=coalesce((q.answer_data->>'tolerance')::numeric,0) else lower(trim(p_answer#>>'{}'))=lower(trim(q.answer_data->>'answer')) end;
  earned := case when is_right then greatest(500,1000-(p_response_time_ms/50)) else 0 end;
  insert into public.live_responses(session_id,participant_id,question_id,submitted_answer,is_correct,response_time_ms,awarded_points) values(p_session_id,p_participant_id,p_question_id,p_answer,is_right,p_response_time_ms,earned);
  update public.session_participants set score=score+earned where id=p_participant_id returning score into current_score;
  return query select is_right,earned,current_score;
end $$;

create or replace function public.check_action_allowed(action_name text, requested_quantity integer default 1)
returns table(allowed boolean, used bigint, plan_limit bigint, plan_slug text)
language plpgsql stable security definer set search_path=public as $$
declare selected_plan public.plans; current_used bigint := 0; limit_value bigint; profile_row public.profiles;
begin
  select * into profile_row from public.profiles where id=auth.uid();
  select p.* into selected_plan from public.plans p where p.slug=case when profile_row.role='teacher_premium' then 'premium' when profile_row.role in ('school_admin','platform_admin') then 'school' else 'free' end;
  limit_value := nullif(selected_plan.limits->>action_name,'')::bigint;
  if action_name='classes' then select count(*) into current_used from public.classes where teacher_id=auth.uid() and not archived;
  elsif action_name='students' then select count(*) into current_used from public.class_members cm join public.classes c on c.id=cm.class_id where c.teacher_id=auth.uid();
  elsif action_name='private_questions' then select count(*) into current_used from public.questions where created_by=auth.uid() and visibility='private' and status<>'archived';
  else select coalesce(sum(quantity),0) into current_used from public.usage_events where owner_id=auth.uid() and event_type=action_name and created_at>=date_trunc('month',now());
  end if;
  return query select limit_value is null or current_used+requested_quantity<=limit_value,current_used,limit_value,selected_plan.slug;
end $$;

create or replace function public.record_usage(event_name text,event_quantity integer default 1,event_metadata jsonb default '{}'::jsonb) returns uuid
language plpgsql security definer set search_path=public as $$ declare new_id uuid; begin if auth.uid() is null then raise exception 'Authentication required'; end if; insert into public.usage_events(owner_id,event_type,quantity,metadata) values(auth.uid(),event_name,event_quantity,event_metadata) returning id into new_id; return new_id; end $$;

revoke execute on function public.join_class(text,text),public.join_live_session(text,text),public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer),public.check_action_allowed(text,integer),public.record_usage(text,integer,jsonb) from public;
grant execute on function public.join_class(text,text),public.check_action_allowed(text,integer),public.record_usage(text,integer,jsonb) to authenticated;
grant execute on function public.join_live_session(text,text),public.submit_live_response(uuid,uuid,uuid,uuid,jsonb,integer) to anon,authenticated;

-- Live classroom tables are streamed through Supabase Realtime. RLS still governs payload visibility.
do $$ begin
  alter publication supabase_realtime add table public.quiz_sessions;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.session_participants;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.live_responses;
exception when duplicate_object then null; end $$;
