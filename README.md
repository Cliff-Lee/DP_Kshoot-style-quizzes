# MathPulse

MathPulse is a syllabus-first live and assignable quiz platform for IB Mathematics: Analysis and Approaches (AA) and Applications and Interpretation (AI) teachers. Every playable question has a course identity and a foreign-key relationship to the correct course-specific syllabus point, and attempts roll up to class, student, topic, and point-level reports.

The repository includes a polished React MVP, a persistent local demo adapter, a Supabase production schema with RLS and Realtime, all 161 AA/AI syllabus points, 503 generated mathematics questions, strict course-aware ChatGPT JSON import validation, plan gates, sample imports, and tests.

## What is implemented

- Teacher email sign-up/sign-in through Supabase Auth when configured
- Persistent local demo mode when Supabase variables are absent
- Teacher dashboard, classes and rosters
- Global course switcher for AA SL, AA HL, AI SL, and AI HL; HL includes its family’s SL core plus AHL points
- Private/shared question bank with create, edit, duplicate, archive and review submission
- `MathQuiz Import Format v1` and `v1.1` parser, relational syllabus-code validation, editable invalid rows, duplicate warnings, preview and batch history
- Prompt studio for multi-point SL/AHL coverage with configurable difficulty, type, style, calculator, and misconception mixes
- Quiz builder, assignment-ready quiz records, live host controls and student phone answering for nine question types
- Projector-ready live lobby with a base-path-safe student URL, locally rendered QR code, large PIN, and copy controls
- Live leaderboards, streak scoring, score explanations, limited powerup inventories and badge awards
- Cross-tab local live play plus Supabase Realtime publication/subscription support
- Class/student syllabus mastery reports, heatmap, item-analysis SQL view and progress summaries
- Free, premium and school plan definitions with centralized usage gates
- Platform-admin-only public question review
- Responsive teacher, projector and phone layouts

Playable question types are `multiple_choice`, `numeric_answer`, `short_answer`, `multi_select`, `true_false`, `matching`, `ordering`, `drag_drop`, and `fill_blank`. Classification selects are used for drag/drop on phones because they are more reliable and accessible than pointer-only dragging.

## Run locally

Requirements: Node.js 20+ and npm 10+ (pnpm 9+ also works).

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:4173>. Choose **Teacher workspace** on the sign-in page for seeded local data. Local changes persist in `localStorage`; live sessions synchronize across tabs using `BroadcastChannel`, which makes it easy to test a teacher projector and student phone in two tabs.

Quality checks:

```bash
npm test
npm run lint
npm run build
```

## Connect Supabase

1. Create a Supabase project, or install the Supabase CLI and run `supabase start`.
2. Copy `.env.example` to `.env.local`.
3. Set:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Apply migrations:

