import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, Calculator, Check, ChevronDown, ChevronRight, Clock3, Copy, FileJson, Filter, Flame, GripVertical, ListPlus, Minus, Play, Plus, RadioTower, RefreshCw, Search, Settings2, Shield, Sparkles, Target, Trash2, Trophy, Users, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmptyState, LoadingState, PageHeader, StatusPill, SyllabusChip, titleCase } from '../components/UI'
import { courses, getCourse } from '../data/courses'
import { syllabusById, syllabusForCourse, topicColors } from '../data/syllabus'
import { useApp } from '../state/AppContext'
import { questionCountsByPoint, questionsForCourse } from '../lib/courseQuestionBank'
import { DEFAULT_QUIZ_SETTINGS } from '../lib/gameLogic'
import type { CalculatorMode, Difficulty, PointsMode, Question, QuestionStyle, QuestionType } from '../types'

type BuilderMode='quick'|'manual'|'reports'|'import'
type BuilderStage='compose'|'review'|'settings'
type QuizPreset='starter'|'lesson_check'|'test_practice'|'custom'
type DifficultyChoice=Difficulty|'mixed'
type CalculatorChoice=CalculatorMode|'mixed'

const quickTypes:QuestionType[]=['multiple_choice','numeric_answer','short_answer','multi_select','ordering']
const allQuestionTypes:QuestionType[]=['multiple_choice','numeric_answer','short_answer','multi_select','true_false','matching','ordering','drag_drop','fill_blank']
const difficultyOrder:Difficulty[]=['foundation','standard','extension']
const presetDetails:Record<QuizPreset,{label:string;description:string;count:number;difficulty:DifficultyChoice;exam:boolean;quick:boolean}>={
  starter:{label:'Starter quiz',description:'Fast retrieval to open a lesson',count:5,difficulty:'foundation',exam:false,quick:true},
  lesson_check:{label:'Lesson check',description:'Balanced evidence before moving on',count:8,difficulty:'mixed',exam:false,quick:true},
  test_practice:{label:'Test practice',description:'Longer, more demanding mixed practice',count:12,difficulty:'mixed',exam:true,quick:false},
  custom:{label:'Custom',description:'Set every parameter yourself',count:10,difficulty:'mixed',exam:false,quick:true},
}

