import { findSyllabusPoint } from '../data/syllabus'
import { getCourseFor } from '../data/courses'
import type { CalculatorMode, CourseFamily, CourseLevel, Difficulty, Question, QuestionOption, QuestionStyle, QuestionType } from '../types'

export type MathQuizImportFormat = 'math_quiz_import_v1' | 'math_quiz_import_v1.1'

export interface ImportQuestionInput {
  type?: QuestionType
  syllabusCode?: string
  difficulty?: Difficulty
  questionStyle?: QuestionStyle
  calculator?: CalculatorMode
  estimatedTimeSeconds?: number
  marksEstimate?: number
  prompt?: string
  choices?: string[]
  answer?: string | number | boolean
  answers?: string[]
  acceptedAnswers?: string[]
  tolerance?: number
  explanation?: string
  tags?: string[]
  zones?: string[]
  items?: Array<string | { text?: string; correctZone?: string }>
  pairs?: Array<{ left?: string; right?: string }>
  correctOrder?: string[]
  [key: string]: unknown
}

export interface ValidationRow { index: number; question: ImportQuestionInput; errors: string[]; warnings: string[]; valid: boolean; duplicate: boolean }
export interface ValidationResult { document: Record<string, unknown> | null; format?: MathQuizImportFormat; courseId?:string; courseFamily?:CourseFamily; courseLevel?:CourseLevel; rows: ValidationRow[]; globalErrors: string[]; validCount: number; invalidCount: number }
export interface ImportValidationOptions { multipleChoiceChoiceCount?: number }

const supportedTypes = new Set<QuestionType>(['multiple_choice','numeric_answer','short_answer','multi_select','true_false','matching','ordering','drag_drop','fill_blank','graph_or_image_prompt'])
const difficulties = new Set<Difficulty>(['foundation','standard','extension'])
export const questionStyles = new Set<QuestionStyle>(['recall','procedural','conceptual','misconception','application','exam_style'])
export const calculatorModes = new Set<CalculatorMode>(['allowed','not_allowed','neutral'])
const formats = new Set<MathQuizImportFormat>(['math_quiz_import_v1','math_quiz_import_v1.1'])
const bannedMetadataPromptPatterns = [
  /\bsyllabus point\b/i,
  /\bcorrect syllabus code\b/i,
  /\bmapped to\s+(?:the\s+)?(?:syllabus|syllabus point|code|topic)\b/i,
  /\bshould be tagged\b/i,
  /\bwork focused on\b/i,
  /\bmathematical focus\b/i,
  /\bdescribe\s+(?:sl|ahl)\b/i,
  /\bwhich topic covers\b/i,
  /\bwhat is included in\b/i,
  /\bselect both statements that accurately describe\b/i,
  /\btrue or false:\s*(?:sl|ahl)\b/i,
]
const syllabusCodeOnly = /^(?:SL|AHL)\s+[1-5]\.\d+$/i

export function validateImport(raw: string, existingPrompts: string[] = [], options: ImportValidationOptions = {}): ValidationResult {
  const result: ValidationResult = { document: null, rows: [], globalErrors: [], validCount: 0, invalidCount: 0 }
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch (error) {
    result.globalErrors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unable to parse input'}`)
    return result
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    result.globalErrors.push('The import must be a JSON object.'); return result
  }
  const document = parsed as Record<string, unknown>
  result.document = document
  if (!formats.has(document.format as MathQuizImportFormat)) result.globalErrors.push('format must equal "math_quiz_import_v1" or "math_quiz_import_v1.1".')
  else result.format = document.format as MathQuizImportFormat
  const courseIdentity=resolveCourseIdentity(document,result.format,result.globalErrors)
  if(courseIdentity){
    result.courseId=courseIdentity.id
    result.courseFamily=courseIdentity.courseFamily
    result.courseLevel=courseIdentity.level
  }
  if (!Array.isArray(document.questions) || document.questions.length === 0) {
    result.globalErrors.push('questions must be a non-empty array.'); return result
  }
  const existing = new Set(existingPrompts.map(prompt => normalizePrompt(prompt)))
  const choiceCount = Math.max(2, options.multipleChoiceChoiceCount ?? 4)
  result.rows = document.questions.map((candidate, index) => validateQuestion(candidate, index, existing, choiceCount, result.format,result.courseFamily,result.courseLevel))
  result.validCount = result.rows.filter(row => row.valid).length
  result.invalidCount = result.rows.length - result.validCount
  return result
}

