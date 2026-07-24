import { describe, expect, it } from 'vitest'
import { aaQuestionSeed, representativeCoverageCodes } from './aaQuestionSeed'
import { aaSyllabusPoints, syllabusByCode } from './syllabus'
import type { CalculatorMode, Difficulty, QuestionStyle, QuestionType } from '../types'

describe('IB AA question coverage seed',()=>{
  it('provides at least three questions and every difficulty for all syllabus points',()=>{
    for(const point of aaSyllabusPoints){
      const questions=aaQuestionSeed.filter(question=>question.syllabusPointId===point.id)
      expect(questions.length,point.code).toBeGreaterThanOrEqual(3)
      expect(new Set(questions.map(question=>question.difficulty)),point.code).toEqual(new Set<Difficulty>(['foundation','standard','extension']))
      expect(new Set(questions.map(question=>question.type)).size,`${point.code} type variety`).toBeGreaterThanOrEqual(2)
      expect(new Set(questions.map(question=>question.questionStyle)).size,`${point.code} style variety`).toBeGreaterThanOrEqual(2)
    }
  })

  it('provides complete representative sets for all five topics',()=>{
    for(const code of representativeCoverageCodes){
      const point=syllabusByCode.get(code)!
      expect(aaQuestionSeed.filter(question=>question.syllabusPointId===point.id).length,code).toBeGreaterThanOrEqual(5)
    }
  })

  it('covers every playable question type',()=>{
    const expected:QuestionType[]=['multiple_choice','numeric_answer','short_answer','true_false','multi_select','matching','ordering','drag_drop','fill_blank']
    expect(new Set(aaQuestionSeed.map(question=>question.type))).toEqual(new Set(expected))
  })

  it('includes valid metadata on every question',()=>{
    const styles=new Set<QuestionStyle>(['recall','procedural','conceptual','misconception','application','exam_style'])
    const calculators=new Set<CalculatorMode>(['allowed','not_allowed','neutral'])
    for(const question of aaQuestionSeed){
      expect(styles.has(question.questionStyle!)).toBe(true)
      expect(calculators.has(question.calculator!)).toBe(true)
      expect(question.estimatedTimeSeconds).toBeGreaterThanOrEqual(10)
      expect(question.marksEstimate).toBeGreaterThanOrEqual(1)
    }
  })

  it('contains no syllabus-description prompts or syllabus-code answers',()=>{
    const banned=/mapped to syllabus|syllabus point|correct syllabus code|should be tagged|work focused on|accurately describe (?:sl|ahl)|true or false:\s*(?:sl|ahl).*includes/i
    const codeOnly=/^(?:SL|AHL)\s+[1-5]\.\d+$/i
    for(const question of aaQuestionSeed){
      expect(question.prompt,question.id).not.toMatch(banned)
      expect(String(question.answerData.answer??''),question.id).not.toMatch(codeOnly)
    }
  })
})
