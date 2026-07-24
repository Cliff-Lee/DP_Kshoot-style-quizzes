import {readFile} from 'node:fs/promises'
import {topic1} from './question-bank/topic1.mjs'
import {topic2} from './question-bank/topic2.mjs'
import {topic3} from './question-bank/topic3.mjs'
import {topic4} from './question-bank/topic4.mjs'
import {topic5} from './question-bank/topic5.mjs'
import {extras} from './question-bank/extras.mjs'
import {aiTopic1} from './question-bank-ai/topic1.mjs'
import {aiTopic2} from './question-bank-ai/topic2.mjs'
import {aiTopic3} from './question-bank-ai/topic3.mjs'
import {aiTopic4} from './question-bank-ai/topic4.mjs'
import {aiTopic5} from './question-bank-ai/topic5.mjs'
import {compilePoint} from './question-bank/helpers.mjs'

const root=new URL('../',import.meta.url)
const loadJson=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'))
const aaGenerated=await loadJson('src/data/aaQuestionSeed.generated.json')
const aiGenerated=await loadJson('src/data/aiQuestionSeed.generated.json')
const aaSyllabusSource=await readFile(new URL('src/data/syllabus.ts',root),'utf8')
const aiSyllabusSource=await readFile(new URL('src/data/aiSyllabus.ts',root),'utf8')
const aaCodes=new Set([...aaSyllabusSource.matchAll(/\['((?:SL|AHL)\s+[1-5]\.\d+)'/g)].map(match=>match[1]))
const aiCodes=new Set([...aiSyllabusSource.matchAll(/\['((?:SL|AHL)\s+[1-5]\.\d+)'/g)].map(match=>match[1]))
const expected={analysis_approaches:aaCodes,applications_interpretation:aiCodes}
const labels={analysis_approaches:'AA',applications_interpretation:'AI'}

const samplePaths=[
  'examples/math-quiz-import-v1.sample.json',
  'examples/math-quiz-import-v1.1.sample.json',
  'examples/math-quiz-import-v1.drag-drop.sample.json',
  'examples/math-quiz-import-v1.1.ai.sample.json',
]
const samples=await Promise.all(samplePaths.map(async source=>({source,document:await loadJson(source)})))

const familyOf=document=>document.courseFamily
  ??(String(document.course).includes('Applications and Interpretation')?'applications_interpretation':'analysis_approaches')
const decorateDocument=(document,source)=>document.questions.map(question=>({
  ...question,
  courseFamily:question.courseFamily??familyOf(document),
  sourceFile:source,
}))
const aaQuestions=decorateDocument(aaGenerated,'src/data/aaQuestionSeed.generated.json')
const aiQuestions=decorateDocument(aiGenerated,'src/data/aiQuestionSeed.generated.json')

const demoSource=await readFile(new URL('src/data/demo.ts',root),'utf8')
const demoMetadata=new Map([...demoSource.matchAll(/'(q-[^']+)':\{questionStyle:'([^']+)',calculator:'([^']+)',estimatedTimeSeconds:(\d+),marksEstimate:(\d+)/g)].map(match=>[
  match[1],
  {questionStyle:match[2],calculator:match[3],estimatedTimeSeconds:Number(match[4]),marksEstimate:Number(match[5])},
]))
const demoQuestions=demoSource.split('\n').filter(line=>line.includes("{ id:'q-")).map(line=>{
  const seedId=line.match(/id:'([^']+)'/)?.[1]??'unknown'
  const answerString=line.match(/answerData:\{answer:'([^']+)'/)?.[1]
  const answerBoolean=line.match(/answerData:\{answer:(true|false)/)?.[1]
  const answerNumber=line.match(/answerData:\{answer:(-?\d+(?:\.\d+)?)/)?.[1]
  return {
    sourceFile:'src/data/demo.ts',
    courseFamily:'analysis_approaches',
    seedId,
    syllabusCode:line.match(/point\('([^']+)'\)/)?.[1]??'UNKNOWN',
    type:line.match(/type:'([^']+)'/)?.[1]??'unknown',
    prompt:line.match(/prompt:'([^']+)'/)?.[1]??'',
    explanation:line.match(/explanation:'([^']+)'/)?.[1]??'',
    answer:answerString??(answerBoolean===undefined?(answerNumber===undefined?undefined:Number(answerNumber)):answerBoolean==='true'),
    difficulty:line.match(/difficulty:'([^']+)'/)?.[1]??'standard',
    ...demoMetadata.get(seedId),
  }
})

