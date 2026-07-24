import { useEffect, useMemo, useState } from 'react'
import { Check, Clipboard, Code2, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, UpgradeCard, titleCase } from '../components/UI'
import { courses, getCourse } from '../data/courses'
import { syllabusForCourse } from '../data/syllabus'
import { checkPlanGate } from '../lib/plans'
import { useApp } from '../state/AppContext'
import type { CalculatorMode, Difficulty, QuestionStyle, QuestionType } from '../types'

const playableTypes:QuestionType[]=['multiple_choice','numeric_answer','short_answer','multi_select','true_false','matching','ordering','drag_drop','fill_blank']
const styles:QuestionStyle[]=['recall','procedural','conceptual','misconception','application','exam_style']
const difficulties:Difficulty[]=['foundation','standard','extension']

export function PromptGeneratorPage(){
  const {state,actions}=useApp();const [courseId,setCourseId]=useState(state.activeCourseId);const visiblePoints=syllabusForCourse(courseId);const activeCourse=getCourse(courseId);const [selectedPointIds,setSelectedPointIds]=useState<string[]>([visiblePoints.find(point=>point.code==='SL 2.5')?.id??visiblePoints[0].id]);const [count,setCount]=useState(6);const [selectedDifficulties,setSelectedDifficulties]=useState<Difficulty[]>([...difficulties]);const [selectedTypes,setSelectedTypes]=useState<QuestionType[]>(['multiple_choice','numeric_answer','short_answer','multi_select']);const [selectedStyles,setSelectedStyles]=useState<QuestionStyle[]>([...styles]);const [calculator,setCalculator]=useState<CalculatorMode>('neutral');const [misconceptions,setMisconceptions]=useState(true);const [copied,setCopied]=useState(false);const gate=checkPlanGate(state,'prompt_generations')
  const selectedPoints=visiblePoints.filter(point=>selectedPointIds.includes(point.id))
  useEffect(()=>{if(state.activeCourseId!==courseId){const next=syllabusForCourse(state.activeCourseId);setCourseId(state.activeCourseId);setSelectedPointIds([next.find(point=>point.code==='SL 2.5')?.id??next[0].id])}},[state.activeCourseId,courseId])
  const toggle=<T extends string>(value:T,values:T[],setValues:(values:T[])=>void)=>setValues(values.includes(value)?values.filter(item=>item!==value):[...values,value])
  const changeCourse=(nextCourseId:string)=>{const next=syllabusForCourse(nextCourseId);setCourseId(nextCourseId);actions.setActiveCourse(nextCourseId);setSelectedPointIds([next.find(point=>point.code==='SL 2.5')?.id??next[0].id])}
  const aiGuidance=activeCourse.courseFamily==='applications_interpretation'?`
Applications and Interpretation emphasis:
- Use modelling, interpretation, and technology-supported reasoning where appropriate.
- Use authentic statistics, probability, financial mathematics, Voronoi, graph theory, matrices, Markov-chain, and differential-equation contexts only when they match the selected point.
- Ask students to interpret answers in context, domains, assumptions, residuals, or technological output where the syllabus point supports this.`:''
  const prompt=useMemo(()=>`Create a varied set of ${activeCourse.displayName} questions in valid JSON only.

Course: ${activeCourse.displayName}
Course family: ${activeCourse.courseFamily}
Course level: ${activeCourse.level}${activeCourse.level==='HL'?' (include SL core and AHL content)':''}
Questions per selected syllabus point: ${count}
Selected syllabus points:
${selectedPoints.map(point=>`- ${point.code} — ${point.title}: ${point.description}`).join('\n')}

Difficulty mix: ${selectedDifficulties.join(', ')}
Question type mix: ${selectedTypes.join(', ')}
Question style mix: ${selectedStyles.join(', ')}
Calculator: ${calculator}
Include common misconceptions: ${misconceptions?'yes':'no'}

For each selected syllabus point, include a varied mix where appropriate:
- recall
- procedural
- conceptual
- misconception
- application
- exam_style

Rules:
- Output valid JSON only. Do not use markdown.
- Use MathQuiz Import Format v1.1 with the format value "math_quiz_import_v1.1".
- Do not invent syllabus codes. Use only the selected codes above.
- Do not ask students to identify syllabus codes.
- Do not ask what a syllabus point contains.
- Do not ask students to match work to a syllabus code.
- Do not ask which topic covers a skill or which mathematical focus is mapped to a code.
- Do not ask students to describe SL or AHL syllabus wording.
- Ask genuine mathematics questions only: calculation, reasoning, interpretation, graph analysis, algebraic manipulation, or problem solving.
- The syllabus code is metadata for the app, not content for the student.
- Generate ${count} genuinely different questions per selected point; do not merely reword one calculation.
- Balance the selected difficulties, types, and styles as evenly as the mathematics allows.
- Every question must include: type, syllabusCode, difficulty, questionStyle, calculator, estimatedTimeSeconds, marksEstimate, prompt, answer data appropriate to the type, explanation, and tags.
- estimatedTimeSeconds must be an integer from 10 to 900. marksEstimate must be an integer from 1 to 20.
- calculator must be allowed, not_allowed, or neutral.
- Use concise, teacher-checkable explanations and notation suitable for ${activeCourse.displayName}.
- Avoid ambiguous wording and unsupported long proofs.
${selectedTypes.map(rulesForType).filter(Boolean).join('\n')}
${misconceptions?'- Include plausible misconception distractors, but explain the correction clearly.':'- Do not deliberately target common misconceptions.'}
${aiGuidance}

Return only this JSON structure:
{
  "format": "math_quiz_import_v1.1",
  "courseFamily": "${activeCourse.courseFamily}",
  "courseLevel": "${activeCourse.level}",
  "course": "${activeCourse.displayName}",
  "source": "chatgpt",
  "questions": []
}`,[activeCourse,aiGuidance,calculator,count,misconceptions,selectedDifficulties,selectedPoints,selectedStyles,selectedTypes])
  const copy=async()=>{if(!gate.allowed||!selectedPoints.length||!selectedDifficulties.length||!selectedTypes.length||!selectedStyles.length)return;await navigator.clipboard.writeText(prompt);actions.logUsage('prompt_generation');setCopied(true);setTimeout(()=>setCopied(false),1600)}
  return <>
    <PageHeader eyebrow="Question creation" title="ChatGPT prompt studio" description="Build a varied, syllabus-grounded brief for one point or a whole course slice." actions={<Link className="button secondary" to="/teacher/questions/import"><Code2/>Open importer</Link>}/>
    <div className="prompt-layout rich-prompt-layout"><section className="panel prompt-controls"><div className="panel-head"><div><span className="eyebrow">1 · Configure</span><h2>Coverage brief</h2></div><span className="selection-total">{selectedPoints.length*count} questions</span></div><div className="form-stack"><label>Course<select value={courseId} onChange={event=>changeCourse(event.target.value)}>{courses.map(course=><option value={course.id} key={course.id}>{course.displayName}</option>)}</select><small>{activeCourse.level==='HL'?'SL core and AHL points are available.':'SL syllabus points only.'}</small></label><fieldset className="point-selector"><legend>Syllabus points</legend><div className="point-selector-actions"><span>{selectedPoints.length} selected</span><button type="button" onClick={()=>setSelectedPointIds(visiblePoints.map(point=>point.id))}>Select visible</button><button type="button" onClick={()=>setSelectedPointIds([])}>Clear</button></div><div>{visiblePoints.map(point=><label key={point.id}><input type="checkbox" checked={selectedPointIds.includes(point.id)} onChange={()=>toggle(point.id,selectedPointIds,setSelectedPointIds)}/><span><b>{point.code} · {point.title}</b><small>{point.description}</small></span></label>)}</div></fieldset><label>Questions per syllabus point<div className="number-stepper"><button type="button" onClick={()=>setCount(Math.max(1,count-1))}>−</button><b>{count}</b><button type="button" onClick={()=>setCount(Math.min(20,count+1))}>+</button></div></label><ChipPicker label="Difficulty mix" values={difficulties} selected={selectedDifficulties} onToggle={value=>toggle(value,selectedDifficulties,setSelectedDifficulties)}/><ChipPicker label="Question type mix" values={playableTypes} selected={selectedTypes} onToggle={value=>toggle(value,selectedTypes,setSelectedTypes)}/><ChipPicker label="Question style mix" values={styles} selected={selectedStyles} onToggle={value=>toggle(value,selectedStyles,setSelectedStyles)}/><fieldset><legend>Calculator</legend><div className="segmented three"><button type="button" className={calculator==='not_allowed'?'active':''} onClick={()=>setCalculator('not_allowed')}>Not allowed</button><button type="button" className={calculator==='allowed'?'active':''} onClick={()=>setCalculator('allowed')}>Allowed</button><button type="button" className={calculator==='neutral'?'active':''} onClick={()=>setCalculator('neutral')}>Neutral</button></div></fieldset><label className="misconception-toggle"><input type="checkbox" checked={misconceptions} onChange={event=>setMisconceptions(event.target.checked)}/><span><b>Include common misconceptions</b><small>Ask for plausible traps and explicit corrections.</small></span></label></div></section><section className="panel prompt-output"><div className="panel-head"><div><span className="eyebrow">2 · Copy</span><h2>Ready-to-use prompt</h2></div><span className="live-format"><i/>Format v1.1</span></div>{!selectedPoints.length?<div className="prompt-empty">Select at least one syllabus point.</div>:<pre>{prompt}</pre>}<div className="prompt-footer"><span><Sparkles/>Always teacher-check generated mathematics before publishing.</span><button className="button primary" onClick={copy} disabled={!gate.allowed||!selectedPoints.length||!selectedTypes.length||!selectedStyles.length||!selectedDifficulties.length}>{copied?<Check/>:<Clipboard/>}{copied?'Copied':'Copy prompt'}</button></div></section></div>
    {!gate.allowed&&<UpgradeCard message={gate.message}/>} 
  </>
}

