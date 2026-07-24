import { useMemo, useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, ClipboardPaste, Code2, FileClock, FileJson, Pencil, RotateCcw, Upload, XCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader, StatusPill, titleCase } from '../components/UI'
import { importQuestionToRecord, validateImport, type ImportQuestionInput, type ValidationResult } from '../lib/importValidator'
import { checkPlanGate } from '../lib/plans'
import { useApp } from '../state/AppContext'

const sample=`{
  "format": "math_quiz_import_v1.1",
  "courseFamily": "analysis_approaches",
  "courseLevel": "SL",
  "course": "IB Mathematics: Analysis and Approaches SL",
  "source": "chatgpt",
  "questions": [
    {
      "type": "multiple_choice",
      "syllabusCode": "SL 2.5",
      "difficulty": "standard",
      "questionStyle": "procedural",
      "calculator": "not_allowed",
      "estimatedTimeSeconds": 45,
      "marksEstimate": 2,
      "prompt": "If f(x)=2x+3 and g(x)=x^2, find (f∘g)(2).",
      "choices": ["7", "8", "11", "14"],
      "answer": "11",
      "explanation": "g(2)=4, so f(g(2))=11.",
      "tags": ["composite functions", "function notation"]
    }
  ]
}`

export function ImportPage(){
  const {state,actions}=useApp();const navigate=useNavigate();const [raw,setRaw]=useState(sample);const [result,setResult]=useState<ValidationResult|null>(null);const [tab,setTab]=useState<'paste'|'history'>('paste');const [editing,setEditing]=useState<number|null>(null);const [rowJson,setRowJson]=useState('');const [confirmDuplicates,setConfirmDuplicates]=useState(false);const [saved,setSaved]=useState(false);const [choiceCount,setChoiceCount]=useState(4)
  const gate=checkPlanGate(state,'imports'); const duplicateCount=result?.rows.filter(r=>r.valid&&r.duplicate).length??0
  const runValidation=()=>{setSaved(false);setResult(validateImport(raw,state.questions.map(q=>q.prompt),{multipleChoiceChoiceCount:choiceCount}))}
  const openEdit=(index:number)=>{const doc=JSON.parse(raw);setEditing(index);setRowJson(JSON.stringify(doc.questions[index],null,2))}
  const applyEdit=()=>{try{const doc=JSON.parse(raw);doc.questions[editing!]=JSON.parse(rowJson);const next=JSON.stringify(doc,null,2);setRaw(next);setResult(validateImport(next,state.questions.map(q=>q.prompt),{multipleChoiceChoiceCount:choiceCount}));setEditing(null)}catch{/* textarea remains open for correction */}}
  const importRows=()=>{if(!result?.document||!result.courseFamily||result.globalErrors.length||!gate.allowed)return;const rows=result.rows.filter(row=>row.valid&&(!row.duplicate||confirmDuplicates));const batchId=crypto.randomUUID();const records=rows.map(row=>({...importQuestionToRecord(row.question,state.user?.id??'teacher-demo',result.courseFamily),importBatchId:batchId,duplicateConfirmed:row.duplicate&&confirmDuplicates}));actions.addQuestions(records);if(result.courseId)actions.setActiveCourse(result.courseId);const status=result.invalidCount?'partially_valid':'imported';actions.addImportBatch({id:batchId,createdAt:new Date().toISOString(),status,importedCount:records.length,errorCount:result.invalidCount,validationErrors:result.rows.filter(r=>r.errors.length).map(r=>({index:r.index,errors:r.errors}))},result.document);actions.logUsage('import_batch');setSaved(true)}
  return <>
    <PageHeader eyebrow="Question bank / Import" title="Import ChatGPT JSON" description="Validate v1 or v1.1 against the real syllabus before anything is saved." actions={<Link className="button secondary" to="/teacher/questions/prompt-generator"><Code2 size={17}/>Build a prompt</Link>}/>
    <div className="stepper"><div className={!result?'active':'done'}><span>{result?<Check/>:1}</span><b>Paste JSON</b></div><i/><div className={result?'active':''}><span>2</span><b>Validate & preview</b></div><i/><div className={saved?'done':''}><span>{saved?<Check/>:3}</span><b>Save drafts</b></div></div>
    <section className="panel import-panel"><div className="bank-tabs"><button className={tab==='paste'?'active':''} onClick={()=>setTab('paste')}><ClipboardPaste/>New import</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}><FileClock/>Batch history <span>{state.importBatches.length}</span></button></div>{tab==='history'?<ImportHistory/>:<>
      <div className="import-layout"><div className="json-editor-wrap"><div className="editor-toolbar"><span><FileJson/>JSON input</span><button onClick={()=>{setRaw(sample);setResult(null)}}><RotateCcw/>Reset sample</button></div><textarea className="json-editor" spellCheck={false} value={raw} onChange={e=>{setRaw(e.target.value);setResult(null)}} aria-label="Paste MathQuiz JSON"/><div className="editor-status"><span>{raw.split('\n').length} lines</span><span>{result?.format?.replace('math_quiz_import_','MathQuiz ')??'MathQuiz v1 / v1.1'}</span></div></div><aside className="format-guide"><div className="guide-icon"><Code2/></div><h3>Before you validate</h3><ul><li><CheckCircle2/>Use <code>math_quiz_import_v1.1</code></li><li><CheckCircle2/>Map every item to an existing code</li><li><CheckCircle2/>Keep answers exact and checkable</li><li><CheckCircle2/>All nine playable types are supported</li></ul><label className="choice-count-setting">Multiple-choice options<select value={choiceCount} onChange={e=>{setChoiceCount(Number(e.target.value));setResult(null)}}><option value={4}>4 (recommended)</option><option value={3}>3</option><option value={5}>5</option></select></label><Link to="/teacher/questions/prompt-generator">Generate a compliant prompt →</Link></aside></div>
      {!result&&<div className="import-actions"><span>Your JSON stays in this workspace until you save.</span><button className="button primary" onClick={runValidation}><Upload size={17}/>Validate questions</button></div>}
      {result&&<ValidationPreview result={result} onEdit={openEdit}/>} 
      {result&&<div className="import-actions preview-actions"><button className="button tertiary" onClick={()=>setResult(null)}>Back to editor</button><div>{duplicateCount>0&&<label className="checkbox"><input type="checkbox" checked={confirmDuplicates} onChange={e=>setConfirmDuplicates(e.target.checked)}/><span>Import {duplicateCount} exact duplicate{duplicateCount===1?'':'s'} anyway</span></label>}<button className="button primary" disabled={!gate.allowed||result.globalErrors.length>0||result.validCount===0||(duplicateCount===result.validCount&&!confirmDuplicates)} onClick={importRows}>{saved?<Check/>:<Upload size={17}/>} {saved?`${result.validCount} drafts saved`:`Save ${result.validCount-(confirmDuplicates?0:duplicateCount)} valid draft${result.validCount===1?'':'s'}`}</button></div></div>}
      {!gate.allowed&&<div className="alert warning">{gate.message} <Link to="/billing">Upgrade</Link></div>}
      {saved&&<div className="success-banner"><CheckCircle2/><div><b>Import complete</b><span>Questions were saved as private drafts so you can teacher-check them.</span></div><button className="button light" onClick={()=>navigate('/teacher/questions')}>Open question bank</button></div>}
    </>}</section>
    {editing!==null&&<div className="modal-scrim"><div className="row-json-modal"><header><div><span className="eyebrow">Edit imported item</span><h2>Question {editing+1}</h2></div><button className="icon-button" onClick={()=>setEditing(null)}><XCircle/></button></header><textarea className="json-editor" value={rowJson} onChange={e=>setRowJson(e.target.value)} spellCheck={false}/><footer><button className="button tertiary" onClick={()=>setEditing(null)}>Cancel</button><button className="button primary" onClick={applyEdit}>Apply & revalidate</button></footer></div></div>}
  </>
}