function resolveCourseIdentity(document:Record<string,unknown>,format:MathQuizImportFormat|undefined,errors:string[]){
  const familyValues=new Set<CourseFamily>(['analysis_approaches','applications_interpretation'])
  const levelValues=new Set<CourseLevel>(['SL','HL'])
  let family=document.courseFamily as CourseFamily|undefined
  let level=document.courseLevel as CourseLevel|undefined
  const courseName=typeof document.course==='string'?document.course:''
  if(format==='math_quiz_import_v1.1'){
    if(!family||!familyValues.has(family))errors.push('courseFamily must be analysis_approaches or applications_interpretation in v1.1.')
    if(!level||!levelValues.has(level))errors.push('courseLevel must be SL or HL in v1.1.')
  }else{
    if(!family)family=courseName.includes('Applications and Interpretation')?'applications_interpretation':courseName.includes('Analysis and Approaches')?'analysis_approaches':undefined
    if(!level)level=/\bHL$/.test(courseName)?'HL':'SL'
  }
  if(!family||!level)return undefined
  const course=getCourseFor(family,level)
  if(courseName!==course.displayName)errors.push(`course must exactly equal "${course.displayName}".`)
  return course
}

function validateQuestion(candidate: unknown, index: number, existing: Set<string>, choiceCount: number, format?: MathQuizImportFormat,courseFamily?:CourseFamily,courseLevel?:CourseLevel): ValidationRow {
  const errors: string[] = []; const warnings: string[] = []
  const question = candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate as ImportQuestionInput : {}
  if (!question.type || !supportedTypes.has(question.type)) errors.push('Choose a recognized question type.')
  const point=question.syllabusCode&&courseFamily?findSyllabusPoint(courseFamily,question.syllabusCode):undefined
  if (!point) errors.push('Use a syllabusCode that exists for the selected course.')
  else if(courseLevel==='SL'&&point.level==='AHL')errors.push('An SL import cannot contain an AHL syllabusCode.')
  if (!question.difficulty || !difficulties.has(question.difficulty)) errors.push('difficulty must be foundation, standard, or extension.')
  validateMetadata(question,errors,warnings,format)
  if (typeof question.prompt !== 'string' || !question.prompt.trim()) errors.push('prompt is required.')
  else if (bannedMetadataPromptPatterns.some(pattern => pattern.test(question.prompt!))) errors.push('Ask a genuine mathematics question; syllabus codes are metadata and must not be the student task.')
  if (typeof question.explanation !== 'string' || !question.explanation.trim()) errors.push('explanation is required.')
  if (question.tags !== undefined && (!Array.isArray(question.tags) || question.tags.some(tag => typeof tag !== 'string'))) errors.push('tags must be an array of strings.')
  const submittedAnswers = [question.answer,...(question.answers??[]),...(question.acceptedAnswers??[])].filter(value => value !== undefined)
  if (submittedAnswers.some(value => syllabusCodeOnly.test(String(value).trim()))) errors.push('Answers must contain mathematics, not a syllabus code.')

  if (question.type === 'multiple_choice') {
    validateChoices(question, errors, choiceCount)
    if (question.answer === undefined) errors.push('answer is required.')
    else if (Array.isArray(question.choices) && !question.choices.includes(String(question.answer))) errors.push('answer must exactly match one choice.')
  }
  if (question.type === 'multi_select') {
    validateChoices(question, errors, choiceCount)
    if (!Array.isArray(question.answers) || question.answers.length < 2) errors.push('multi_select requires an answers array with at least two correct choices.')
    else if (Array.isArray(question.choices) && question.answers.some(answer => !question.choices!.includes(answer))) errors.push('Every multi_select answer must exactly match a choice.')
    else if (new Set(question.answers).size !== question.answers.length) errors.push('multi_select answers must be unique.')
  }
  if (question.type === 'true_false' && typeof question.answer !== 'boolean') errors.push('true_false requires a boolean answer: true or false.')
  if (question.type === 'numeric_answer') {
    if (typeof question.answer !== 'number' && !(typeof question.answer === 'string' && question.answer.trim() !== '' && Number.isFinite(Number(question.answer)))) errors.push('numeric_answer requires a numeric answer.')
    if (question.tolerance !== undefined && (typeof question.tolerance !== 'number' || question.tolerance < 0)) errors.push('tolerance must be zero or a positive number.')
  }
  if ((question.type === 'short_answer' || question.type === 'fill_blank') && question.answer === undefined && (!Array.isArray(question.acceptedAnswers) || question.acceptedAnswers.length === 0)) errors.push(`${question.type} requires answer or acceptedAnswers.`)
  if (question.type === 'fill_blank' && typeof question.prompt === 'string' && !question.prompt.includes('___')) warnings.push('Use ___ in the prompt to make the blank clear to students.')
  if (question.type === 'matching') {
    const pairs = Array.isArray(question.pairs) ? question.pairs : []
    if (pairs.length < 2) errors.push('matching requires at least two pairs.')
    pairs.forEach((pair, pairIndex) => { if (!pair?.left?.trim() || !pair?.right?.trim()) errors.push(`Pair ${pairIndex + 1} needs left and right text.`) })
    if (new Set(pairs.map(pair => pair.left)).size !== pairs.length || new Set(pairs.map(pair => pair.right)).size !== pairs.length) errors.push('matching pair values must be unique.')
  }
  if (question.type === 'ordering') {
    const items = Array.isArray(question.items) && question.items.every(item => typeof item === 'string') ? question.items as string[] : []
    const order = Array.isArray(question.correctOrder) ? question.correctOrder : items
    if (items.length < 3) errors.push('ordering requires at least three string items.')
    if (order.length !== items.length || order.some(item => !items.includes(item))) errors.push('correctOrder must contain every item exactly once.')
    if (new Set(items).size !== items.length || new Set(order).size !== order.length) errors.push('ordering items must be unique.')
  }
  if (question.type === 'drag_drop') {
    const zones = Array.isArray(question.zones) ? question.zones : []
    const items = Array.isArray(question.items) ? question.items.filter(item => typeof item === 'object') as Array<{ text?: string; correctZone?: string }> : []
    if (zones.length < 2 || zones.some(zone => typeof zone !== 'string' || !zone.trim())) errors.push('drag_drop requires at least two named zones.')
    if (items.length === 0) errors.push('drag_drop requires at least one item.')
    items.forEach((item, itemIndex) => {
      if (!item?.text?.trim() || !item.correctZone?.trim()) errors.push(`Item ${itemIndex + 1} needs text and correctZone.`)
      else if (!zones.includes(item.correctZone)) errors.push(`Item ${itemIndex + 1} refers to an unknown zone.`)
    })
  }
  if (question.type === 'graph_or_image_prompt' && question.answer === undefined) errors.push('graph_or_image_prompt requires an answer.')

  const duplicate = typeof question.prompt === 'string' && existing.has(normalizePrompt(question.prompt))
  if (duplicate) warnings.push('Exact prompt already exists in your bank; confirmation is required.')
  if (format === 'math_quiz_import_v1' && question.type && ['multi_select','true_false','matching','ordering','fill_blank'].includes(question.type)) warnings.push('This expanded type is documented in MathQuiz Import Format v1.1; consider updating the format value.')
  return { index, question, errors, warnings, valid: errors.length === 0, duplicate }
}