function ChipPicker<T extends string>({label,values,selected,onToggle}:{label:string;values:readonly T[];selected:T[];onToggle:(value:T)=>void}){
  return <fieldset className="prompt-chip-picker"><legend>{label}</legend><div>{values.map(value=><button type="button" className={selected.includes(value)?'active':''} onClick={()=>onToggle(value)} key={value}>{selected.includes(value)&&<Check/>}{titleCase(value)}</button>)}</div></fieldset>
}

function rulesForType(type:QuestionType){
  if(type==='multiple_choice')return '- multiple_choice: use exactly four unique choices and one answer that exactly matches a choice.'
  if(type==='multi_select')return '- multi_select: use exactly four unique choices and an answers array containing at least two exact choices.'
  if(type==='true_false')return '- true_false: answer must be the JSON boolean true or false.'
  if(type==='numeric_answer')return '- numeric_answer: answer must be numeric; include a non-negative tolerance.'
  if(type==='short_answer'||type==='fill_blank')return `- ${type}: include answer and useful acceptedAnswers.${type==='fill_blank'?' Mark the blank with ___.':''}`
  if(type==='matching')return '- matching: use at least two unique left/right pairs.'
  if(type==='ordering')return '- ordering: items and correctOrder must contain the same unique values.'
  if(type==='drag_drop')return '- drag_drop: every item.correctZone must exactly match a declared zone.'
  return ''
}
