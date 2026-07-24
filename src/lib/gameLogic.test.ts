import { describe, expect, it } from 'vitest'
import { calculateScore, checkAnswer } from './gameLogic'
import type { Question, QuestionType } from '../types'

const makeQuestion = (type: QuestionType, answerData: Record<string, unknown>): Question => ({
  id:'q', createdBy:'t', visibility:'private', status:'draft', courseId:'20000000-0000-0000-0000-000000000001', syllabusPointId:'sl-2-5', type, prompt:'Prompt', answerData,
  explanation:'Explanation', difficulty:'standard', tags:[], source:'manual', createdAt:'2026-01-01', updatedAt:'2026-01-01',
})

describe('answer checking', () => {
  it.each([
    ['multiple_choice', { answer:'11' }, '11'],
    ['numeric_answer', { answer:2, tolerance:.01 }, '2.005'],
    ['short_answer', { answer:'12x² − 5', acceptedAnswers:['12x^2 - 5'] }, ' 12x^2 - 5 '],
    ['multi_select', { answers:['Increasing','Continuous'] }, ['Continuous','Increasing']],
    ['true_false', { answer:true }, true],
    ['matching', { pairs:[{left:'sin x',right:'cos x'},{left:'x²',right:'2x'}] }, {'sin x':'cos x','x²':'2x'}],
    ['ordering', { correctOrder:['1','2','3'] }, ['1','2','3']],
    ['drag_drop', { items:[{text:'f(x)+4',correctZone:'Vertical'}] }, {'f(x)+4':'Vertical'}],
    ['fill_blank', { answer:'vertex', acceptedAnswers:['turning point'] }, 'Turning Point'],
  ] as Array<[QuestionType, Record<string, unknown>, unknown]>)('checks %s', (type, data, answer) => {
    expect(checkAnswer(makeQuestion(type, data), answer)).toBe(true)
  })

  it('rejects an incomplete multi-select answer', () => expect(checkAnswer(makeQuestion('multi_select', {answers:['A','B']}), ['A'])).toBe(false))
})

describe('scoring', () => {
  it('explains speed, streak, and double points', () => {
    const score = calculateScore({ correct:true, responseTimeMs:5000, timeLimitSeconds:20, pointsMode:'speed_bonus', currentStreak:2, streakBonusesEnabled:true, powerup:'double_points' })
    expect(score).toEqual({ basePoints:600, speedBonus:300, streakBonus:100, multiplier:2, total:2000, effectiveResponseTimeMs:5000, shieldUsed:false })
  })

  it('never awards negative points and records shield use', () => {
    const score = calculateScore({ correct:false, responseTimeMs:90000, timeLimitSeconds:20, pointsMode:'standard', currentStreak:4, streakBonusesEnabled:true, powerup:'shield' })
    expect(score.total).toBe(0)
    expect(score.shieldUsed).toBe(true)
  })
})