function validateMetadata(question:ImportQuestionInput,errors:string[],warnings:string[],format?:MathQuizImportFormat){
  const required=format==='math_quiz_import_v1.1'
  if(!question.questionStyle){if(required)errors.push('questionStyle is required in v1.1.');else warnings.push('Add questionStyle when upgrading this item to v1.1.')}else if(!questionStyles.has(question.questionStyle))errors.push('questionStyle must be recall, procedural, conceptual, misconception, application, or exam_style.')
  if(!question.calculator){if(required)errors.push('calculator is required in v1.1.');else warnings.push('Add calculator when upgrading this item to v1.1.')}else if(!calculatorModes.has(question.calculator))errors.push('calculator must be allowed, not_allowed, or neutral.')
  if(question.estimatedTimeSeconds===undefined){if(required)errors.push('estimatedTimeSeconds is required in v1.1.')}else if(!Number.isInteger(question.estimatedTimeSeconds)||question.estimatedTimeSeconds<10||question.estimatedTimeSeconds>900)errors.push('estimatedTimeSeconds must be an integer from 10 to 900.')
  if(question.marksEstimate===undefined){if(required)errors.push('marksEstimate is required in v1.1.')}else if(!Number.isInteger(question.marksEstimate)||question.marksEstimate<1||question.marksEstimate>20)errors.push('marksEstimate must be an integer from 1 to 20.')
}

