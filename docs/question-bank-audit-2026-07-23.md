# Question-bank audit — 23 July 2026

## Baseline

Before replacement, the runtime demo bank contained 277 questions:

- 249 bad syllabus-description, tagging, or syllabus-code questions
- 28 genuine mathematics questions
- 83 of 83 syllabus points affected by at least one bad template

The bad questions were generated in `src/data/aaQuestionSeed.ts`. Equivalent placeholder rows were also produced by `supabase/migrations/202607220005_question_metadata_and_coverage.sql`. Examples included:

- “Which mathematical focus is mapped to syllabus point AHL 2.12?”
- “Select both statements that accurately describe SL 2.11.”
- “A student tags work on … Give the correct syllabus code.”

The checked-in import examples and 13 older demo questions were genuine mathematics and contained no banned metadata prompts.

## Remediation

The generic generator was removed. Its 249 records were replaced one-for-one with point-specific mathematics covering calculation, algebra, graphs, interpretation, proof, statistics, probability, trigonometry, vectors, calculus, and modelling. Twenty additional questions deepen representative points and broaden application, conceptual, and exam-style coverage across all five topics.

The source templates live under `scripts/question-bank/`. Running `npm run questions:generate` writes the reviewed runtime JSON and the idempotent Supabase replacement migration. Running `npm run questions:audit` fails if metadata prompts, syllabus-code answers, invalid answer structures, stale generated output, exact duplicates, or minimum coverage/type/style/difficulty requirements regress.

The follow-up audit also corrected four content-to-code records: the retained quadratic graph item now maps to `SL 2.6`, the standard-function derivative matching item maps to `SL 5.6`, and the retained/demo plus v1.1 sample true-false item now tests scientific notation under `SL 1.1`.

## Post-remediation audit

- 282 runtime questions audited: 269 generated and 13 retained demo questions
- 12 import-sample questions audited separately
- 294 total question records audited
- 0 banned metadata questions
- 0 syllabus-code answers
- 0 invalid metadata or answer records
- 0 generator/source drift
- 0 exact duplicate prompts
- 0 near-duplicate prompts
- 83 active syllabus codes represented
- 3–7 runtime questions per point, average 3.40
- all nine playable question types represented

## AA + AI integration follow-up — 24 July 2026

- 516 runtime questions: 282 AA and 234 AI
- 531 total records audited including AA and AI import samples
- 161/161 course-specific syllabus points represented
- AI topic totals: 45, 30, 48, 57, and 54 questions
- 0 banned metadata prompts or syllabus-code answers
- 0 invalid course/syllabus mappings
- 0 invalid answer structures
- 0 source drift, exact duplicates, or near-duplicate prompts
- every point has at least three questions, all three difficulties, two types, and two styles
