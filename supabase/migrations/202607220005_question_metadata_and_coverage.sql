-- Rich question metadata. Genuine mathematics seed questions are generated into
-- 202607230001_replace_metadata_questions.sql by scripts/generate-question-bank.mjs.

do $$ begin create type public.question_style as enum ('recall','procedural','conceptual','misconception','application','exam_style'); exception when duplicate_object then null; end $$;
do $$ begin create type public.calculator_mode as enum ('allowed','not_allowed','neutral'); exception when duplicate_object then null; end $$;

alter table public.questions add column if not exists question_style public.question_style not null default 'conceptual';
alter table public.questions add column if not exists calculator public.calculator_mode not null default 'neutral';
alter table public.questions add column if not exists estimated_time_seconds integer not null default 60 check (estimated_time_seconds between 10 and 900);
alter table public.questions add column if not exists marks_estimate integer not null default 1 check (marks_estimate between 1 and 20);

create index if not exists questions_style_idx on public.questions(question_style);
create index if not exists questions_calculator_idx on public.questions(calculator);
create index if not exists questions_syllabus_difficulty_idx on public.questions(syllabus_point_id,difficulty);