```bash
supabase db reset     # local project
# or
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The app detects the variables at build time. When configured it uses Supabase Auth, loads the RLS-scoped workspace, writes teacher CRUD records to Postgres, records usage through an RPC, and listens to live-session table changes. Without the variables it clearly labels itself **Local demo data**.

### Migrations

- `202607220001_core_schema.sql` — enums, tables, indexes, ownership helpers, RLS, join/answer RPCs, plan-check RPC and Realtime publication
- `202607220002_seed_plans_and_syllabus.sql` — plan catalog, IB AA course and all 83 syllabus points
- `202607220003_reporting_views.sql` — `class_syllabus_mastery`, `student_syllabus_mastery`, and `quiz_item_analysis`
- `202607220004_gameplay_extensions.sql` — v1.1 question enums, score detail, streak/powerup/badge state, RLS and live gameplay RPC updates
- `202607220005_question_metadata_and_coverage.sql` — additive question-style, calculator, time, and mark metadata
- `202607230001_replace_metadata_questions.sql` — generated genuine-mathematics seed and cleanup of legacy syllabus-description placeholders
- `202607230002_add_ai_courses_and_questions.sql` — canonical four-course identity, all 78 AI syllabus points, and the 234-question AI seed

The Auth trigger allows self-service sign-up only as `student` or `teacher_free`; premium, school-admin, and platform-admin roles must be granted by a trusted server/admin workflow. Public question approval is likewise enforced in RLS, not only hidden in the UI.

## MathQuiz Import Format v1 and v1.1

The original v1 envelope is still accepted. New sets should use v1.1:

```json
{
  "format": "math_quiz_import_v1.1",
  "courseFamily": "analysis_approaches",
  "courseLevel": "SL",
  "course": "IB Mathematics: Analysis and Approaches SL",
  "source": "chatgpt",
  "questions": []
}
```

Every v1.1 question requires `type`, `syllabusCode`, `difficulty`, `questionStyle`, `calculator`, `estimatedTimeSeconds`, `marksEstimate`, `prompt`, `explanation`, and type-specific answer data. `tags` is an optional array of strings. The v1 parser remains backward compatible and warns when the new metadata is absent.

Validation rules include:

- the document format must be `math_quiz_import_v1` or `math_quiz_import_v1.1`;
- v1.1 requires `courseFamily` (`analysis_approaches` or `applications_interpretation`) and `courseLevel` (`SL` or `HL`);
- `course` must be the matching canonical display name;
- `syllabusCode` must exist for that exact course family, and an SL envelope cannot contain AHL content;
- multiple-choice items use four unique choices by default (teachers can choose three or five before validating) and an answer that exactly matches one choice;
- numeric answers must be numeric and may include a non-negative `tolerance`;
- short answers require `answer` or a non-empty `acceptedAnswers` array;
- multi-select answers must be a unique subset of the available choices;
- true/false answers are JSON booleans;
- matching pairs and ordering items must be unique;
- drag-drop items must refer to a declared zone;
- fill blanks accept exact alternatives and use `___` to make the blank visible;
- `questionStyle` is one of `recall`, `procedural`, `conceptual`, `misconception`, `application`, or `exam_style`;
- `calculator` is `allowed`, `not_allowed`, or `neutral`, estimated time is 10–900 seconds, and estimated marks are 1–20;
- normalized exact prompts already in the teacher's bank require explicit confirmation.

See [the AA v1.1 sample](examples/math-quiz-import-v1.1.sample.json), [the AI v1.1 sample](examples/math-quiz-import-v1.1.ai.sample.json), [the backward-compatible v1 sample](examples/math-quiz-import-v1.sample.json), [the generated prompt template](examples/chatgpt-prompt-template.txt), and [the v1.1 format reference](docs/mathquiz-import-format-v1.1.md).

Imported questions are always saved as private drafts. Publishing is a separate submission/review transition.

## Syllabus source

The AA seed was extracted from the supplied **Mathematics: analysis and approaches guide**, first assessment 2021, syllabus content pages 28–69. It contains:

- Topic 1: Number and algebra — SL 1.1–1.9, AHL 1.10–1.16
- Topic 2: Functions — SL 2.1–2.11, AHL 2.12–2.16
- Topic 3: Geometry and trigonometry — SL 3.1–3.8, AHL 3.9–3.18
- Topic 4: Statistics and probability — SL 4.1–4.12, AHL 4.13–4.14
- Topic 5: Calculus — SL 5.1–5.11, AHL 5.12–5.19

Titles in the seed are concise product labels. Descriptions summarize the guide's examinable **Content** column. Connections/TOK prompts were deliberately not treated as syllabus points.

The AI seed was extracted from the supplied **Mathematics: applications and interpretation guide**, first assessment 2021, syllabus content pages 26–70. It contains:

- Topic 1 — SL 1.1–1.8, AHL 1.9–1.15
- Topic 2 — SL 2.1–2.6, AHL 2.7–2.10
- Topic 3 — SL 3.1–3.6, AHL 3.7–3.16
- Topic 4 — SL 4.1–4.11, AHL 4.12–4.19
- Topic 5 — SL 5.1–5.8, AHL 5.9–5.18

### Question coverage seed

The reviewed templates under `scripts/question-bank/` and `scripts/question-bank-ai/` generate at least three genuine mathematics questions for every syllabus point. AA has 269 generated questions plus 13 retained demo examples; AI has 234 generated questions. A fresh local workspace therefore contains 516 questions across 161 relational syllabus points. The combined bank exercises all nine player renderers and covers calculations, modelling, graph reasoning, proof, financial mathematics, Voronoi diagrams, probability, statistics, trigonometry, matrices, vectors, graph theory, Markov chains, calculus, and differential equations.

Run `npm run questions:generate` to rebuild both course banks and their Supabase migrations deterministically. Run `npm run questions:audit` to verify all 161 points, exact course mappings, answer shapes, difficulty/type/style coverage, source synchronization, duplicates, and banned metadata prompts.

## Security model

RLS is enabled on every tenant or user-data table. Important boundaries include:

- teachers own their classes, quiz records, private questions and class attempts;
- students can see their own membership, assignments, attempts and answers;
- approved public questions are readable by teacher roles;
- school admins can read data only for their `school_id`;
- only `platform_admin` can transition submitted public questions to `approved`;
- quick-play participants use a per-device secret token and submit responses through a `security definer` RPC;
- active-session reads expose only the data needed for classroom play.

Review these policies with your institution's data-protection requirements before production rollout. Service-role keys must never be placed in Vite environment variables or browser code.

## Static build and GitHub Pages

Vite builds with `base: './'`, and the app uses `HashRouter`, so deep links remain usable on static hosts without server rewrites. Live join links derive the current origin and pathname at runtime; a Pages deployment therefore displays and encodes a URL such as `https://ACCOUNT.github.io/REPOSITORY/#/play/189412` without dropping the repository base path.