export function QuizBuilderPage(){
  const {state,actions,hydrated}=useApp()
  const navigate=useNavigate()
  const [builderMode,setBuilderMode]=useState<BuilderMode>('quick')
  const [stage,setStage]=useState<BuilderStage>('compose')
  const [title,setTitle]=useState('')
  const [deliveryMode,setDeliveryMode]=useState<'live'|'assignment'|'practice'>('live')
  const [selected,setSelected]=useState<string[]>([])
  const [selectedTopic,setSelectedTopic]=useState(2)
  const [selectedCourseId,setSelectedCourseId]=useState(state.activeCourseId)
  const [selectedPointIds,setSelectedPointIds]=useState<string[]>(()=>syllabusForCourse(state.activeCourseId).filter(point=>point.topicNumber===2).slice(0,4).map(point=>point.id))
  const [preset,setPreset]=useState<QuizPreset>('lesson_check')
  const [questionCount,setQuestionCount]=useState(8)
  const [difficultyChoice,setDifficultyChoice]=useState<DifficultyChoice>('mixed')
  const [calculatorChoice,setCalculatorChoice]=useState<CalculatorChoice>('mixed')
  const [selectedTypes,setSelectedTypes]=useState<QuestionType[]>([...quickTypes])
  const [avoidRecent,setAvoidRecent]=useState(true)
  const [includeSolutions,setIncludeSolutions]=useState(true)
  const [includeExamStyle,setIncludeExamStyle]=useState(false)
  const [includeQuick,setIncludeQuick]=useState(true)
  const [generationNote,setGenerationNote]=useState('')
  const [previewQuestion,setPreviewQuestion]=useState<Question|null>(null)
  const [replacementTarget,setReplacementTarget]=useState('')
  const [mobileOutlineOpen,setMobileOutlineOpen]=useState(false)
  const [mobileFiltersOpen,setMobileFiltersOpen]=useState(false)
  const [manualLimit,setManualLimit]=useState(60)

  const [search,setSearch]=useState('')
  const [pointFilter,setPointFilter]=useState('all')
  const [difficultyFilter,setDifficultyFilter]=useState('all')
  const [typeFilter,setTypeFilter]=useState('all')
  const [calculatorFilter,setCalculatorFilter]=useState('all')
  const [marksFilter,setMarksFilter]=useState('all')
  const [sourceFilter,setSourceFilter]=useState('all')
  const [recentFilter,setRecentFilter]=useState('all')
  const [qualityFilter,setQualityFilter]=useState('all')
  const [successFilter,setSuccessFilter]=useState('all')

  const [showLeaderboard,setShowLeaderboard]=useState(true)
  const [enablePowerups,setEnablePowerups]=useState(true)
  const [enableStreakBonuses,setEnableStreakBonuses]=useState(true)
  const [showExplanations,setShowExplanations]=useState(true)
  const [timeLimit,setTimeLimit]=useState(30)
  const [pointsMode,setPointsMode]=useState<PointsMode>('speed_bonus')
  const [saving,setSaving]=useState(false)
  const [saveError,setSaveError]=useState('')

  useEffect(()=>{
    if(state.activeCourseId===selectedCourseId)return
    const next=syllabusForCourse(state.activeCourseId)
    setSelectedCourseId(state.activeCourseId)
    setSelectedPointIds(next.filter(point=>point.topicNumber===selectedTopic).slice(0,4).map(point=>point.id))
    setSelected([])
    setPointFilter('all')
    setPreviewQuestion(null)
    setGenerationNote('')
  },[state.activeCourseId,selectedCourseId,selectedTopic])

  const activeCourse=getCourse(selectedCourseId)
  const coursePoints=useMemo(()=>syllabusForCourse(selectedCourseId),[selectedCourseId])
  const questionBank=useMemo(()=>questionsForCourse(state.questions.filter(question=>question.status!=='archived'),selectedCourseId),[state.questions,selectedCourseId])
  const selectedQuestions=useMemo(()=>selected.map(id=>questionBank.find(question=>question.id===id)).filter(Boolean) as Question[],[selected,questionBank])
  const recentQuestionIds=useMemo(()=>new Set(state.quizzes.filter(quiz=>quiz.courseId===selectedCourseId&&Date.now()-new Date(quiz.createdAt).getTime()<30*86400000).flatMap(quiz=>quiz.questionIds)),[state.quizzes,selectedCourseId])
  const usageByQuestion=useMemo(()=>{const map=new Map<string,{count:number;lastUsed?:string}>();for(const quiz of state.quizzes)for(const id of quiz.questionIds){const current=map.get(id)??{count:0};map.set(id,{count:current.count+1,lastUsed:!current.lastUsed||quiz.createdAt>current.lastUsed?quiz.createdAt:current.lastUsed})}return map},[state.quizzes])
  const successByQuestion=useMemo(()=>{const map=new Map<string,{correct:number;total:number}>();for(const answer of state.attempts.flatMap(attempt=>attempt.answers)){const current=map.get(answer.questionId)??{correct:0,total:0};map.set(answer.questionId,{correct:current.correct+(answer.isCorrect?1:0),total:current.total+1})}return map},[state.attempts])
  const pointCounts=useMemo(()=>questionCountsByPoint(state.questions,selectedCourseId),[state.questions,selectedCourseId])
  const topicPoints=coursePoints.filter(point=>point.topicNumber===selectedTopic)

  const getSuccess=(question:Question)=>{const row=successByQuestion.get(question.id);return row?.total?row.correct/row.total:null}
  const getQuality=(question:Question)=>question.source==='chatgpt_import'?(question.status==='approved'?'ai_generated':'needs_review'):question.status==='approved'?(question.createdBy==='platform'?'checked':'teacher_approved'):'needs_review'
  const getSource=(question:Question)=>question.source==='platform_seed'?'MathPulse bank':question.source==='chatgpt_import'?'AI import':'Teacher authored'

  const manualBank=useMemo(()=>questionBank.filter(question=>{
    const point=syllabusById.get(question.syllabusPointId)
    const marks=question.marksEstimate??1
    const quality=getQuality(question)
    const success=getSuccess(question)
    return (question.prompt.toLowerCase().includes(search.toLowerCase())||point?.code.toLowerCase().includes(search.toLowerCase()))
      &&(pointFilter==='all'||question.syllabusPointId===pointFilter)
      &&(difficultyFilter==='all'||question.difficulty===difficultyFilter)
      &&(typeFilter==='all'||question.type===typeFilter)
      &&(calculatorFilter==='all'||(question.calculator??'neutral')===calculatorFilter)
      &&(marksFilter==='all'||(marksFilter==='3+'?marks>=3:marks===Number(marksFilter)))
      &&(sourceFilter==='all'||question.source===sourceFilter)
      &&(recentFilter==='all'||(recentFilter==='yes')===recentQuestionIds.has(question.id))
      &&(qualityFilter==='all'||quality===qualityFilter)
      &&(successFilter==='all'||success!==null&&(successFilter==='under_50'?success<.5:successFilter==='50_79'?success>=.5&&success<.8:success>=.8))
  }),[questionBank,search,pointFilter,difficultyFilter,typeFilter,calculatorFilter,marksFilter,sourceFilter,recentFilter,qualityFilter,successFilter,recentQuestionIds,successByQuestion])
  const manualQuestions=manualBank.slice(0,manualLimit)

  if(!hydrated)return <LoadingState label="Loading your question bank…"/>

  const choosePreset=(next:QuizPreset)=>{const details=presetDetails[next];setPreset(next);if(next!=='custom'){setQuestionCount(details.count);setDifficultyChoice(details.difficulty);setIncludeExamStyle(details.exam);setIncludeQuick(details.quick)}}
  const toggleType=(type:QuestionType)=>setSelectedTypes(current=>current.includes(type)?current.filter(item=>item!==type):[...current,type])
  const togglePoint=(id:string)=>setSelectedPointIds(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id])
  const toggleSelected=(id:string)=>setSelected(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id])
  const resetFilters=()=>{setSearch('');setPointFilter('all');setDifficultyFilter('all');setTypeFilter('all');setCalculatorFilter('all');setMarksFilter('all');setSourceFilter('all');setRecentFilter('all');setQualityFilter('all');setSuccessFilter('all')}
  const changeCourse=(courseId:string)=>{
    const nextPoints=syllabusForCourse(courseId)
    const initialTopic=nextPoints.some(point=>point.topicNumber===selectedTopic)?selectedTopic:1
    setSelectedCourseId(courseId)
    actions.setActiveCourse(courseId)
    setSelectedPointIds(nextPoints.filter(point=>point.topicNumber===initialTopic).slice(0,4).map(point=>point.id))
    setSelected([])
    setPointFilter('all')
    setPreviewQuestion(null)
    setReplacementTarget('')
    setGenerationNote('')
  }

  const candidatePool=()=>{
    let pool=questionBank.filter(question=>selectedPointIds.includes(question.syllabusPointId)&&selectedTypes.includes(question.type))
    if(difficultyChoice!=='mixed')pool=pool.filter(question=>question.difficulty===difficultyChoice)
    if(calculatorChoice!=='mixed')pool=pool.filter(question=>(question.calculator??'neutral')===calculatorChoice)
    if(includeSolutions)pool=pool.filter(question=>Boolean(question.explanation.trim()))
    if(!includeExamStyle)pool=pool.filter(question=>question.questionStyle!=='exam_style')
    if(!includeQuick)pool=pool.filter(question=>question.questionStyle!=='recall'&&(question.estimatedTimeSeconds??60)>40)
    const fresh=pool.filter(question=>!recentQuestionIds.has(question.id))
    if(avoidRecent&&fresh.length>=Math.min(questionCount,pool.length))return {pool:fresh,usedFallback:false}
    return {pool,usedFallback:avoidRecent&&fresh.length<pool.length}
  }

  const generateQuiz=()=>{
    if(!selectedPointIds.length||!selectedTypes.length)return
    const {pool,usedFallback}=candidatePool()
    if(!pool.length){setGenerationNote('No questions match every choice. Broaden a question type, calculator, or difficulty setting.');return}
    const shuffled=[...pool].sort(()=>Math.random()-.5)
    const next:Question[]=[]
    const desiredDifficulties:Difficulty[]=difficultyChoice==='mixed'?Array.from({length:questionCount},(_,index)=>['foundation','standard','standard','extension'][index%4] as Difficulty):Array(questionCount).fill(difficultyChoice)
    for(let index=0;index<questionCount;index++){
      const pointId=selectedPointIds[index%selectedPointIds.length]
      const desired=desiredDifficulties[index]
      const unused=shuffled.filter(question=>!next.some(item=>item.id===question.id))
      const preferred=unused.filter(question=>question.syllabusPointId===pointId&&question.difficulty===desired)
      const samePoint=unused.filter(question=>question.syllabusPointId===pointId)
      const sameDifficulty=unused.filter(question=>question.difficulty===desired)
      const options=preferred.length?preferred:samePoint.length?samePoint:sameDifficulty.length?sameDifficulty:unused
      if(!options.length)break
      const ranked=[...options].sort((a,b)=>questionPreference(b)-questionPreference(a))
      next.push(ranked[0])
    }
    setSelected(next.map(question=>question.id))
    setShowExplanations(includeSolutions)
    if(!title){const point=syllabusById.get(selectedPointIds[0]);setTitle(selectedPointIds.length===1?`${point?.title} · ${presetDetails[preset].label}`:`${activeCourse.shortName} ${presetDetails[preset].label}`)}
    setGenerationNote(next.length<questionCount?`Built the strongest ${next.length} matches available. Add more types or syllabus points to reach ${questionCount}.`:usedFallback?'Built successfully. A few recently used questions were included to keep the requested balance.':'Built from your selected syllabus coverage.')
    setStage('review')
  }

  const questionPreference=(question:Question)=>Number(includeExamStyle&&question.questionStyle==='exam_style')*3+Number(includeQuick&&(question.estimatedTimeSeconds??60)<=45)*2+Number(question.status==='approved')+Math.random()
  const regenerate=()=>generateQuiz()
  const balanceDifficulty=()=>{
    const allCandidates=questionBank.filter(question=>selectedPointIds.includes(question.syllabusPointId)&&selectedTypes.includes(question.type)&&!selected.includes(question.id))
    const desired=selected.map((_,index)=>['foundation','standard','extension'][index%3] as Difficulty)
    const next=[...selectedQuestions]
    desired.forEach((difficulty,index)=>{if(next[index]?.difficulty===difficulty)return;const samePoint=allCandidates.find(question=>question.difficulty===difficulty&&question.syllabusPointId===next[index]?.syllabusPointId&&!next.some(item=>item.id===question.id));const any=allCandidates.find(question=>question.difficulty===difficulty&&!next.some(item=>item.id===question.id));if(samePoint||any)next[index]=samePoint??any!})
    setSelected(next.map(question=>question.id));setGenerationNote('Difficulty balance refreshed while preserving syllabus coverage where possible.')
  }
  const replaceWeak=()=>{
    const next=[...selectedQuestions]
    let replacements=0
    next.forEach((question,index)=>{const rate=getSuccess(question);const weak=getQuality(question)==='needs_review'||(rate!==null&&rate<.5);if(!weak)return;const replacement=questionBank.find(candidate=>candidate.syllabusPointId===question.syllabusPointId&&!next.some(item=>item.id===candidate.id)&&candidate.status==='approved'&&candidate.difficulty===question.difficulty);if(replacement){next[index]=replacement;replacements++}})
    setSelected(next.map(question=>question.id));setGenerationNote(replacements?`Replaced ${replacements} lower-confidence question${replacements===1?'':'s'}.`:'No lower-confidence questions were found in this quiz.')
  }
  const openReplacement=(question:Question)=>{setReplacementTarget(question.id);const candidate=questionBank.find(item=>item.syllabusPointId===question.syllabusPointId&&!selected.includes(item.id));setPreviewQuestion(candidate??question)}
  const replaceWithPreview=()=>{if(!previewQuestion||!replacementTarget||selected.includes(previewQuestion.id))return;setSelected(current=>current.map(id=>id===replacementTarget?previewQuestion.id:id));setReplacementTarget('');setPreviewQuestion(null)}
  const findVariant=(direction:'easier'|'harder')=>{if(!previewQuestion)return;const current=difficultyOrder.indexOf(previewQuestion.difficulty);const target=difficultyOrder[current+(direction==='easier'?-1:1)];if(!target)return;const variant=questionBank.find(question=>question.syllabusPointId===previewQuestion.syllabusPointId&&question.difficulty===target&&question.id!==previewQuestion.id);if(variant)setPreviewQuestion(variant)}
  const addSimilar=()=>{if(!previewQuestion)return;const similar=questionBank.find(question=>question.syllabusPointId===previewQuestion.syllabusPointId&&question.id!==previewQuestion.id&&!selected.includes(question.id));if(similar)setSelected(current=>[...current,similar.id])}

  const submit=async(event:FormEvent)=>{
    event.preventDefault()
    if(!title.trim()||!selected.length||saving)return
    setSaving(true)
    setSaveError('')
    try{
      const quiz=await actions.createQuiz({courseId:selectedCourseId,title:title.trim(),mode:deliveryMode,questionIds:selected,settings:{...DEFAULT_QUIZ_SETTINGS,calculatorAllowed:calculatorChoice!=='not_allowed',showLeaderboard,enablePowerups,enableStreakBonuses,showExplanations,timeLimitSeconds:timeLimit,pointsMode}})
      actions.logUsage('quiz_created')
      navigate(`/teacher/quizzes/${quiz.id}`)
    }catch(caught){
      setSaveError(caught instanceof Error?caught.message:'Could not save this quiz.')
    }finally{setSaving(false)}
  }
  const changeMode=(next:BuilderMode)=>{setBuilderMode(next);setStage('compose');setReplacementTarget('')}
  const goToReview=()=>{if(selected.length)setStage('review')}

  const selectedMetrics=buildMetrics(selectedQuestions)
  const weakRows=buildWeakRows(questionBank,state.attempts,coursePoints).slice(0,6)

  return <form onSubmit={submit} className="commercial-builder">
    <PageHeader eyebrow="Quiz builder" title={stage==='settings'?'Set the classroom experience':stage==='review'?'Review and refine your quiz':'Build from the syllabus'} description={stage==='settings'?'Choose delivery, pace, feedback, and game mechanics.':stage==='review'?'Check coverage and balance, then replace or add individual questions.':'Generate a useful first draft in seconds, with full question-level control when you need it.'} actions={<Link className="button tertiary" to="/teacher/dashboard"><ArrowLeft/>Cancel</Link>}/>
    {saveError&&<div className="alert danger">{saveError} Check that the selected questions exist in Supabase, then try again.</div>}
    <div className="commercial-builder-steps"><button type="button" className={stage==='compose'?'active':'done'} onClick={()=>setStage('compose')}><span>{stage==='compose'?1:<Check/>}</span>Build</button><i/><button type="button" className={stage==='review'?'active':stage==='settings'?'done':''} disabled={!selected.length} onClick={goToReview}><span>{stage==='settings'?<Check/>:2}</span>Review <b>{selected.length||''}</b></button><i/><button type="button" className={stage==='settings'?'active':''} disabled={!selected.length} onClick={()=>setStage('settings')}><span>3</span>Settings</button></div>

    {stage!=='settings'&&<nav className="builder-mode-tabs" aria-label="Builder modes">
      <button type="button" className={builderMode==='quick'?'active':''} onClick={()=>changeMode('quick')}><Sparkles/><span><b>Quick Build</b><small>Generate from syllabus</small></span></button>
      <button type="button" className={builderMode==='manual'?'active':''} onClick={()=>changeMode('manual')}><ListPlus/><span><b>Manual Select</b><small>Choose every question</small></span></button>
      <button type="button" className={builderMode==='reports'?'active':''} onClick={()=>changeMode('reports')}><BarChart3/><span><b>From Reports / Weak Areas</b><small>Respond to class evidence</small></span></button>
      <button type="button" className={builderMode==='import'?'active':''} onClick={()=>changeMode('import')}><FileJson/><span><b>Import / Paste Questions</b><small>Bring in a prepared set</small></span></button>
    </nav>}

    {stage==='compose'&&builderMode==='quick'&&<div className="builder-workspace">
      <main className="quick-build-panel panel">
        <section className="builder-section"><div className="builder-section-head"><span>1</span><div><h2>Choose the syllabus coverage</h2><p>Start with what you are teaching. Question counts update from the selected course bank.</p></div></div><label className="builder-course-field">Course<select value={selectedCourseId} onChange={event=>changeCourse(event.target.value)}>{courses.map(course=><option value={course.id} key={course.id}>{course.displayName}</option>)}</select></label><div className="topic-selector">{[1,2,3,4,5].map(topic=><button type="button" className={selectedTopic===topic?'active':''} style={{'--topic-color':topicColors[topic]} as React.CSSProperties} onClick={()=>setSelectedTopic(topic)} key={topic}><b>0{topic}</b><span>{coursePoints.find(point=>point.topicNumber===topic)?.topicName}</span></button>)}</div><div className="point-picker-head"><span>{selectedPointIds.length} point{selectedPointIds.length===1?'':'s'} selected · {activeCourse.shortName}</span><div><button type="button" onClick={()=>setSelectedPointIds(current=>[...new Set([...current,...topicPoints.map(point=>point.id)])])}>Select topic</button><button type="button" onClick={()=>setSelectedPointIds(current=>current.filter(id=>!topicPoints.some(point=>point.id===id)))}>Clear topic</button></div></div><div className="syllabus-point-picker">{topicPoints.map(point=>{const checked=selectedPointIds.includes(point.id);return <button type="button" className={checked?'selected':''} onClick={()=>togglePoint(point.id)} key={point.id}><span className="point-check">{checked&&<Check/>}</span><span><b>{point.code}</b><small>{point.title}</small></span><strong>{pointCounts.get(point.id)??0}<small>questions</small></strong></button>})}</div></section>
        <section className="builder-section"><div className="builder-section-head"><span>2</span><div><h2>Set the shape of the quiz</h2><p>Choose a proven classroom pattern or tune the mix yourself.</p></div></div><div className="quiz-preset-grid">{(Object.keys(presetDetails) as QuizPreset[]).map(value=>{const detail=presetDetails[value];return <button type="button" className={preset===value?'selected':''} onClick={()=>choosePreset(value)} key={value}><span>{preset===value?<Check/>:<Target/>}</span><b>{detail.label}</b><small>{detail.description}</small><em>{detail.count} questions</em></button>})}</div><div className="quick-config-grid"><label>Number of questions<div className="count-stepper"><button type="button" onClick={()=>{setQuestionCount(Math.max(3,questionCount-1));setPreset('custom')}}><Minus/></button><b>{questionCount}</b><button type="button" onClick={()=>{setQuestionCount(Math.min(40,questionCount+1));setPreset('custom')}}><Plus/></button></div></label><fieldset><legend>Difficulty mix</legend><div className="choice-chips">{(['foundation','standard','extension','mixed'] as DifficultyChoice[]).map(value=><button type="button" className={difficultyChoice===value?'active':''} onClick={()=>{setDifficultyChoice(value);setPreset('custom')}} key={value}>{titleCase(value)}</button>)}</div></fieldset><fieldset><legend>Calculator</legend><div className="choice-chips">{(['allowed','not_allowed','mixed'] as CalculatorChoice[]).map(value=><button type="button" className={calculatorChoice===value?'active':''} onClick={()=>setCalculatorChoice(value)} key={value}>{value==='not_allowed'?'Not allowed':titleCase(value)}</button>)}</div></fieldset></div><fieldset className="question-type-choice"><legend>Question types</legend><div>{quickTypes.map(type=><button type="button" className={selectedTypes.includes(type)?'active':''} onClick={()=>toggleType(type)} key={type}>{shortType(type)}<small>{titleCase(type)}</small></button>)}</div></fieldset><div className="builder-toggle-grid"><Toggle label="Avoid recently used questions" detail="Prefer questions not used in the last 30 days" checked={avoidRecent} onChange={setAvoidRecent}/><Toggle label="Include worked solutions" detail="Only choose questions with explanations" checked={includeSolutions} onChange={setIncludeSolutions}/><Toggle label="Include exam-style questions" detail="Prioritise longer assessment-style items" checked={includeExamStyle} onChange={setIncludeExamStyle}/><Toggle label="Include quick classroom questions" detail="Keep some items under 45 seconds" checked={includeQuick} onChange={setIncludeQuick}/></div>{generationNote&&<div className="builder-note"><Sparkles/>{generationNote}</div>}<button type="button" className="generate-quiz-button" disabled={!selectedPointIds.length||!selectedTypes.length} onClick={generateQuiz}><Sparkles/>Generate quiz from selected syllabus<ArrowRight/></button></section>
      </main>
      <BuilderOutline questions={selectedQuestions} metrics={selectedMetrics} onRemove={id=>setSelected(current=>current.filter(item=>item!==id))} onReview={goToReview} onContinue={()=>setStage('settings')} mobileOpen={mobileOutlineOpen} onMobileClose={()=>setMobileOutlineOpen(false)}/>
    </div>}

    {stage==='compose'&&builderMode==='manual'&&<div className="builder-workspace manual-workspace">
      <main className="manual-bank panel">
        <div className="manual-bank-head">
          <div><span className="eyebrow">Question bank</span><h2>Choose individual questions</h2><p>{manualBank.length} questions match the current filters.</p></div>
          <button type="button" className="button secondary filter-toggle" onClick={()=>setMobileFiltersOpen(value=>!value)}><Filter/>Filters</button>
        </div>
        <div className={`manual-filter-panel ${mobileFiltersOpen?'open':''}`}>
          <label className="manual-search"><Search/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search question stems or syllabus codes…"/></label>
          <div className="advanced-filter-grid">
            <FilterSelect label="Course" value={selectedCourseId} onChange={changeCourse} options={courses.map(course=>[course.id,course.shortName])}/>
            <FilterSelect label="Syllabus point" value={pointFilter} onChange={setPointFilter} options={[['all','All points'],...coursePoints.map(point=>[point.id,`${point.code} · ${point.title}`])]}/>
            <FilterSelect label="Difficulty" value={difficultyFilter} onChange={setDifficultyFilter} options={[['all','All difficulties'],['foundation','Foundation'],['standard','Standard'],['extension','Extension']]}/>
            <FilterSelect label="Question type" value={typeFilter} onChange={setTypeFilter} options={[['all','All types'],...allQuestionTypes.map(type=>[type,titleCase(type)])]}/>
            <FilterSelect label="Calculator" value={calculatorFilter} onChange={setCalculatorFilter} options={[['all','Any calculator setting'],['allowed','Allowed'],['not_allowed','Not allowed'],['neutral','Neutral']]}/>
            <FilterSelect label="Marks" value={marksFilter} onChange={setMarksFilter} options={[['all','Any marks'],['1','1 mark'],['2','2 marks'],['3+','3+ marks']]}/>
            <FilterSelect label="Source" value={sourceFilter} onChange={setSourceFilter} options={[['all','Any source'],['platform_seed','MathPulse bank'],['manual','Teacher authored'],['chatgpt_import','AI import']]}/>
            <FilterSelect label="Used recently" value={recentFilter} onChange={setRecentFilter} options={[['all','Any usage'],['no','Not recently used'],['yes','Used recently']]}/>
            <FilterSelect label="Quality status" value={qualityFilter} onChange={setQualityFilter} options={[['all','Any quality'],['checked','Checked'],['teacher_approved','Teacher approved'],['ai_generated','AI-generated'],['needs_review','Needs review']]}/>
            <FilterSelect label="Student success" value={successFilter} onChange={setSuccessFilter} options={[['all','Any success rate'],['under_50','Below 50%'],['50_79','50–79%'],['80_plus','80%+']]}/>
          </div>
          <div className="filter-footer"><span>{activeFilterCount({search,pointFilter,difficultyFilter,typeFilter,calculatorFilter,marksFilter,sourceFilter,recentFilter,qualityFilter,successFilter})} active filters</span><button type="button" onClick={resetFilters}>Clear all</button></div>
        </div>
        <div className="manual-question-list">{manualQuestions.map(question=><ManualQuestionCard key={question.id} question={question} selected={selected.includes(question.id)} success={getSuccess(question)} usage={usageByQuestion.get(question.id)} source={getSource(question)} quality={getQuality(question)} onPreview={()=>{setReplacementTarget('');setPreviewQuestion(question)}} onToggle={()=>toggleSelected(question.id)}/>)}{manualLimit<manualBank.length&&<button type="button" className="manual-load-more" onClick={()=>setManualLimit(value=>value+60)}>Show more questions <small>{manualBank.length-manualLimit} remaining</small></button>}{!manualBank.length&&<EmptyState title="No questions match these filters" body="Clear a filter or broaden the syllabus selection to see more of the bank." action={<button type="button" className="button secondary" onClick={resetFilters}>Clear filters</button>}/>}</div>
      </main>
      <BuilderOutline questions={selectedQuestions} metrics={selectedMetrics} onRemove={id=>setSelected(current=>current.filter(item=>item!==id))} onReview={goToReview} onContinue={()=>setStage('settings')} mobileOpen={mobileOutlineOpen} onMobileClose={()=>setMobileOutlineOpen(false)}/>
    </div>}

    {stage==='compose'&&builderMode==='reports'&&<div className="report-builder panel"><div className="report-builder-intro"><span><BarChart3/></span><div><span className="eyebrow">Evidence-led builder</span><h2>Turn weak areas into tomorrow’s quiz</h2><p>Select syllabus points with the lowest recent accuracy, then generate a balanced retrieval set.</p></div></div>{weakRows.length?<div className="weak-area-grid">{weakRows.map(row=>{const checked=selectedPointIds.includes(row.point.id);return <button type="button" className={checked?'selected':''} onClick={()=>togglePoint(row.point.id)} key={row.point.id}><span className="point-check">{checked&&<Check/>}</span><SyllabusChip id={row.point.id}/><strong>{Math.round(row.accuracy*100)}%</strong><small>{row.total} responses</small><i><b style={{width:`${Math.round(row.accuracy*100)}%`,background:topicColors[row.point.topicNumber]}}/></i></button>})}</div>:<EmptyState title="No assessment evidence yet" body="Once students answer questions, their weakest syllabus points will appear here."/>}<div className="report-builder-actions"><Link className="button secondary" to={`/reports/class/${state.classes[0]?.id??''}`}>Open full class report</Link><button type="button" className="button primary" disabled={!selectedPointIds.length} onClick={()=>{setBuilderMode('quick');setStage('compose')}}>Build from selected weak areas <ArrowRight/></button></div></div>}

    {stage==='compose'&&builderMode==='import'&&<div className="import-builder panel"><div className="import-builder-visual"><FileJson/><span>JSON</span></div><div><span className="eyebrow">Bring your own set</span><h2>Paste, validate, and review before it reaches a quiz.</h2><p>The import workspace checks syllabus codes, answer structures, duplicates, marks, timing, and question metadata. Imported questions remain drafts until you approve them.</p><div className="import-builder-actions"><Link className="button primary" to="/teacher/questions/import"><Copy/>Paste question JSON</Link><Link className="button secondary" to="/teacher/questions/prompt-generator"><Sparkles/>Generate a ChatGPT prompt</Link></div><small>After import, return to Manual Select to add individual drafts or approved questions.</small></div></div>}

    {stage==='review'&&<div className="builder-workspace review-workspace"><main className="review-panel"><div className="review-toolbar panel"><div><span className="eyebrow">Generated draft</span><h2>{title||'Untitled quiz'}</h2><p>{generationNote||'Review the sequence, open any question, or rebalance automatically.'}</p></div><div><button type="button" className="button secondary" onClick={regenerate}><RefreshCw/>Regenerate all</button><button type="button" className="button secondary" onClick={replaceWeak}><Target/>Replace weak questions</button><button type="button" className="button secondary" onClick={balanceDifficulty}><Settings2/>Balance difficulty</button><button type="button" className="button secondary" onClick={()=>{setBuilderMode('manual');setStage('compose')}}><Plus/>Add question</button></div></div><div className="review-question-list">{selectedQuestions.map((question,index)=><article className="review-question-card panel" key={question.id}><div className="review-order"><GripVertical/><b>{index+1}</b></div><button type="button" className="review-question-main" onClick={()=>{setReplacementTarget('');setPreviewQuestion(question)}}><div className="question-card-top"><SyllabusChip id={question.syllabusPointId}/><StatusPill tone={question.difficulty==='extension'?'warning':question.difficulty==='foundation'?'info':'neutral'}>{titleCase(question.difficulty)}</StatusPill></div><h3>{question.prompt}</h3><div className="question-card-meta"><span>{titleCase(question.type)}</span><span><Calculator/>{calculatorLabel(question.calculator)}</span><span>{question.marksEstimate??1} mark{(question.marksEstimate??1)===1?'':'s'}</span><span><Clock3/>{question.estimatedTimeSeconds??60}s</span></div></button><div className="review-question-actions"><button type="button" onClick={()=>openReplacement(question)}><RefreshCw/>Replace question</button><button type="button" onClick={()=>setSelected(current=>current.filter(id=>id!==question.id))}><Trash2/>Remove</button></div></article>)}{!selectedQuestions.length&&<EmptyState title="This draft is empty" body="Return to Quick Build or Manual Select to add questions."/>}</div></main><BuilderOutline questions={selectedQuestions} metrics={selectedMetrics} onRemove={id=>setSelected(current=>current.filter(item=>item!==id))} onReview={goToReview} onContinue={()=>setStage('settings')} reviewMode mobileOpen={mobileOutlineOpen} onMobileClose={()=>setMobileOutlineOpen(false)}/></div>}

    {stage==='settings'&&<SettingsStage title={title} setTitle={setTitle} deliveryMode={deliveryMode} setDeliveryMode={setDeliveryMode} timeLimit={timeLimit} setTimeLimit={setTimeLimit} pointsMode={pointsMode} setPointsMode={setPointsMode} showLeaderboard={showLeaderboard} setShowLeaderboard={setShowLeaderboard} enablePowerups={enablePowerups} setEnablePowerups={setEnablePowerups} enableStreakBonuses={enableStreakBonuses} setEnableStreakBonuses={setEnableStreakBonuses} showExplanations={showExplanations} setShowExplanations={setShowExplanations} selectedQuestions={selectedQuestions} metrics={selectedMetrics} saving={saving} onBack={()=>setStage('review')}/>}

    {stage!=='settings'&&<div className="builder-mobile-summary"><button type="button" onClick={()=>setMobileOutlineOpen(true)}><span><b>{selected.length}</b> selected · {selectedMetrics.minutes} min · {selectedMetrics.marks} marks</span><ChevronDown/></button>{stage==='compose'?<button type="button" disabled={!selected.length} onClick={goToReview}>Review quiz</button>:<button type="button" disabled={!selected.length} onClick={()=>setStage('settings')}>Continue</button>}</div>}
    {previewQuestion&&<QuestionPreviewDrawer question={previewQuestion} selected={selected.includes(previewQuestion.id)} replacing={Boolean(replacementTarget)} replacementBlocked={selected.includes(previewQuestion.id)} success={getSuccess(previewQuestion)} similarCount={questionBank.filter(question=>question.syllabusPointId===previewQuestion.syllabusPointId&&question.id!==previewQuestion.id).length} onClose={()=>{setPreviewQuestion(null);setReplacementTarget('')}} onToggle={()=>toggleSelected(previewQuestion.id)} onReplace={replaceWithPreview} onEasier={()=>findVariant('easier')} onHarder={()=>findVariant('harder')} onSimilar={addSimilar}/>} 
  </form>
}

