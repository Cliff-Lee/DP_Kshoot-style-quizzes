import { supabase } from './supabase'
import type { AppState, ClassRoom, ImportBatch, Question, Quiz, QuizSession, UsageEvent } from '../types'
import { DEFAULT_POWERUPS, normalizeQuizSettings } from './gameLogic'
import { reportSupabaseFailure } from './supabaseErrors'

const warn = (scope: string, error: unknown) => { if (error) console.warn(`[MathPulse:${scope}]`, error) }

export async function loadCloudWorkspace(): Promise<Omit<AppState,'user'|'activeCourseId'>> {
  if (!supabase) return {questions:[],classes:[],quizzes:[],sessions:[],attempts:[],importBatches:[],usageEvents:[]}
  const [questionsRes,classesRes,quizzesRes,sessionsRes,responsesRes,attemptsRes,batchesRes,usageRes] = await Promise.all([
    supabase.from('questions').select('*,question_options(*)').neq('status','archived').order('updated_at',{ascending:false}),
    supabase.from('classes').select('*,class_members(*)').eq('archived',false).order('created_at',{ascending:false}),
    supabase.from('quizzes').select('*,quiz_questions(*)').eq('archived',false).order('created_at',{ascending:false}),
    supabase.from('quiz_sessions').select('*,session_participants(id,student_id,nickname,score,joined_at,current_streak,best_streak,powerups,badges)').order('created_at',{ascending:false}).limit(30),
    supabase.from('live_responses').select('*').order('created_at',{ascending:false}),
    supabase.from('attempts').select('*,answers(*)').order('started_at',{ascending:false}),
    supabase.from('question_import_batches').select('*').order('created_at',{ascending:false}).limit(30),
    supabase.from('usage_events').select('*').order('created_at',{ascending:false}),
  ])
  ;[questionsRes,classesRes,quizzesRes,sessionsRes,responsesRes,attemptsRes,batchesRes,usageRes].forEach((res,i)=>warn(`load-${i}`,res.error))
  const questions:Question[]=(questionsRes.data??[]).map((q:any)=>({id:q.id,createdBy:q.created_by??'platform',visibility:q.visibility,status:q.status,courseId:q.course_id,syllabusPointId:q.syllabus_point_id,type:q.type,prompt:q.prompt,answerData:q.answer_data,explanation:q.explanation,difficulty:q.difficulty,questionStyle:q.question_style??'conceptual',calculator:q.calculator??'neutral',estimatedTimeSeconds:q.estimated_time_seconds??60,marksEstimate:q.marks_estimate??1,tags:q.tags??[],source:q.source,importBatchId:q.import_batch_id??undefined,duplicateConfirmed:q.duplicate_confirmed,createdAt:q.created_at,updatedAt:q.updated_at,options:(q.question_options??[]).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((o:any)=>({id:o.id,label:o.label,text:o.text,isCorrect:o.is_correct,sortOrder:o.sort_order}))}))
  const classes:ClassRoom[]=(classesRes.data??[]).map((c:any)=>({id:c.id,teacherId:c.teacher_id,name:c.name,courseId:c.course_id,joinCode:c.join_code,archived:c.archived,createdAt:c.created_at,members:(c.class_members??[]).map((m:any)=>({id:m.student_id,displayName:m.display_name,joinedAt:m.joined_at}))}))
  const quizzes:Quiz[]=(quizzesRes.data??[]).map((q:any)=>({id:q.id,teacherId:q.teacher_id,title:q.title,courseId:q.course_id,mode:q.mode,settings:normalizeQuizSettings(q.settings),createdAt:q.created_at,questionIds:(q.quiz_questions??[]).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((qq:any)=>qq.question_id)}))
  const responsesByParticipant=new Map<string,Record<string,any>>()
  for(const response of responsesRes.data??[]){
    const answers=responsesByParticipant.get(response.participant_id)??{}
    answers[response.question_id]={answer:response.submitted_answer,correct:Boolean(response.is_correct),responseTimeMs:response.response_time_ms,awardedPoints:Number(response.awarded_points),streakAfter:Number(response.score_detail?.streakAfter??0),powerupUsed:response.powerup_type??undefined,scoreDetail:{basePoints:0,speedBonus:0,streakBonus:0,multiplier:1,total:Number(response.awarded_points),effectiveResponseTimeMs:response.response_time_ms,shieldUsed:false,...(response.score_detail??{})}}
    responsesByParticipant.set(response.participant_id,answers)
  }
  const sessions:QuizSession[]=(sessionsRes.data??[]).map((s:any)=>({id:s.id,quizId:s.quiz_id,teacherId:s.teacher_id,classId:s.class_id??undefined,pin:s.pin,status:s.status,currentQuestionIndex:s.current_question_index,revealedQuestionIndex:s.revealed_question_index??-1,questionStartedAt:s.question_started_at??undefined,startedAt:s.started_at??undefined,endedAt:s.ended_at??undefined,participants:(s.session_participants??[]).map((p:any)=>({id:p.id,nickname:p.nickname,score:p.score,currentStreak:p.current_streak??0,bestStreak:p.best_streak??0,powerups:{...DEFAULT_POWERUPS,...(p.powerups??{})},badges:p.badges??[],powerupEvents:[],answers:responsesByParticipant.get(p.id)??{}}))}))
  const attempts=(attemptsRes.data??[]).map((a:any)=>({id:a.id,quizId:a.quiz_id,sessionId:a.session_id??undefined,studentId:a.student_id,studentName:'Student',classId:a.class_id??undefined,startedAt:a.started_at,completedAt:a.completed_at??undefined,score:Number(a.score),maxScore:Number(a.max_score),answers:(a.answers??[]).map((x:any)=>({questionId:x.question_id,submittedAnswer:x.submitted_answer,isCorrect:Boolean(x.is_correct),responseTimeMs:x.response_time_ms,awardedPoints:Number(x.awarded_points)}))}))
  const importBatches:ImportBatch[]=(batchesRes.data??[]).map((b:any)=>({id:b.id,createdAt:b.created_at,status:b.status,importedCount:b.imported_count,errorCount:b.error_count,validationErrors:b.validation_errors}))
  const usageEvents:UsageEvent[]=(usageRes.data??[]).map((u:any)=>({id:u.id,eventType:u.event_type,quantity:u.quantity,createdAt:u.created_at}))
  return {questions,classes,quizzes,sessions,attempts,importBatches,usageEvents}
}

