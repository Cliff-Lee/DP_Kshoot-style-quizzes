import type { AppState, Attempt, Question } from '../types'
import { normalizeQuizSettings } from '../lib/gameLogic'
import { syllabusByCode, syllabusById } from './syllabus'
import { aaQuestionSeed } from './aaQuestionSeed'
import { aiQuestionSeed } from './aiQuestionSeed'
import { COURSE_IDS } from './courses'

const now = new Date()
const isoDaysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString()
const point = (code: string) => syllabusByCode.get(code)!.id

const seedQuestionBase: Array<Omit<Question,'courseId'>> = [
  { id:'q-composite', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 2.5'), type:'multiple_choice', prompt:'If f(x) = 2x + 3 and g(x) = x², find (f∘g)(2).', answerData:{answer:'11'}, explanation:'g(2) = 4, so f(g(2)) = f(4) = 2(4) + 3 = 11.', difficulty:'standard', tags:['composite functions','function notation'], source:'platform_seed', createdAt:isoDaysAgo(26), updatedAt:isoDaysAgo(26), options:['7','8','11','14'].map((text,i)=>({id:`qo1-${i}`,label:String.fromCharCode(65+i),text,isCorrect:text==='11',sortOrder:i})) },
  { id:'q-sequence', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 1.2'), type:'numeric_answer', prompt:'An arithmetic sequence has first term 7 and common difference 4. Find its 12th term.', answerData:{answer:51,tolerance:0}, explanation:'u₁₂ = 7 + 11(4) = 51.', difficulty:'foundation', tags:['arithmetic sequences'], source:'platform_seed', createdAt:isoDaysAgo(23), updatedAt:isoDaysAgo(23) },
  { id:'q-radians', createdBy:'platform', visibility:'public', status:'approved', syllabusPointId:point('SL 3.4'), type:'multiple_choice', prompt:'A sector has radius 6 cm and angle 1.2 radians. What is its arc length?', answerData:{answer:'7.2 cm'}, explanation:'Arc length s = rθ = 6 × 1.2 = 7.2 cm.', difficulty:'foundation', tags:['radians','arc length'], source:'platform_seed', createdAt:isoDaysAgo(52), updatedAt:isoDaysAgo(52), options:['5 cm','7.2 cm','10 cm','22.6 cm'].map((text,i)=>({id:`qo2-${i}`,label:String.fromCharCode(65+i),text,isCorrect:text==='7.2 cm',sortOrder:i})) },
  { id:'q-probability', createdBy:'platform', visibility:'public', status:'approved', syllabusPointId:point('SL 4.6'), type:'multiple_choice', prompt:'Events A and B are independent, with P(A)=0.4 and P(B)=0.3. Find P(A∩B).', answerData:{answer:'0.12'}, explanation:'For independent events, P(A∩B)=P(A)P(B)=0.4×0.3=0.12.', difficulty:'standard', tags:['independence'], source:'platform_seed', createdAt:isoDaysAgo(41), updatedAt:isoDaysAgo(41), options:['0.10','0.12','0.40','0.70'].map((text,i)=>({id:`qo3-${i}`,label:String.fromCharCode(65+i),text,isCorrect:text==='0.12',sortOrder:i})) },
  { id:'q-derivative', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 5.3'), type:'short_answer', prompt:'Differentiate f(x) = 4x³ − 5x + 2.', answerData:{answer:'12x² − 5',acceptedAnswers:['12x^2 - 5','12x² − 5','12x² - 5']}, explanation:'Apply the power rule term by term: 4(3)x² − 5 = 12x² − 5.', difficulty:'standard', tags:['power rule'], source:'platform_seed', createdAt:isoDaysAgo(18), updatedAt:isoDaysAgo(18) },
  { id:'q-normal', createdBy:'teacher-demo', visibility:'private', status:'draft', syllabusPointId:point('SL 4.9'), type:'numeric_answer', prompt:'For X ~ N(50, 8²), find the z-score when X = 66.', answerData:{answer:2,tolerance:0.01}, explanation:'z = (66 − 50) / 8 = 2.', difficulty:'foundation', tags:['normal distribution','z-score'], source:'manual', createdAt:isoDaysAgo(4), updatedAt:isoDaysAgo(4) },
  { id:'q-chain', createdBy:'teacher-demo', visibility:'school', status:'pending_review', syllabusPointId:point('SL 5.6'), type:'multiple_choice', prompt:'Find dy/dx when y = (3x + 1)⁵.', answerData:{answer:'15(3x + 1)⁴'}, explanation:'By the chain rule, 5(3x+1)⁴ × 3 = 15(3x+1)⁴.', difficulty:'standard', tags:['chain rule'], source:'manual', createdAt:isoDaysAgo(2), updatedAt:isoDaysAgo(2), options:['5(3x + 1)⁴','15(3x + 1)⁴','15(3x + 1)⁵','(3x + 1)⁴'].map((text,i)=>({id:`qo4-${i}`,label:String.fromCharCode(65+i),text,isCorrect:text==='15(3x + 1)⁴',sortOrder:i})) },
  { id:'q-multiselect', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 2.6'), type:'multi_select', prompt:'Select every property of the graph y = x².', answerData:{answers:['It has a minimum','It is symmetric about the y-axis']}, explanation:'The parabola opens upwards, has a minimum at the origin, and is symmetric about the y-axis.', difficulty:'foundation', tags:['quadratic','graph properties'], source:'platform_seed', createdAt:isoDaysAgo(8), updatedAt:isoDaysAgo(8), options:['It has a minimum','It has a maximum','It is symmetric about the y-axis','It is one-to-one'].map((text,i)=>({id:`qo5-${i}`,label:String.fromCharCode(65+i),text,isCorrect:['It has a minimum','It is symmetric about the y-axis'].includes(text),sortOrder:i})) },
  { id:'q-truefalse', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 1.1'), type:'true_false', prompt:'The number 3.7 × 10⁻⁴ is equal to 0.00037.', answerData:{answer:true}, explanation:'Moving the decimal point four places to the left gives 0.00037.', difficulty:'foundation', tags:['scientific notation','place value'], source:'platform_seed', createdAt:isoDaysAgo(7), updatedAt:isoDaysAgo(7), options:['True','False'].map((text,i)=>({id:`qo6-${i}`,label:String.fromCharCode(65+i),text,isCorrect:text==='True',sortOrder:i})) },
  { id:'q-matching', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 5.6'), type:'matching', prompt:'Match each function to its derivative.', answerData:{pairs:[{left:'x³',right:'3x²'},{left:'sin x',right:'cos x'},{left:'eˣ',right:'eˣ'}]}, explanation:'Use the power rule and the standard derivatives of sine and the exponential function.', difficulty:'standard', tags:['derivatives','standard functions'], source:'platform_seed', createdAt:isoDaysAgo(6), updatedAt:isoDaysAgo(6) },
  { id:'q-ordering', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 1.2'), type:'ordering', prompt:'Put the first four terms of uₙ = 3n − 1 in ascending order.', answerData:{items:['11','2','8','5'],correctOrder:['2','5','8','11']}, explanation:'Substitute n = 1, 2, 3, 4 to get 2, 5, 8, 11.', difficulty:'foundation', tags:['sequences'], source:'platform_seed', createdAt:isoDaysAgo(5), updatedAt:isoDaysAgo(5) },
  { id:'q-drag', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 2.11'), type:'drag_drop', prompt:'Classify each transformation of y = f(x).', answerData:{zones:['Vertical translation','Horizontal translation','Vertical stretch'],items:[{text:'f(x)+4',correctZone:'Vertical translation'},{text:'f(x−3)',correctZone:'Horizontal translation'},{text:'2f(x)',correctZone:'Vertical stretch'}]}, explanation:'Changes outside f affect y-values; changes inside f affect x-values.', difficulty:'foundation', tags:['transformations'], source:'platform_seed', createdAt:isoDaysAgo(4), updatedAt:isoDaysAgo(4) },
  { id:'q-fillblank', createdBy:'teacher-demo', visibility:'private', status:'approved', syllabusPointId:point('SL 3.4'), type:'fill_blank', prompt:'Complete the arc-length formula: s = ___.', answerData:{answer:'rθ',acceptedAnswers:['r theta','r*theta','rθ']}, explanation:'When θ is in radians, arc length is radius multiplied by the central angle: s = rθ.', difficulty:'foundation', tags:['radians','arc length'], source:'platform_seed', createdAt:isoDaysAgo(3), updatedAt:isoDaysAgo(3) },
]

const demoQuestionMetadata:Record<string,Pick<Question,'questionStyle'|'calculator'|'estimatedTimeSeconds'|'marksEstimate'>>={
  'q-composite':{questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:45,marksEstimate:2},
  'q-sequence':{questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:45,marksEstimate:2},
  'q-radians':{questionStyle:'procedural',calculator:'allowed',estimatedTimeSeconds:45,marksEstimate:2},
  'q-probability':{questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:60,marksEstimate:2},
  'q-derivative':{questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:45,marksEstimate:2},
  'q-normal':{questionStyle:'procedural',calculator:'allowed',estimatedTimeSeconds:45,marksEstimate:1},
  'q-chain':{questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:60,marksEstimate:2},
  'q-multiselect':{questionStyle:'conceptual',calculator:'neutral',estimatedTimeSeconds:45,marksEstimate:2},
  'q-truefalse':{questionStyle:'recall',calculator:'neutral',estimatedTimeSeconds:20,marksEstimate:1},
  'q-matching':{questionStyle:'recall',calculator:'not_allowed',estimatedTimeSeconds:60,marksEstimate:3},
  'q-ordering':{questionStyle:'procedural',calculator:'not_allowed',estimatedTimeSeconds:45,marksEstimate:2},
  'q-drag':{questionStyle:'conceptual',calculator:'neutral',estimatedTimeSeconds:50,marksEstimate:3},
  'q-fillblank':{questionStyle:'recall',calculator:'not_allowed',estimatedTimeSeconds:30,marksEstimate:1},
}
const seedQuestions:Question[]=seedQuestionBase.map(question=>({...question,...demoQuestionMetadata[question.id],courseId:syllabusById.get(question.syllabusPointId)!.courseId}))

const names = ['Aisha Rahman','Ben Torres','Chloe Martin','Daniel Wu','Elena Costa','Finn Murphy','Grace Kim','Hugo Silva']
const attempts: Attempt[] = names.flatMap((studentName, s) => [18,10,2].map((days, k) => {
  const answers = ['q-composite','q-sequence','q-radians','q-probability','q-derivative'].map((questionId, i) => {
    const isCorrect = ((s * 3 + k + i) % 7) > (i === 3 ? 2 : 1)
    return { questionId, submittedAnswer: isCorrect ? 'correct' : 'incorrect', isCorrect, responseTimeMs: 5200 + ((s+k+i)*1300)%13000, awardedPoints: isCorrect ? 1000 : 0 }
  })
  return { id:`attempt-${s}-${k}`, quizId:'quiz-diagnostic', studentId:`student-${s}`, studentName, classId:'class-aa-sl', startedAt:isoDaysAgo(days), completedAt:isoDaysAgo(days), score:answers.reduce((n,a)=>n+a.awardedPoints,0), maxScore:5000, answers }
}))

export const initialState: AppState = {
  user: null,
  activeCourseId:COURSE_IDS.aaSl,
  questions: [...aaQuestionSeed,...aiQuestionSeed,...seedQuestions],
  classes: [
    { id:'class-aa-sl', teacherId:'teacher-demo', name:'Grade 11 AA SL', courseId:COURSE_IDS.aaSl, joinCode:'VECTOR', archived:false, createdAt:isoDaysAgo(70), members:names.map((displayName,i)=>({id:`student-${i}`,displayName,email:`student${i+1}@school.test`,joinedAt:isoDaysAgo(60-i)})) },
    { id:'class-aa-hl', teacherId:'teacher-demo', name:'Grade 12 AA HL', courseId:COURSE_IDS.aaHl, joinCode:'SIGMA7', archived:false, createdAt:isoDaysAgo(45), members:names.slice(0,5).map((displayName,i)=>({id:`hl-student-${i}`,displayName,joinedAt:isoDaysAgo(40-i)})) },
    { id:'class-ai-sl', teacherId:'teacher-demo', name:'Grade 11 AI SL', courseId:COURSE_IDS.aiSl, joinCode:'MODEL8', archived:false, createdAt:isoDaysAgo(30), members:names.slice(0,6).map((displayName,i)=>({id:`ai-student-${i}`,displayName,joinedAt:isoDaysAgo(28-i)})) },
  ],
  quizzes: [
    { id:'quiz-diagnostic', teacherId:'teacher-demo', title:'Term 1 mastery pulse', courseId:COURSE_IDS.aaSl, mode:'assignment', questionIds:['q-composite','q-sequence','q-radians','q-probability','q-derivative'], settings:normalizeQuizSettings({feedback:'after_completion', calculatorAllowed:true}), createdAt:isoDaysAgo(20) },
    { id:'quiz-calculus', teacherId:'teacher-demo', title:'AA classroom quickfire', courseId:COURSE_IDS.aaSl, mode:'live', questionIds:['q-truefalse','q-multiselect','q-matching','q-ordering','q-drag','q-fillblank'], settings:normalizeQuizSettings({feedback:'after_each', calculatorAllowed:false}), createdAt:isoDaysAgo(3) },
    { id:'quiz-ai-models', teacherId:'teacher-demo', title:'AI modelling pulse', courseId:COURSE_IDS.aiSl, mode:'practice', questionIds:aiQuestionSeed.filter(question=>['SL 2.5','SL 2.6','SL 3.6'].includes(syllabusById.get(question.syllabusPointId)?.code??'')).slice(0,8).map(question=>question.id), settings:normalizeQuizSettings({feedback:'after_each',calculatorAllowed:true}), createdAt:isoDaysAgo(2) },
  ],
  sessions: [], attempts, importBatches:[], usageEvents:[],
}
