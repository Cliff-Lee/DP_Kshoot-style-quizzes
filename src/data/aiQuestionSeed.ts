import type { CalculatorMode, Difficulty, Question, QuestionOption, QuestionStyle, QuestionType } from '../types'
import generated from './aiQuestionSeed.generated.json'
import { findSyllabusPoint } from './syllabus'

interface SeedQuestion {
  seedId:string
  syllabusCode:string
  type:QuestionType
  difficulty:Difficulty
  questionStyle:QuestionStyle
  calculator:CalculatorMode
  estimatedTimeSeconds:number
  marksEstimate:number
  prompt:string
  explanation:string
  tags:string[]
  choices?:string[]
  answer?:string|number|boolean
  answers?:string[]
  acceptedAnswers?:string[]
  tolerance?:number
  pairs?:Array<{left:string;right:string}>
  items?:string[]|Array<{text:string;correctZone:string}>
  correctOrder?:string[]
  zones?:string[]
}

const CREATED_AT='2026-07-23T00:00:00.000Z'
const rawQuestions=generated.questions as SeedQuestion[]

function answerData(question:SeedQuestion):Record<string,unknown>{
  if(question.type==='multiple_choice'||question.type==='true_false')return {answer:question.answer}
  if(question.type==='numeric_answer')return {answer:question.answer,tolerance:question.tolerance??0}
  if(question.type==='short_answer'||question.type==='fill_blank')return {answer:question.answer,acceptedAnswers:question.acceptedAnswers??[]}
  if(question.type==='multi_select')return {answers:question.answers??[]}
  if(question.type==='matching')return {pairs:question.pairs??[]}
  if(question.type==='ordering')return {items:question.items??[],correctOrder:question.correctOrder??[]}
  return {zones:question.zones??[],items:question.items??[]}
}

function options(question:SeedQuestion):QuestionOption[]|undefined{
  const choices=question.type==='true_false'?['True','False']:question.choices
  if(!choices)return undefined
  const correct=question.type==='true_false'?[question.answer?'True':'False']:question.type==='multi_select'?question.answers??[]:[String(question.answer)]
  return choices.map((text,index)=>({id:`${question.seedId}-option-${index+1}`,label:String.fromCharCode(65+index),text,isCorrect:correct.includes(text),sortOrder:index}))
}

export const aiQuestionSeed:Question[]=rawQuestions.map(question=>{
  const point=findSyllabusPoint('applications_interpretation',question.syllabusCode)
  if(!point)throw new Error(`Unknown generated AI syllabus code: ${question.syllabusCode}`)
  return {
    id:question.seedId,
    createdBy:'platform',
    visibility:'public',
    status:'approved',
    courseId:point.courseId,
    syllabusPointId:point.id,
    type:question.type,
    prompt:question.prompt,
    answerData:answerData(question),
    explanation:question.explanation,
    difficulty:question.difficulty,
    questionStyle:question.questionStyle,
    calculator:question.calculator,
    estimatedTimeSeconds:question.estimatedTimeSeconds,
    marksEstimate:question.marksEstimate,
    tags:['ib-ai',point.title.toLowerCase(),...question.tags],
    source:'platform_seed',
    options:options(question),
    createdAt:CREATED_AT,
    updatedAt:CREATED_AT,
  }
})