export async function cloudCreateClass(item:ClassRoom){if(!supabase)return;const {error}=await supabase.from('classes').insert({id:item.id,teacher_id:item.teacherId,name:item.name,course_id:item.courseId,join_code:item.joinCode,archived:false});warn('create-class',error)}
export async function cloudSaveQuestions(items:Question[]){
  if(!supabase)return
  for(const item of items){
    if(item.importBatchId){
      const batchPlaceholder=await supabase.from('question_import_batches').upsert({id:item.importBatchId,teacher_id:item.createdBy,raw_json:{},status:'validated'},{onConflict:'id',ignoreDuplicates:true})
      warn('prepare-import-batch',batchPlaceholder.error)
    }
    const {error}=await supabase.from('questions').upsert({id:item.id,created_by:item.createdBy,owner_type:'teacher',owner_id:item.createdBy,visibility:item.visibility,status:item.status,course_id:item.courseId,syllabus_point_id:item.syllabusPointId,type:item.type,prompt:item.prompt,answer_data:item.answerData,explanation:item.explanation,difficulty:item.difficulty,question_style:item.questionStyle??'conceptual',calculator:item.calculator??'neutral',estimated_time_seconds:item.estimatedTimeSeconds??60,marks_estimate:item.marksEstimate??1,tags:item.tags,source:item.source,import_batch_id:item.importBatchId??null,duplicate_confirmed:item.duplicateConfirmed??false})
    warn('save-question',error)
    if(item.options){
      await supabase.from('question_options').delete().eq('question_id',item.id)
      const optionRes=await supabase.from('question_options').insert(item.options.map(o=>({id:o.id,question_id:item.id,label:o.label,text:o.text,is_correct:o.isCorrect,sort_order:o.sortOrder})))
      warn('save-options',optionRes.error)
    }
  }
}
export async function cloudPatchQuestion(id:string,patch:Record<string,unknown>){if(!supabase)return;const {error}=await supabase.from('questions').update(patch).eq('id',id);warn('patch-question',error)}
export async function cloudCreateQuiz(item:Quiz){if(!supabase)return;const {error}=await supabase.from('quizzes').insert({id:item.id,teacher_id:item.teacherId,title:item.title,course_id:item.courseId,mode:item.mode,settings:item.settings});warn('create-quiz',error);if(!error){const links=await supabase.from('quiz_questions').insert(item.questionIds.map((questionId,index)=>({quiz_id:item.id,question_id:questionId,sort_order:index,points:1000,time_limit_seconds:30})));warn('quiz-questions',links.error)}}
export async function cloudCreateSession(item:QuizSession){
  if(!supabase)return
  const {data,error}=await supabase.from('quiz_sessions').insert({id:item.id,quiz_id:item.quizId,teacher_id:item.teacherId,class_id:item.classId??null,pin:item.pin,status:item.status,current_question_index:item.currentQuestionIndex,revealed_question_index:item.revealedQuestionIndex??-1}).select('id,pin,status,quiz_id,teacher_id,class_id,created_at,updated_at').single()
  if(error)throw reportSupabaseFailure('live-session:create',error,{sessionId:item.id,quizId:item.quizId,pin:item.pin})
  if(!data||data.id!==item.id||String(data.pin).toUpperCase()!==item.pin.toUpperCase()){
    throw reportSupabaseFailure('live-session:create-verify',new Error('Inserted session could not be verified'),{sessionId:item.id,quizId:item.quizId,pin:item.pin})
  }
}
export async function cloudPatchSession(id:string,patch:Partial<QuizSession>){
  if(!supabase)return
  const payload:any={}
  if(patch.status!==undefined)payload.status=patch.status
  if(patch.currentQuestionIndex!==undefined)payload.current_question_index=patch.currentQuestionIndex
  if(patch.revealedQuestionIndex!==undefined)payload.revealed_question_index=patch.revealedQuestionIndex
  if(patch.questionStartedAt!==undefined)payload.question_started_at=patch.questionStartedAt
  if(patch.startedAt!==undefined)payload.started_at=patch.startedAt
  if(patch.endedAt!==undefined)payload.ended_at=patch.endedAt
  const {error}=await supabase.from('quiz_sessions').update(payload).eq('id',id)
  if(error)throw reportSupabaseFailure('live-session:update',error,{sessionId:id,status:patch.status})
}
export async function cloudSaveImportBatch(item:ImportBatch,rawJson:unknown){if(!supabase)return;const {error}=await supabase.from('question_import_batches').upsert({id:item.id,teacher_id:(await supabase.auth.getUser()).data.user?.id,raw_json:rawJson,status:item.status,imported_count:item.importedCount,error_count:item.errorCount,validation_errors:item.validationErrors});warn('save-import',error)}
export async function cloudRecordUsage(eventType:string,quantity:number){if(!supabase)return;const {error}=await supabase.rpc('record_usage',{event_name:eventType,event_quantity:quantity,event_metadata:{}});warn('record-usage',error)}

export function subscribeToLiveSession(sessionId:string,onChange:()=>void){
  const client=supabase
  if(!client)return()=>{}
  const channel=client.channel(`live-session:${sessionId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'quiz_sessions',filter:`id=eq.${sessionId}`},onChange)
    .on('postgres_changes',{event:'*',schema:'public',table:'session_participants',filter:`session_id=eq.${sessionId}`},onChange)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'live_responses',filter:`session_id=eq.${sessionId}`},onChange)
    .subscribe(status=>{
      if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')console.error('[MathPulse:live-session:realtime]',{sessionId,status})
    })
  return()=>{void client.removeChannel(channel)}
}
