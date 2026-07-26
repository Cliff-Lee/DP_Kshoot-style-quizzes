import { describe,expect,it } from 'vitest'
import type { Question } from '../types'
import { buildQuizQuestionPersistenceDiagnostic,orderedQuizLinksMatch,questionsToUploadBeforeQuiz } from './cloudRepository'

describe('quiz question persistence',()=>{
  it('reports selected, found, missing, and source data in selected order',()=>{
    const diagnostic=buildQuizQuestionPersistenceDiagnostic(
      'quiz-1',
      [
        {id:'seed-aa',source:'platform_seed'},
        {id:'imported-1',source:'chatgpt_import'},
        {id:'manual-1',source:'manual'},
      ],
      ['manual-1','seed-aa','imported-1'],
      [
        {id:'seed-aa',course_id:'aa-sl',source:'platform_seed'},
        {id:'manual-1',course_id:'aa-sl',source:'manual'},
      ],
    )

    expect(diagnostic).toEqual({
      quizId:'quiz-1',
      selectedQuestionIds:['manual-1','seed-aa','imported-1'],
      questionsFoundInSupabase:['manual-1','seed-aa'],
      missingQuestionIds:['imported-1'],
      questionSources:[
        {id:'manual-1',source:'manual',foundInSupabase:true},
        {id:'seed-aa',source:'platform_seed',foundInSupabase:true},
        {id:'imported-1',source:'chatgpt_import',foundInSupabase:false},
      ],
    })
  })

  it('requires contiguous sort order as well as matching question IDs',()=>{
    expect(orderedQuizLinksMatch([
      {question_id:'q-1',sort_order:0},
      {question_id:'q-2',sort_order:1},
    ],['q-1','q-2'])).toBe(true)
    expect(orderedQuizLinksMatch([
      {question_id:'q-1',sort_order:4},
      {question_id:'q-2',sort_order:8},
    ],['q-1','q-2'])).toBe(false)
    expect(orderedQuizLinksMatch([
      {question_id:'q-2',sort_order:0},
      {question_id:'q-1',sort_order:1},
    ],['q-1','q-2'])).toBe(false)
  })

  it('uploads missing teacher and imported questions but requires platform seeds to come from migrations',()=>{
    const base={createdBy:'teacher-1',visibility:'private',status:'draft',courseId:'aa-sl',syllabusPointId:'point-1',type:'numeric_answer',prompt:'Prompt',answerData:{answer:1},explanation:'Explanation',difficulty:'standard',tags:[],createdAt:'2026-07-26T00:00:00.000Z',updatedAt:'2026-07-26T00:00:00.000Z'} satisfies Omit<Question,'id'|'source'>
    const questions:Question[]=[
      {...base,id:'manual-1',source:'manual'},
      {...base,id:'imported-1',source:'chatgpt_import'},
      {...base,id:'seed-aa',source:'platform_seed',createdBy:'platform',visibility:'public',status:'approved'},
    ]
    const diagnostic=buildQuizQuestionPersistenceDiagnostic('quiz-1',questions,questions.map(question=>question.id),[])
    expect(questionsToUploadBeforeQuiz(diagnostic,questions).map(question=>question.id)).toEqual(['manual-1','imported-1'])
  })
})