```bash
npm run build
npm run preview
```

Deploy the generated `dist/` directory to GitHub Pages. In repository settings choose **GitHub Actions** as the Pages source, then use a standard Vite Pages workflow that installs dependencies, runs `npm run build`, and uploads `dist`. Routes appear after the hash, for example `https://ACCOUNT.github.io/REPOSITORY/#/play` and `#/teacher/dashboard`; this is intentional static-host compatibility. Supabase environment variables must be set as Actions variables before the build if cloud mode is required.

All product imagery is local under `public/assets`; there are no runtime image requests to third-party hosts.

## Stripe integration TODO

Stripe is intentionally stubbed in the MVP. The database and UI already use stable plan/subscription boundaries. A production integration should:

1. Create Stripe products/prices corresponding to the seeded `plans.slug` values.
2. Add a server-side Checkout Session endpoint; never create subscriptions in the browser.
3. Store Stripe customer/subscription IDs only from signed webhook events.
4. Handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, and payment-failure events idempotently.
5. Update `subscriptions.status` and period dates in a service-role Edge Function.
6. Keep feature enforcement in `check_action_allowed`; do not trust client-only upgrade state.
7. Add a Billing Portal endpoint and school-seat/teacher provisioning logic.

## Product-stage notes

- `graph_or_image_prompt` remains a legacy schema type and does not yet have a dedicated authoring/player surface; the nine documented v1.1 types do.
- The local adapter provides complete multi-tab classroom play. Before large production rollouts, connect the browser flow directly to the new powerup and response RPCs and load-test Supabase Realtime with the target classroom profile.
- Assignment due-date UI and email invitations need transactional notification infrastructure.
- Nickname moderation, rate limits and abuse controls should be added before public anonymous play.
- Add institution-specific retention/deletion controls and a signed data-processing agreement before onboarding schools.
- The local demo adapter is for evaluation; production classrooms should use Supabase so devices share authoritative state.
