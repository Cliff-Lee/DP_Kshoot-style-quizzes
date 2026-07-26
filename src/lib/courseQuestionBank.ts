import { courseIdsInScope } from '../data/courses'
import { syllabusById, syllabusForCourse } from '../data/syllabus'
import type { CalculatorMode, Difficulty, Question, QuestionType } from '../types'

export function mergeQuestionBankRecords(inputQuestions:Question[],bundledQuestions:Question[],includeBundledQuestions:boolean){
  if(!includeBundledQuestions)return [...inputQuestions]
  const bundledIds=new Set(bundledQuestions.map(question=>question.id))
  return [...bundledQuestions,...inputQuestions.filter(question=>!bundledIds.has(question.id))]
}

export function questionBelongsToCourse(question:Question,courseId:string){
  return courseIdsInScope(courseId).includes(question.courseId)
}

export function questionsForCourse(questions:Question[],courseId:string){
  return questions.filter(question=>questionBelongsToCourse(question,courseId))
}

export function reconcileSelectedPointIds(selectedPointIds:string[],courseId:string){
  const visible=new Set(syllabusForCourse(courseId).map(point=>point.id))
  return selectedPointIds.filter(id=>visible.has(id))
}

export function questionCountsByPoint(questions:Question[],courseId:string){
  const counts=new Map<string,number>()
  for(const question of questionsForCourse(questions,courseId)){
    counts.set(question.syllabusPointId,(counts.get(question.syllabusPointId)??0)+1)
  }
  return counts
}

export interface QuestionFilter {
  courseId:string
  topic?:number|'all'
  syllabusPointId?:string|'all'
  difficulty?:Difficulty|'all'
  calculator?:CalculatorMode|'all'
  type?:QuestionType|'all'
  search?:string
}

export function filterQuestionBank(questions:Question[],filter:QuestionFilter){
  const search=(filter.search??'').trim().toLowerCase()
  return questionsForCourse(questions,filter.courseId).filter(question=>{
    const point=syllabusById.get(question.syllabusPointId)
    return (!search||`${question.prompt} ${question.tags.join(' ')} ${point?.code??''} ${point?.title??''}`.toLowerCase().includes(search))
      &&(!filter.topic||filter.topic==='all'||point?.topicNumber===filter.topic)
      &&(!filter.syllabusPointId||filter.syllabusPointId==='all'||question.syllabusPointId===filter.syllabusPointId)
      &&(!filter.difficulty||filter.difficulty==='all'||question.difficulty===filter.difficulty)
      &&(!filter.calculator||filter.calculator==='all'||(question.calculator??'neutral')===filter.calculator)
      &&(!filter.type||filter.type==='all'||question.type===filter.type)
  })
}

export function quickBuildPool(questions:Question[],options:{
  courseId:string
  selectedPointIds:string[]
  selectedTypes:QuestionType[]
  difficulty:Difficulty|'mixed'
  calculator:CalculatorMode|'mixed'
}){
  const selectedPoints=new Set(reconcileSelectedPointIds(options.selectedPointIds,options.courseId))
  return questionsForCourse(questions,options.courseId).filter(question=>
    selectedPoints.has(question.syllabusPointId)
    &&options.selectedTypes.includes(question.type)
    &&(options.difficulty==='mixed'||question.difficulty===options.difficulty)
    &&(options.calculator==='mixed'||(question.calculator??'neutral')===options.calculator)
  )
}
