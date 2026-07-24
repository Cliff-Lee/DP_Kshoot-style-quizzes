import { describe, expect, it } from 'vitest'
import { aaQuestionSeed } from '../data/aaQuestionSeed'
import { aiQuestionSeed } from '../data/aiQuestionSeed'
import { COURSE_IDS, courses } from '../data/courses'
import { syllabusForCourse } from '../data/syllabus'
import { filterQuestionBank, questionsForCourse, quickBuildPool, reconcileSelectedPointIds } from './courseQuestionBank'

const bank=[...aaQuestionSeed,...aiQuestionSeed]

describe('course-aware question bank',()=>{
  it('publishes all four teacher course choices',()=>{
    expect(courses.map(course=>course.shortName)).toEqual(['AA SL','AA HL','AI SL','AI HL'])
  })

  it('gives HL the same-family SL core plus AHL points',()=>{
    const aiSl=syllabusForCourse(COURSE_IDS.aiSl)
    const aiHl=syllabusForCourse(COURSE_IDS.aiHl)
    expect(aiSl.every(point=>point.level==='SL')).toBe(true)
    expect(aiHl.some(point=>point.level==='SL')).toBe(true)
    expect(aiHl.some(point=>point.level==='AHL')).toBe(true)
    expect(aiHl.length).toBeGreaterThan(aiSl.length)
  })

  it('reconciles selected points when the course changes',()=>{
    const aaPoint=syllabusForCourse(COURSE_IDS.aaSl)[0]
    const aiPoint=syllabusForCourse(COURSE_IDS.aiSl)[0]
    expect(reconcileSelectedPointIds([aaPoint.id,aiPoint.id],COURSE_IDS.aiSl)).toEqual([aiPoint.id])
  })

  it('quick build and manual filters never mix AA and AI',()=>{
    const point=syllabusForCourse(COURSE_IDS.aiSl).find(item=>item.code==='SL 2.5')!
    const quick=quickBuildPool(bank,{courseId:COURSE_IDS.aiSl,selectedPointIds:[point.id],selectedTypes:['multiple_choice','numeric_answer','short_answer','multi_select','true_false','matching','ordering','drag_drop','fill_blank'],difficulty:'mixed',calculator:'mixed'})
    expect(quick.length).toBeGreaterThan(0)
    expect(quick.every(question=>question.courseId===COURSE_IDS.aiSl)).toBe(true)
    const manual=filterQuestionBank(bank,{courseId:COURSE_IDS.aaSl,topic:2,type:'all',difficulty:'all',calculator:'all'})
    expect(manual.length).toBeGreaterThan(0)
    expect(manual.every(question=>question.courseId===COURSE_IDS.aaSl)).toBe(true)
    expect(questionsForCourse(bank,COURSE_IDS.aiSl).every(question=>question.id.startsWith('ai-'))).toBe(true)
  })
})