function ValidationPreview({result,onEdit}:{result:ValidationResult;onEdit:(index:number)=>void}){
  return <div className="validation-block"><div className="validation-summary"><div className={result.globalErrors.length?'error':'success'}>{result.globalErrors.length?<XCircle/>:<CheckCircle2/>}<div><b>{result.globalErrors.length?'Format needs attention':'Format recognized'}</b><span>{result.globalErrors.length?result.globalErrors.join(' '):`${result.validCount} of ${result.rows.length} questions passed validation.`}</span></div></div><div className="validation-counts"><span><b>{result.validCount}</b>Valid</span><span><b>{result.invalidCount}</b>Invalid</span><span><b>{result.rows.filter(r=>r.warnings.length).length}</b>Warnings</span></div></div>{result.rows.length>0&&<div className="preview-table"><div className="preview-row preview-head"><span>#</span><span>Question</span><span>Mapping</span><span>Result</span><span/></div>{result.rows.map(row=><div className="preview-row" key={row.index}><b>{row.index+1}</b><div><strong>{row.question.prompt||'Untitled question'}</strong><small>{titleCase(row.question.type||'unknown')} · {row.question.difficulty||'No difficulty'} · {titleCase(row.question.questionStyle||'unclassified')} · {row.question.estimatedTimeSeconds??'—'}s · {row.question.marksEstimate??'—'} marks</small>{[...row.errors,...row.warnings].map((msg,i)=><em className={i<row.errors.length?'error':'warning'} key={msg}><AlertTriangle/>{msg}</em>)}</div><span>{row.question.syllabusCode||'—'}</span><span><StatusPill tone={row.valid?(row.warnings.length?'warning':'success'):'danger'}>{row.valid?(row.warnings.length?'Check':'Valid'):'Invalid'}</StatusPill></span><button className="icon-button" onClick={()=>onEdit(row.index)} aria-label={`Edit question ${row.index+1}`}><Pencil/></button></div>)}</div>}</div>
}

function ImportHistory(){const {state}=useApp();return <div className="history-list">{state.importBatches.length===0?<div className="empty-inline"><FileClock/><h3>No import history yet</h3><p>Validated batches will appear here with error counts and timestamps.</p></div>:state.importBatches.map(batch=><div key={batch.id}><span className="batch-icon"><FileJson/></span><div><b>ChatGPT JSON batch</b><small>{new Date(batch.createdAt).toLocaleString()}</small></div><span>{batch.importedCount} imported</span><span>{batch.errorCount} errors</span><StatusPill tone={batch.status==='imported'?'success':'warning'}>{titleCase(batch.status)}</StatusPill></div>)}</div>}