function Toggle({label,detail,checked,onChange}:{label:string;detail:string;checked:boolean;onChange:(value:boolean)=>void}){return <label className="builder-toggle"><input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)}/><span className="toggle-track"><i/></span><span><b>{label}</b><small>{detail}</small></span></label>}

function FilterSelect({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:string[][]}){return <label><span>{label}</span><div><select value={value} onChange={event=>onChange(event.target.value)}>{options.map(([key,text])=><option value={key} key={key}>{text}</option>)}</select><ChevronDown/></div></label>}

function ManualQuestionCard({question,selected,success,usage,source,quality,onPreview,onToggle}:{question:Question;selected:boolean;success:number|null;usage?:{count:number;lastUsed?:string};source:string;quality:string;onPreview:()=>void;onToggle:()=>void}){
  const key=(event:KeyboardEvent<HTMLElement>)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();onPreview()}}
  return <article className={`manual-question-card ${selected?'selected':''}`} role="button" tabIndex={0} onClick={onPreview} onKeyDown={key}><div className="manual-question-select"><button type="button" aria-label={selected?'Remove from quiz':'Add to quiz'} onClick={event=>{event.stopPropagation();onToggle()}}>{selected?<Check/>:<Plus/>}</button></div><div className="manual-question-content"><div className="question-card-top"><SyllabusChip id={question.syllabusPointId}/><StatusPill tone={quality==='needs_review'?'warning':quality==='checked'?'success':'info'}>{titleCase(quality)}</StatusPill></div><h3>{question.prompt}</h3><div className="manual-question-meta"><span>{titleCase(question.difficulty)}</span><span>{titleCase(question.type)}</span><span><Calculator/>{calculatorLabel(question.calculator)}</span><span>{question.marksEstimate??1} mark{(question.marksEstimate??1)===1?'':'s'}</span><span><Clock3/>{question.estimatedTimeSeconds??60}s</span></div><div className="manual-question-evidence"><span>{source}</span><span>{usage?.count?`Used ${usage.count}×${usage.lastUsed?` · ${new Date(usage.lastUsed).toLocaleDateString()}`:''}`:'Not used before'}</span><span>{success===null?'Success rate —':`${Math.round(success*100)}% average success`}</span></div></div><ChevronRight className="manual-question-open"/></article>
}

