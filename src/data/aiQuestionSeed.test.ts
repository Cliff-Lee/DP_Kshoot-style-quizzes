import { describe, expect, it } from 'vitest'
import { aiQuestionSeed } from './aiQuestionSeed'
import { aiSyllabusPoints } from './aiSyllabus'
import type { CalculatorMode, Difficulty, QuestionStyle } from '../types'

describe('IB AI question coverage seed',()=>{
  it('provides three genuine, varied questions for every AI syllabus point',()=>{
    for(const point of aiSyllabusPoints){
      const questions=aiQuestionSeed.filter(question=>question.syllabusPointId===point.id)
      expect(questions.length,point.code).toBeGreaterThanOrEqual(3)
      expect(new Set(questions.map(question=>question.difficulty)),`${point.code} difficulties`).toEqual(new Set<Difficulty>(['foundation','standard','extension']))
      expect(new Set(questions.map(question=>question.type)).size,`${point.code} type variety`).toBeGreaterThanOrEqual(2)
      expect(new Set(questions.map(question=>question.questionStyle)).size,`${point.code} style variety`).toBeGreaterThanOrEqual(2)
    }
  })

  it('contains valid metadata and no syllabus-description tasks',()=>{
    const styles=new Set<QuestionStyle>(['recall','procedural','conceptual','misconception','application','exam_style'])
    const calculators=new Set<CalculatorMode>(['allowed','not_allowed','neutral'])
    const banned=/syllabus point|correct syllabus code|mapped to (?:the )?syllabus|should be tagged|describe (?:sl|ahl)|which topic covers|what is included in/i
    for(const question of aiQuestionSeed){
      expect(styles.has(question.questionStyle!)).toBe(true)
      expect(calculators.has(question.calculator!)).toBe(true)
      expect(question.estimatedTimeSeconds).toBeGreaterThanOrEqual(10)
      expect(question.marksEstimate).toBeGreaterThanOrEqual(1)
      expect(question.prompt,question.id).not.toMatch(banned)
      expect(question.explanation.trim().length,question.id).toBeGreaterThan(10)
    }
  })
})