const runtime=[...aaQuestions,...aiQuestions,...demoQuestions]
const sampleQuestions=samples.flatMap(group=>decorateDocument(group.document,group.source))
const all=[...runtime,...sampleQuestions]
const banned=[
  /\bdescribe\s+(?:sl|ahl)\b/i,
  /\bmapped to (?:the )?(?:syllabus|syllabus point|code|topic)\b/i,
  /\bsyllabus point\b/i,
  /\bcorrect syllabus code\b/i,
  /\bshould be tagged\b/i,
  /\bwork focused on\b/i,
  /\bmathematical focus\b/i,
  /\bwhich topic covers\b/i,
  /\bwhat is included in\b/i,
  /\bselect both statements that accurately describe\b/i,
  /\btrue or false:\s*(?:sl|ahl)\b/i,
  /\bwhat (?:does|is) (?:sl|ahl)\s+[1-5]\.\d+ (?:include|contain|cover)\b/i,
]
const codeOnly=/^(?:SL|AHL)\s+[1-5]\.\d+$/i
const values=question=>[question.answer,...(question.answers??[]),...(question.acceptedAnswers??[])].filter(value=>value!==undefined).map(String)
const bad=all.filter(question=>banned.some(pattern=>pattern.test(question.prompt??''))||values(question).some(value=>codeOnly.test(value.trim())))

const aaPointSets={...topic1,...topic2,...topic3,...topic4,...topic5}
const aiPointSets={...aiTopic1,...aiTopic2,...aiTopic3,...aiTopic4,...aiTopic5}
const aaSource=Object.keys(aaPointSets).flatMap(code=>[...compilePoint(code,aaPointSets[code]),...compilePoint(code,extras[code]??[],false)])
const aiSource=Object.keys(aiPointSets).flatMap(code=>compilePoint(code,aiPointSets[code]))
const canonical=value=>{
  if(Array.isArray(value))return value.map(canonical)
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]))
  return value
}
const stripGenerated=question=>{
  const {seedId:_,courseFamily:__,courseLevel:___,...rest}=question
  return rest
}
const sourceDrift={
  analysis_approaches:aaSource.length!==aaGenerated.questions.length||JSON.stringify(canonical(aaSource))!==JSON.stringify(canonical(aaGenerated.questions.map(stripGenerated))),
  applications_interpretation:aiSource.length!==aiGenerated.questions.length||JSON.stringify(canonical(aiSource))!==JSON.stringify(canonical(aiGenerated.questions.map(stripGenerated))),
}

const allowed={
  type:new Set(['multiple_choice','numeric_answer','short_answer','multi_select','true_false','matching','ordering','drag_drop','fill_blank']),
  difficulty:new Set(['foundation','standard','extension']),
  questionStyle:new Set(['recall','procedural','conceptual','misconception','application','exam_style']),
  calculator:new Set(['allowed','not_allowed','neutral']),
}
const nonEmpty=value=>typeof value==='string'&&Boolean(value.trim())
const sameMembers=(left,right)=>left.length===right.length&&new Set(left).size===left.length&&left.every(value=>right.includes(value))