function BuilderOutline({questions,metrics,onRemove,onReview,onContinue,reviewMode=false,mobileOpen,onMobileClose}:{questions:Question[];metrics:QuizMetrics;onRemove:(id:string)=>void;onReview:()=>void;onContinue:()=>void;reviewMode?:boolean;mobileOpen:boolean;onMobileClose:()=>void}){
  return <aside className={`commercial-outline panel ${mobileOpen?'mobile-open':''}`}><div className="outline-mobile-head"><b>Quiz outline</b><button type="button" onClick={onMobileClose}><X/></button></div><div className="outline-title"><div><span className="eyebrow">Quiz outline</span><h2>{questions.length} question{questions.length===1?'':'s'}</h2></div><span>~{metrics.minutes} min</span></div><div className="outline-kpis"><div><Clock3/><span><b>{metrics.minutes}</b><small>minutes</small></span></div><div><BookOpen/><span><b>{metrics.marks}</b><small>marks</small></span></div><div><Target/><span><b>{metrics.coverage}</b><small>points</small></span></div></div>{questions.length?<><BalanceBlock label="Difficulty balance" rows={metrics.difficulty}/><BalanceBlock label="Calculator balance" rows={metrics.calculator}/><BalanceBlock label="Question type balance" rows={metrics.types}/><div className="outline-coverage"><span>Syllabus coverage</span><div>{metrics.codes.map(code=><b key={code}>{code}</b>)}</div></div><div className="outline-mini-list">{questions.map((question,index)=><div key={question.id}><GripVertical/><b>{index+1}</b><span>{question.prompt}</span><button type="button" onClick={()=>onRemove(question.id)}><Trash2/></button></div>)}</div></>:<div className="outline-empty"><Sparkles/><b>Your quiz will appear here</b><p>Select syllabus points and generate a first draft, or add questions manually.</p></div>}<button type="button" className="button primary wide" disabled={!questions.length} onClick={reviewMode?onContinue:onReview}>{reviewMode?'Continue to settings':'Review quiz'}<ArrowRight/></button></aside>
}