function validateChoices(question: ImportQuestionInput, errors: string[], choiceCount: number) {
  if (!Array.isArray(question.choices) || question.choices.length !== choiceCount || question.choices.some(choice => typeof choice !== 'string' || !choice.trim())) errors.push(`${question.type} requires exactly ${choiceCount} non-empty choices.`)
  if (Array.isArray(question.choices) && new Set(question.choices).size !== question.choices.length) errors.push('choices must be unique.')
}

export function importQuestionToRecord(input: ImportQuestionInput, createdBy: string,courseFamily:CourseFamily='analysis_approaches'): Question {
  const point = findSyllabusPoint(courseFamily,input.syllabusCode!)!
  const now = new Date().toISOString()
  const answerData: Record<string, unknown> = { answer: input.answer }
  if (input.answers) answerData.answers = input.answers
  if (input.acceptedAnswers) answerData.acceptedAnswers = input.acceptedAnswers
  if (input.tolerance !== undefined) answerData.tolerance = input.tolerance
  if (input.zones) answerData.zones = input.zones
  if (input.items) answerData.items = input.items
  if (input.pairs) answerData.pairs = input.pairs
  if (input.correctOrder) answerData.correctOrder = input.correctOrder
  const choices = input.type === 'true_false' ? ['True','False'] : input.choices
  const correctAnswers = new Set(input.type === 'multi_select' ? input.answers : [String(input.answer)])
  const options: QuestionOption[] | undefined = choices?.map((text, index) => ({ id: crypto.randomUUID(), label: String.fromCharCode(65 + index), text, isCorrect: input.type === 'true_false' ? String(input.answer) === text.toLowerCase() : correctAnswers.has(text), sortOrder: index }))
  return { id: crypto.randomUUID(), createdBy, visibility: 'private', status: 'draft', courseId:point.courseId,syllabusPointId: point.id, type: input.type!, prompt: input.prompt!.trim(), answerData, explanation: input.explanation!.trim(), difficulty: input.difficulty!, questionStyle:input.questionStyle??'conceptual',calculator:input.calculator??'neutral',estimatedTimeSeconds:input.estimatedTimeSeconds??60,marksEstimate:input.marksEstimate??1,tags: input.tags ?? [], source: 'chatgpt_import', options, createdAt: now, updatedAt: now }
}

export function normalizePrompt(prompt: string) { return prompt.trim().replace(/\s+/g, ' ').toLowerCase() }