function validateQuestion(question,{requireMetadata=true,validateAnswers=true}={}){
  const errors=[]
  const codes=expected[question.courseFamily]
  if(!codes)errors.push('missing or invalid courseFamily')
  else if(!codes.has(question.syllabusCode))errors.push('syllabusCode does not exist for course family')
  if(!allowed.type.has(question.type))errors.push('unsupported type')
  if(!allowed.difficulty.has(question.difficulty))errors.push('invalid difficulty')
  if(requireMetadata||question.questionStyle!==undefined){
    if(!allowed.questionStyle.has(question.questionStyle))errors.push('invalid or missing questionStyle')
    if(!allowed.calculator.has(question.calculator))errors.push('invalid or missing calculator')
    if(!Number.isInteger(question.estimatedTimeSeconds)||question.estimatedTimeSeconds<10||question.estimatedTimeSeconds>900)errors.push('invalid estimatedTimeSeconds')
    if(!Number.isInteger(question.marksEstimate)||question.marksEstimate<1||question.marksEstimate>20)errors.push('invalid marksEstimate')
  }
  if(!nonEmpty(question.prompt))errors.push('missing prompt')
  if(!nonEmpty(question.explanation))errors.push('missing explanation')
  if(requireMetadata&&(!Array.isArray(question.tags)||!question.tags.length||question.tags.some(tag=>!nonEmpty(tag))))errors.push('missing or invalid tags')
  if(banned.some(pattern=>pattern.test(question.prompt??'')))errors.push('banned metadata prompt')
  if(values(question).some(value=>codeOnly.test(value.trim())))errors.push('syllabus-code answer')
  if(validateAnswers&&question.type==='multiple_choice'){
    if(!Array.isArray(question.choices)||question.choices.length!==4||new Set(question.choices).size!==4)errors.push('multiple_choice needs four unique choices')
    if(!question.choices?.includes(String(question.answer)))errors.push('multiple_choice answer does not match a choice')
  }
  if(validateAnswers&&question.type==='multi_select'){
    if(!Array.isArray(question.choices)||question.choices.length!==4||new Set(question.choices).size!==4)errors.push('multi_select needs four unique choices')
    if(!Array.isArray(question.answers)||question.answers.length<2||new Set(question.answers).size!==question.answers.length||question.answers.some(answer=>!question.choices?.includes(answer)))errors.push('invalid multi_select answers')
  }
  if(validateAnswers&&question.type==='true_false'&&typeof question.answer!=='boolean')errors.push('true_false answer must be boolean')
  if(validateAnswers&&question.type==='numeric_answer'){
    if(typeof question.answer!=='number'||!Number.isFinite(question.answer))errors.push('numeric_answer answer must be finite')
    if(question.tolerance!==undefined&&(typeof question.tolerance!=='number'||question.tolerance<0))errors.push('invalid numeric tolerance')
  }
  if(validateAnswers&&['short_answer','fill_blank'].includes(question.type)&&question.answer===undefined&&(!Array.isArray(question.acceptedAnswers)||!question.acceptedAnswers.length))errors.push(`${question.type} needs an answer`)
  if(validateAnswers&&question.type==='matching'){
    const pairs=Array.isArray(question.pairs)?question.pairs:[]
    if(pairs.length<2||pairs.some(pair=>!nonEmpty(pair.left)||!nonEmpty(pair.right))||new Set(pairs.map(pair=>pair.left)).size!==pairs.length||new Set(pairs.map(pair=>pair.right)).size!==pairs.length)errors.push('invalid matching pairs')
  }
  if(validateAnswers&&question.type==='ordering'){
    const items=Array.isArray(question.items)?question.items:[]
    const order=Array.isArray(question.correctOrder)?question.correctOrder:[]
    if(items.length<3||!sameMembers(items,order))errors.push('invalid ordering answer')
  }
  if(validateAnswers&&question.type==='drag_drop'){
    const zones=Array.isArray(question.zones)?question.zones:[]
    const items=Array.isArray(question.items)?question.items:[]
    if(zones.length<2||new Set(zones).size!==zones.length||!items.length||items.some(item=>!nonEmpty(item.text)||!zones.includes(item.correctZone)))errors.push('invalid drag_drop answer')
  }
  return errors
}