function BalanceBlock({label,rows}:{label:string;rows:Array<{label:string;count:number;color:string}>}){const total=Math.max(1,rows.reduce((sum,row)=>sum+row.count,0));return <div className="outline-balance"><span>{label}</span><div className="balance-track">{rows.filter(row=>row.count).map(row=><i title={`${row.label}: ${row.count}`} style={{width:`${row.count/total*100}%`,background:row.color}} key={row.label}/>)}</div><small>{rows.filter(row=>row.count).map(row=>`${row.label} ${row.count}`).join(' · ')||'Not yet available'}</small></div>}

function QuestionPreviewDrawer({question,selected,replacing,replacementBlocked,success,similarCount,onClose,onToggle,onReplace,onEasier,onHarder,onSimilar}:{question:Question;selected:boolean;replacing:boolean;replacementBlocked:boolean;success:number|null;similarCount:number;onClose:()=>void;onToggle:()=>void;onReplace:()=>void;onEasier:()=>void;onHarder:()=>void;onSimilar:()=>void}){
  return <div className="question-drawer-scrim" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><aside className="question-preview-drawer"><header><div><span className="eyebrow">{replacing?'Choose a replacement':'Question preview'}</span><SyllabusChip id={question.syllabusPointId}/></div><button type="button" onClick={onClose}><X/></button></header><div className="preview-drawer-body"><div className="preview-meta"><StatusPill tone={question.difficulty==='extension'?'warning':'info'}>{titleCase(question.difficulty)}</StatusPill><span>{titleCase(question.type)}</span><span><Calculator/>{calculatorLabel(question.calculator)}</span><span>{question.marksEstimate??1} marks</span><span><Clock3/>{question.estimatedTimeSeconds??60}s</span></div><section className="preview-question"><span>Question</span><h2>{question.prompt}</h2>{question.options&&<div className="preview-options">{question.options.map(option=><div className={option.isCorrect?'correct':''} key={option.id}><b>{option.label}</b><span>{option.text}</span>{option.isCorrect&&<Check/>}</div>)}</div>}</section><section className="preview-answer"><span>Answer / markscheme</span><strong>{answerLabel(question)}</strong><p>{question.explanation}</p></section><section className="preview-teacher-notes"><div><span>Common mistakes</span><p>{question.questionStyle==='misconception'?question.explanation:'No common-mistake note has been added yet.'}</p></div><div><span>Teacher notes</span><p>No private teacher notes yet.</p></div></section><section className="preview-similar"><span>Bank evidence</span><div><b>{similarCount}</b><small>similar questions at this syllabus point</small></div><div><b>{success===null?'—':`${Math.round(success*100)}%`}</b><small>average student success</small></div></section></div><footer>{replacing?<button type="button" className="button primary" disabled={replacementBlocked} onClick={onReplace}><RefreshCw/>Replace selected question</button>:<button type="button" className={`button ${selected?'secondary':'primary'}`} onClick={onToggle}>{selected?<><Check/>Added to quiz</>:<><Plus/>Add to quiz</>}</button>}<div><button type="button" className="button tertiary" disabled={question.difficulty==='foundation'} onClick={onEasier}>Make easier</button><button type="button" className="button tertiary" disabled={question.difficulty==='extension'} onClick={onHarder}>Make harder</button><button type="button" className="button tertiary" disabled={!similarCount} onClick={onSimilar}>Add similar</button></div></footer></aside></div>
}

