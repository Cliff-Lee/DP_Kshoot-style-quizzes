# MathQuiz Import Format v1.1

Version 1.1 adds structured, playable question types while remaining additive to `math_quiz_import_v1`. The validator accepts both format values. Imported questions are stored as private drafts and link to `syllabus_points.id` after `syllabusCode` is resolved.

## Document envelope

```json
{
  "format": "math_quiz_import_v1.1",
  "courseFamily": "applications_interpretation",
  "courseLevel": "SL",
  "course": "IB Mathematics: Applications and Interpretation SL",
  "source": "chatgpt",
  "questions": []
}
```

`courseFamily` is `analysis_approaches` or `applications_interpretation`; `courseLevel` is `SL` or `HL`; and `course` must be the matching canonical display name. Syllabus codes are resolved by `(courseFamily, syllabusCode)`, never by code alone. HL envelopes may use the same family’s SL core and AHL points; SL envelopes reject AHL codes.

Every v1.1 question requires `type`, `syllabusCode`, `difficulty`, `questionStyle`, `calculator`, `estimatedTimeSeconds`, `marksEstimate`, `prompt`, and `explanation`. `tags` is an optional string array. The default multiple-choice size is four; a teacher can choose three or five before validation.

## Coverage metadata

| Field | Allowed value |
| --- | --- |
| `difficulty` | `foundation`, `standard`, or `extension` |
| `questionStyle` | `recall`, `procedural`, `conceptual`, `misconception`, `application`, or `exam_style` |
| `calculator` | `allowed`, `not_allowed`, or `neutral` |
| `estimatedTimeSeconds` | integer from 10 to 900 |
| `marksEstimate` | integer from 1 to 20 |

The validator treats these fields as required for v1.1. They are optional for legacy v1 documents; missing fields produce upgrade warnings and receive safe defaults when imported.

## Type-specific fields

| Type | Required answer shape |
| --- | --- |
| `multiple_choice` | `choices: string[]`, `answer: string` matching one choice |
| `numeric_answer` | numeric `answer`; optional non-negative `tolerance` |
| `short_answer` | `answer` or non-empty `acceptedAnswers` |
| `multi_select` | `choices: string[]`, `answers: string[]` containing at least two exact choices |
| `true_false` | boolean `answer` |
| `matching` | `pairs: [{ "left": string, "right": string }]` with unique values |
| `ordering` | unique string `items` and `correctOrder` arrays containing the same values |
| `drag_drop` | string `zones` and `items: [{ "text": string, "correctZone": string }]` |
| `fill_blank` | `answer` or `acceptedAnswers`; use `___` in the prompt |

See the [AA sample](../examples/math-quiz-import-v1.1.sample.json) and [AI sample](../examples/math-quiz-import-v1.1.ai.sample.json). `short_answer` is also demonstrated in the backward-compatible v1 sample. Exact duplicate prompts are warnings and require teacher confirmation; structural or syllabus errors block the affected row, while document-level course errors block saving the batch.