const invalid=[]
for(const question of runtime){
  const requireMetadata=question.sourceFile!=='src/data/demo.ts'
  const errors=validateQuestion(question,{requireMetadata,validateAnswers:question.sourceFile!=='src/data/demo.ts'})
  if(question.sourceFile==='src/data/demo.ts'){
    if(!allowed.questionStyle.has(question.questionStyle)||!allowed.calculator.has(question.calculator))errors.push('missing demo metadata')
    if(!Number.isInteger(question.estimatedTimeSeconds)||!Number.isInteger(question.marksEstimate))errors.push('missing demo timing or marks')
  }
  if(errors.length)invalid.push({source:question.sourceFile,family:question.courseFamily,code:question.syllabusCode,prompt:question.prompt,errors:[...new Set(errors)]})
}
for(const group of samples){
  const requireMetadata=group.document.format==='math_quiz_import_v1.1'
  for(const question of decorateDocument(group.document,group.source)){
    const errors=validateQuestion(question,{requireMetadata})
    if(errors.length)invalid.push({source:group.source,family:question.courseFamily,code:question.syllabusCode,prompt:question.prompt,errors})
  }
}

const envelopeErrors=[]
const canonicalEnvelope=[
  [aaGenerated,'analysis_approaches','HL','IB Mathematics: Analysis and Approaches HL','AA generated bank'],
  [aiGenerated,'applications_interpretation','HL','IB Mathematics: Applications and Interpretation HL','AI generated bank'],
]
for(const [document,family,level,course,label] of canonicalEnvelope){
  if(document.format!=='math_quiz_import_v1.1')envelopeErrors.push(`${label}: format must be v1.1`)
  if(document.courseFamily!==family||document.courseLevel!==level||document.course!==course)envelopeErrors.push(`${label}: invalid course identity`)
}
for(const {source,document} of samples){
  if(!['math_quiz_import_v1','math_quiz_import_v1.1'].includes(document.format))envelopeErrors.push(`${source}: invalid format`)
  if(document.format==='math_quiz_import_v1.1'&&(!document.courseFamily||!document.courseLevel))envelopeErrors.push(`${source}: v1.1 requires courseFamily and courseLevel`)
}

const normalize=value=>String(value).toLowerCase().replace(/[^a-z0-9π]+/g,' ').trim().replace(/\s+/g,' ')
const exact=[]
const near=[]
const tokens=value=>new Set(normalize(value).split(' ').filter(token=>token.length>1))
const similarity=(a,b)=>{
  const aa=tokens(a),bb=tokens(b)
  const intersection=[...aa].filter(token=>bb.has(token)).length
  return intersection/Math.max(1,new Set([...aa,...bb]).size)
}
for(let i=0;i<runtime.length;i++)for(let j=i+1;j<runtime.length;j++){
  if(runtime[i].courseFamily!==runtime[j].courseFamily||runtime[i].syllabusCode!==runtime[j].syllabusCode)continue
  const left=normalize(runtime[i].prompt),right=normalize(runtime[j].prompt)
  if(left===right)exact.push([runtime[i],runtime[j]])
  else if(similarity(left,right)>=0.9)near.push([runtime[i],runtime[j]])
}

const coverage={}
const gaps=[]
const missing=[]
const unknown=[]
for(const [family,codes] of Object.entries(expected)){
  const groups=new Map([...codes].map(code=>[code,runtime.filter(question=>question.courseFamily===family&&question.syllabusCode===code)]))
  coverage[family]=groups
  for(const [code,questions] of groups){
    if(!questions.length)missing.push(`${labels[family]} ${code}`)
    if(questions.length<3||new Set(questions.map(question=>question.type)).size<2||new Set(questions.map(question=>question.questionStyle)).size<2||['foundation','standard','extension'].some(difficulty=>!questions.some(question=>question.difficulty===difficulty))){
      gaps.push({family,code,questions})
    }
  }
  unknown.push(...runtime.filter(question=>question.courseFamily===family&&!codes.has(question.syllabusCode)).map(question=>`${labels[family]} ${question.syllabusCode}`))
}