function SettingsStage(props:{title:string;setTitle:(value:string)=>void;deliveryMode:'live'|'assignment'|'practice';setDeliveryMode:(value:'live'|'assignment'|'practice')=>void;timeLimit:number;setTimeLimit:(value:number)=>void;pointsMode:PointsMode;setPointsMode:(value:PointsMode)=>void;showLeaderboard:boolean;setShowLeaderboard:(value:boolean)=>void;enablePowerups:boolean;setEnablePowerups:(value:boolean)=>void;enableStreakBonuses:boolean;setEnableStreakBonuses:(value:boolean)=>void;showExplanations:boolean;setShowExplanations:(value:boolean)=>void;selectedQuestions:Question[];metrics:QuizMetrics;saving:boolean;onBack:()=>void}){
  const p=props
  return <div className="settings-layout"><section className="panel quiz-settings"><div className="panel-head"><div><span className="eyebrow">Quiz details</span><h2>Classroom experience</h2></div></div><div className="form-stack"><label>Quiz title<input autoFocus required value={p.title} onChange={event=>p.setTitle(event.target.value)} placeholder="e.g. Functions checkpoint"/></label><fieldset><legend>Delivery mode</legend><div className="mode-cards"><button type="button" className={p.deliveryMode==='live'?'active':''} onClick={()=>p.setDeliveryMode('live')}><RadioTower/><b>Live</b><span>You control the pace</span></button><button type="button" className={p.deliveryMode==='assignment'?'active':''} onClick={()=>p.setDeliveryMode('assignment')}><Clock3/><b>Assignment</b><span>Complete by a deadline</span></button><button type="button" className={p.deliveryMode==='practice'?'active':''} onClick={()=>p.setDeliveryMode('practice')}><Users/><b>Practice</b><span>Reusable self-paced review</span></button></div></fieldset><div className="three-fields"><label>Time limit<select value={p.timeLimit} onChange={event=>p.setTimeLimit(Number(event.target.value))}><option value={15}>15 seconds</option><option value={30}>30 seconds</option><option value={45}>45 seconds</option><option value={60}>60 seconds</option><option value={90}>90 seconds</option></select></label><label>Points mode<select value={p.pointsMode} onChange={event=>p.setPointsMode(event.target.value as PointsMode)}><option value="standard">Standard</option><option value="speed_bonus">Speed bonus</option><option value="accuracy_only">Accuracy only</option></select></label><label>Feedback<select><option value="after_each">After each question</option><option value="after_completion">After completion</option><option value="teacher_controlled">Teacher controlled</option></select></label></div><div className="game-setting-grid"><ToggleSetting checked={p.showLeaderboard} onChange={p.setShowLeaderboard} icon={<Trophy/>} label="Leaderboard" detail="Show standings after each question"/><ToggleSetting checked={p.enablePowerups} onChange={p.setEnablePowerups} icon={<Shield/>} label="Powerups" detail="One of each per student"/><ToggleSetting checked={p.enableStreakBonuses} onChange={p.setEnableStreakBonuses} icon={<Flame/>} label="Streak bonuses" detail="Reward consistent accuracy"/><ToggleSetting checked={p.showExplanations} onChange={p.setShowExplanations} icon={<Check/>} label="Explanations" detail="Reveal teacher-checkable working"/></div></div></section><aside className="panel builder-summary"><div className="summary-icon"><Settings2/></div><span className="eyebrow">Ready to save</span><h2>{p.title||'Untitled quiz'}</h2><p>{p.selectedQuestions.length} questions across {p.metrics.coverage} syllabus points · approximately {p.metrics.minutes} minutes and {p.metrics.marks} marks.</p><ul><li><span>Mode</span><b>{titleCase(p.deliveryMode)}</b></li><li><span>Pace</span><b>{p.timeLimit}s per question</b></li><li><span>Scoring</span><b>{titleCase(p.pointsMode)}</b></li><li><span>Game tools</span><b>{p.enablePowerups?'Powerups on':'Classic play'}</b></li></ul><button className="button primary wide" disabled={!p.title.trim()||p.saving}><Check/>{p.saving?'Saving to Supabase…':'Save quiz'}</button><button type="button" className="button tertiary wide" onClick={p.onBack}>Back to review</button></aside></div>
}

