# IB AA and AI question seed coverage

The local question bank is assembled from reviewed, point-specific templates under `scripts/question-bank/` and `scripts/question-bank-ai/`. `npm run questions:generate` deterministically writes both generated JSON banks and matching Supabase migrations. Runtime mapping resolves every code together with its course family to the correct relational syllabus ID.

## Coverage model

- 83 AA and 78 AI syllabus points
- at least 3 genuine mathematics questions per point
- foundation, standard, and extension difficulty on every point
- at least 2 question types and 2 styles per point
- 269 generated AA questions
- 234 generated AI questions
- 516 questions in a fresh demo workspace after retaining 13 existing AA examples

AA has deeper generated sets for representative points across all topics. AI provides exactly three varied items for every point, including modelling, financial mathematics, Voronoi diagrams, Spearman correlation, hypothesis testing, matrices, eigenvectors, graph theory, Markov chains, Euler’s method, phase portraits, and second-order differential equations. The combined bank includes all playable types: `multiple_choice`, `numeric_answer`, `short_answer`, `true_false`, `multi_select`, `matching`, `ordering`, `drag_drop`, and `fill_blank`.

## Supabase

Migration `202607220005_question_metadata_and_coverage.sql` adds metadata columns. Generated migration `202607230001_replace_metadata_questions.sql` refreshes AA, while `202607230002_add_ai_courses_and_questions.sql` adds the canonical four-course model, AI syllabus, and AI bank.

## Verification

```bash
npm run questions:generate
npm run questions:audit
npm test
```

The audit checks both canonical course envelopes, all 161 authoritative course/point pairs, generator/source synchronization, required metadata, answer shapes, banned phrases, syllabus-code answers, per-point coverage, all three difficulties, type/style variety, and exact and near duplicates.