const countBy=(questions,field)=>Object.fromEntries([...questions.reduce((map,question)=>map.set(question[field]??'unspecified',(map.get(question[field]??'unspecified')??0)+1),new Map())].sort())
const topicCounts=questions=>Object.fromEntries([1,2,3,4,5].map(topic=>[String(topic),questions.filter(question=>Number(question.syllabusCode?.match(/[1-5]/)?.[0])===topic).length]))

console.log('MathPulse AA + AI question-bank audit')
console.log('=====================================')
console.log(`Authoritative syllabus points: ${aaCodes.size+aiCodes.size} (AA ${aaCodes.size}, AI ${aiCodes.size})`)
console.log(`Runtime questions: ${runtime.length} (AA ${aaQuestions.length+demoQuestions.length}, AI ${aiQuestions.length})`)
console.log(`Sample-import questions: ${sampleQuestions.length}`)
console.log(`Total records audited: ${all.length}`)
console.log(`Banned metadata questions: ${bad.length}`)
console.log(`Genuine mathematics questions: ${all.length-bad.length}`)
console.log(`Invalid question records: ${invalid.length}`)
console.log(`Exact duplicate prompts: ${exact.length}`)
console.log(`Near-duplicate prompts for review: ${near.length}`)
for(const family of ['analysis_approaches','applications_interpretation']){
  const questions=runtime.filter(question=>question.courseFamily===family)
  const counts=[...coverage[family].values()].map(group=>group.length)
  console.log(`\n${labels[family]} coverage`)
  console.log(`- questions: ${questions.length}`)
  console.log(`- by topic: ${JSON.stringify(topicCounts(questions))}`)
  console.log(`- points represented: ${counts.filter(Boolean).length}/${expected[family].size}`)
  console.log(`- questions per point: min ${Math.min(...counts)}, max ${Math.max(...counts)}, average ${(questions.length/expected[family].size).toFixed(2)}`)
  console.log(`- types: ${JSON.stringify(countBy(questions,'type'))}`)
  console.log(`- difficulties: ${JSON.stringify(countBy(questions,'difficulty'))}`)
  console.log(`- styles: ${JSON.stringify(countBy(questions,'questionStyle'))}`)
  console.log(`- generator/source drift: ${sourceDrift[family]?'yes':'no'}`)
}

if(bad.length){
  console.log('\nBanned examples:')
  bad.slice(0,12).forEach(question=>console.log(`- [${question.sourceFile}] ${labels[question.courseFamily]} ${question.syllabusCode}: ${question.prompt}`))
}
if(invalid.length){
  console.log('\nInvalid records:')
  invalid.slice(0,30).forEach(question=>console.log(`- [${question.source}] ${labels[question.family]} ${question.code}: ${question.errors.join(', ')} — ${question.prompt}`))
}
if(gaps.length){
  console.log('\nCoverage gaps:')
  gaps.forEach(({family,code,questions})=>console.log(`- ${labels[family]} ${code}: ${questions.length} questions, ${new Set(questions.map(q=>q.type)).size} types, ${new Set(questions.map(q=>q.questionStyle)).size} styles, ${new Set(questions.map(q=>q.difficulty)).size} difficulties`))
}
if(exact.length){
  console.log('\nExact duplicates:')
  exact.slice(0,12).forEach(([a,b])=>console.log(`- ${labels[a.courseFamily]} ${a.syllabusCode}: “${a.prompt}” (${a.seedId}, ${b.seedId})`))
}
if(near.length){
  console.log('\nNear duplicates for review:')
  near.slice(0,12).forEach(([a,b])=>console.log(`- ${labels[a.courseFamily]} ${a.syllabusCode}: “${a.prompt}” / “${b.prompt}”`))
}
if(envelopeErrors.length){
  console.log('\nCourse/format errors:')
  envelopeErrors.forEach(error=>console.log(`- ${error}`))
}

if(bad.length||invalid.length||gaps.length||exact.length||missing.length||unknown.length||Object.values(sourceDrift).some(Boolean)||envelopeErrors.length){
  console.error('\nAudit failed. Fix course mappings, question content, validation, source drift, duplicates, or coverage gaps.')
  process.exit(1)
}
console.log('\nAudit passed.')