function ToggleSetting({checked,onChange,icon,label,detail}:{checked:boolean;onChange:(value:boolean)=>void;icon:React.ReactNode;label:string;detail:string}){return <label><input type="checkbox" checked={checked} onChange={event=>onChange(event.target.checked)}/>{icon}<span><b>{label}</b><small>{detail}</small></span></label>}

interface QuizMetrics{minutes:number;marks:number;coverage:number;codes:string[];difficulty:Array<{label:string;count:number;color:string}>;calculator:Array<{label:string;count:number;color:string}>;types:Array<{label:string;count:number;color:string}>}
function buildMetrics(questions:Question[]):QuizMetrics{
  const count=(predicate:(question:Question)=>boolean)=>questions.filter(predicate).length
  const codes=[...new Set(questions.map(question=>{const point=syllabusById.get(question.syllabusPointId);return point?`${getCourse(point.courseId).shortName} ${point.code}`:undefined}).filter(Boolean) as string[])]
  return {minutes:Math.max(0,Math.ceil(questions.reduce((sum,question)=>sum+(question.estimatedTimeSeconds??60),0)/60)),marks:questions.reduce((sum,question)=>sum+(question.marksEstimate??1),0),coverage:codes.length,codes,difficulty:[{label:'Foundation',count:count(question=>question.difficulty==='foundation'),color:'#2f6fed'},{label:'Standard',count:count(question=>question.difficulty==='standard'),color:'#1f9d72'},{label:'Extension',count:count(question=>question.difficulty==='extension'),color:'#ed812f'}],calculator:[{label:'Allowed',count:count(question=>question.calculator==='allowed'),color:'#5a55d6'},{label:'Not allowed',count:count(question=>question.calculator==='not_allowed'),color:'#e64d6f'},{label:'Neutral',count:count(question=>(question.calculator??'neutral')==='neutral'),color:'#9aa5a0'}],types:[...new Set(questions.map(question=>question.type))].map((type,index)=>({label:shortType(type),count:count(question=>question.type===type),color:['#2f6fed','#1f9d72','#ed812f','#e64d6f','#5a55d6'][index%5]}))}
}

function buildWeakRows(questions:Question[],attempts:ReturnType<typeof useApp>['state']['attempts'],points:ReturnType<typeof syllabusForCourse>){return points.map(point=>{const ids=new Set(questions.filter(question=>question.syllabusPointId===point.id).map(question=>question.id));const answers=attempts.flatMap(attempt=>attempt.answers).filter(answer=>ids.has(answer.questionId));return {point,total:answers.length,accuracy:answers.length?answers.filter(answer=>answer.isCorrect).length/answers.length:0}}).filter(row=>row.total).sort((a,b)=>a.accuracy-b.accuracy||b.total-a.total)}

function activeFilterCount(filters:Record<string,string>){return Object.entries(filters).filter(([key,value])=>key==='search'?Boolean(value):value!=='all').length}
function shortType(type:QuestionType){return type==='multiple_choice'?'MCQ':type==='numeric_answer'?'Numeric':type==='short_answer'?'Short':type==='multi_select'?'Multi-select':titleCase(type)}
function calculatorLabel(value?:CalculatorMode){return value==='allowed'?'Allowed':value==='not_allowed'?'No calculator':'Neutral'}
function answerLabel(question:Question){const data=question.answerData;if(question.type==='multi_select')return (data.answers as string[]??[]).join(' · ');if(question.type==='matching')return (data.pairs as Array<{left:string;right:string}>??[]).map(pair=>`${pair.left} → ${pair.right}`).join(' · ');if(question.type==='ordering')return (data.correctOrder as string[]??[]).join(' → ');if(question.type==='drag_drop')return (data.items as Array<{text:string;correctZone:string}>??[]).map(item=>`${item.text} → ${item.correctZone}`).join(' · ');if(question.type==='true_false')return data.answer?'True':'False';return String(data.answer??'Teacher-reviewed response')}

export function QuizDetailPage(){
  const {id}=useParams();const {state,actions}=useApp();const navigate=useNavigate();const quiz=state.quizzes.find(q=>q.id===id);const compatibleClasses=quiz?state.classes.filter(item=>item.courseId===quiz.courseId):[];const [classId,setClassId]=useState(compatibleClasses[0]?.id??'');const [launching,setLaunching]=useState(false);const [launchError,setLaunchError]=useState('');if(!quiz)return <EmptyState title="Quiz not found" body="It may have been archived or removed."/>
  const launch=async()=>{setLaunching(true);setLaunchError('');try{const session=await actions.launchSession(quiz.id,classId||undefined);navigate(`/teacher/live/${session.id}/control`)}catch(error){setLaunchError(error instanceof Error?error.message:'Could not create the live game.')}finally{setLaunching(false)}}
  return <><PageHeader eyebrow={`${getCourse(quiz.courseId).shortName} / ${titleCase(quiz.mode)}`} title={quiz.title} description={`${quiz.questionIds.length} questions · Created ${new Date(quiz.createdAt).toLocaleDateString()}`} actions={<><button className="button secondary"><Settings2/>Edit settings</button><button className="button primary" onClick={()=>void launch()} disabled={launching}><Play/>{launching?'Creating PIN…':'Launch live'}</button></>}/><div className="quiz-detail-grid"><section className="panel quiz-outline"><div className="panel-head"><div><span className="eyebrow">Sequence</span><h2>Questions</h2></div><button className="button tertiary small"><Plus/>Add questions</button></div>{quiz.questionIds.map((qid,i)=>{const q=state.questions.find(item=>item.id===qid);if(!q)return null;return <div className="outline-row" key={qid}><b>{i+1}</b><div><strong>{q.prompt}</strong><span><SyllabusChip id={q.syllabusPointId}/><small>{titleCase(q.type)} · {titleCase(q.difficulty)}</small></span></div><span><Clock3/>{quiz.settings.timeLimitSeconds} sec</span><span>{titleCase(quiz.settings.pointsMode)}</span></div>})}</section><aside><section className="panel launch-card"><span className="launch-icon"><RadioTower/></span><span className="eyebrow">{getCourse(quiz.courseId).shortName} classroom mode</span><h2>Start a live session</h2><p>Students join on their own devices while you control the projector view.</p>{compatibleClasses.length?<label>Class <select value={classId} onChange={e=>setClassId(e.target.value)}>{compatibleClasses.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>:<p className="form-hint">No {getCourse(quiz.courseId).shortName} class is available. You can still launch without a linked class.</p>}{launchError&&<div className="alert danger">{launchError}</div>}<button className="button coral wide" onClick={()=>void launch()} disabled={launching}><Play/>{launching?'Creating secure PIN…':'Create game PIN'}</button></section><section className="panel quiz-meta"><div><span>Course</span><b>{getCourse(quiz.courseId).shortName}</b></div><div><span>Status</span><StatusPill tone="success">Ready</StatusPill></div><div><span>Leaderboard</span><b>{quiz.settings.showLeaderboard?'After each question':'Hidden'}</b></div><div><span>Powerups</span><b>{quiz.settings.enablePowerups?'Enabled':'Off'}</b></div><div><span>Streak bonuses</span><b>{quiz.settings.enableStreakBonuses?'Enabled':'Off'}</b></div><div><span>Explanations</span><b>{quiz.settings.showExplanations?'After reveal':'Hidden'}</b></div></section></aside></div></>
}
