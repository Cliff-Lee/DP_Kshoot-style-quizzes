import { DEFAULT_POWERUPS, normalizeQuizSettings } from './gameLogic'
import { supabase } from './supabase'
import { reportSupabaseFailure } from './supabaseErrors'
import type { LiveAnswer, LiveParticipant, Question, Quiz, QuizSession, ScoreBreakdown } from '../types'

export type LiveSnapshotState = 'not_found'|'waiting'|'live'|'paused'|'ended'
export interface LiveJoinCredentials { sessionId:string; participantId:string; clientToken?:string }
export interface LiveGameSnapshot {
  state:LiveSnapshotState
  session?:QuizSession
  quiz?:Quiz
  questions:Question[]
  currentQuestionId?:string
  questionCount?:number
  snapshotError?:'quiz_has_no_question_at_index'
}

export type LiveQuestionPhase='waiting'|'answering'|'revealed'

const emptyScoreDetail:ScoreBreakdown={basePoints:0,speedBonus:0,streakBonus:0,multiplier:1,total:0,effectiveResponseTimeMs:0,shieldUsed:false}

export function liveQuestionPhase(session:Pick<QuizSession,'currentQuestionIndex'|'revealedQuestionIndex'>|null|undefined):LiveQuestionPhase{
  if(!session||session.currentQuestionIndex<0)return 'waiting'
  return session.revealedQuestionIndex===session.currentQuestionIndex?'revealed':'answering'
}

export function isLiveQuestionRevealed(session:Pick<QuizSession,'currentQuestionIndex'|'revealedQuestionIndex'>|null|undefined):boolean{
  return liveQuestionPhase(session)==='revealed'
}

export function liveCorrectAnswerLabel(question:Question):string{
  const data=question.answerData
  if(question.type==='matching')return ((data.pairs??[]) as Array<{left:string;right:string}>).map(pair=>`${pair.left} → ${pair.right}`).join(' · ')
  if(question.type==='drag_drop')return ((data.items??[]) as Array<{text:string;correctZone:string}>).map(item=>`${item.text} → ${item.correctZone}`).join(' · ')
  if(question.type==='ordering')return ((data.correctOrder??data.items??[]) as string[]).join(' → ')
  if(question.type==='multi_select')return ((data.answers??[]) as string[]).join(' + ')
  if(question.type==='true_false')return data.answer?'True':'False'
  return String(data.answer??'Teacher-reviewed response')
}

export function hideLiveQuestionAnswers(question:Question):Question{
  const data=question.answerData
  let answerData:Record<string,unknown>={}
  if(question.type==='matching'){
    answerData={
      leftItems:Array.isArray(data.leftItems)?data.leftItems:[],
      choices:Array.isArray(data.choices)?data.choices:[],
    }
  }else if(question.type==='drag_drop'){
    answerData={
      zones:Array.isArray(data.zones)?data.zones:[],
      items:Array.isArray(data.items)?data.items.map(item=>{
        const record=(item&&typeof item==='object'?item:{}) as Record<string,unknown>
        return {text:String(record.text??'')}
      }):[],
    }
  }else if(question.type==='ordering'){
    answerData={items:Array.isArray(data.items)?data.items:[]}
  }else if(Array.isArray(data.hiddenOptionIds)){
    answerData={hiddenOptionIds:data.hiddenOptionIds.map(String)}
  }
  return {
    ...question,
    answerData,
    explanation:'',
    options:question.options?.map(option=>({...option,isCorrect:false})),
  }
}

export function hideLiveParticipantResult(participant:LiveParticipant,questionId:string|undefined):LiveParticipant{
  if(!questionId||!participant.answers[questionId])return participant
  const current=participant.answers[questionId]
  return {
    ...participant,
    answers:{
      ...participant.answers,
      [questionId]:{
        ...current,
        correct:false,
        awardedPoints:0,
        streakAfter:participant.currentStreak,
        scoreDetail:{...emptyScoreDetail,effectiveResponseTimeMs:current.responseTimeMs},
      },
    },
  }
}

export function normalizeGamePin(value:string):string {
  return value.trim().replace(/[^a-z0-9]/gi,'').toUpperCase().slice(0,6)
}

export async function lookupCloudLiveGame(pin:string,credentials?:LiveJoinCredentials):Promise<LiveGameSnapshot>{
  if(!supabase)throw new Error('Could not connect to live game')
  const normalized=normalizeGamePin(pin)
  if(!normalized)return {state:'not_found',questions:[]}
  const {data,error}=await supabase.rpc('get_live_game_snapshot',{
    game_pin:normalized,
    p_participant_id:credentials?.participantId??null,
    p_client_token:credentials?.clientToken??null,
  })
  if(error)throw reportSupabaseFailure('live-session:lookup',error,{pin:normalized})
  return mapLiveSnapshot(data)
}

export async function joinCloudLiveGame(pin:string,nickname:string):Promise<LiveJoinCredentials>{
  if(!supabase)throw new Error('Could not connect to live game')
  const {data,error}=await supabase.rpc('join_live_session',{game_pin:normalizeGamePin(pin),player_nickname:nickname.trim()})
  if(error){
    const message=String(error.message??'')
    if(message.includes('GAME_NOT_FOUND'))throw new Error('Game not found')
    if(message.includes('GAME_ENDED'))throw new Error('Game has ended')
    if(message.includes('INVALID_NICKNAME'))throw new Error('Enter a nickname between 1 and 40 characters')
    if(message.includes('GAME_NOT_JOINABLE'))throw new Error('Game is not accepting players')
    throw reportSupabaseFailure('live-session:join',error,{pin:normalizeGamePin(pin)})
  }
  const row=Array.isArray(data)?data[0]:data
  if(!row?.participant_id||!row?.session_id||!row?.client_token)throw new Error('Could not connect to live game')
  return {sessionId:String(row.session_id),participantId:String(row.participant_id),clientToken:String(row.client_token)}
}

export async function submitCloudLiveAnswer(credentials:LiveJoinCredentials,questionId:string,answer:unknown,responseTimeMs:number):Promise<void>{
  if(!supabase||!credentials.clientToken)throw new Error('Could not connect to live game')
  const {error}=await supabase.rpc('submit_live_response',{
    p_session_id:credentials.sessionId,
    p_participant_id:credentials.participantId,
    p_client_token:credentials.clientToken,
    p_question_id:questionId,
    p_answer:answer,
    p_response_time_ms:Math.max(0,Math.round(responseTimeMs)),
  })
  if(error){
    if(error.message.includes('Question is not active'))throw new Error('This question is no longer active')
    if(error.message.includes('no longer accepting answers'))throw new Error('The answer has already been revealed')
    throw reportSupabaseFailure('live-session:answer',error,{sessionId:credentials.sessionId,participantId:credentials.participantId,questionId})
  }
}

export async function useCloudLivePowerup(credentials:LiveJoinCredentials,questionId:string,powerup:string):Promise<void>{
  if(!supabase||!credentials.clientToken)throw new Error('Could not connect to live game')
  const {error}=await supabase.rpc('use_live_powerup',{
    p_session_id:credentials.sessionId,
    p_participant_id:credentials.participantId,
    p_client_token:credentials.clientToken,
    p_question_id:questionId,
    p_powerup_type:powerup,
  })
  if(error){
    if(error.message.includes('already used'))throw new Error('That powerup has already been used')
    throw reportSupabaseFailure('live-session:powerup',error,{sessionId:credentials.sessionId,participantId:credentials.participantId,questionId,powerup})
  }
}

export function mapLiveSnapshot(value:unknown):LiveGameSnapshot{
  const raw=(value&&typeof value==='object'?value:{}) as Record<string,any>
  const state=(['not_found','waiting','live','paused','ended'].includes(raw.state)?raw.state:'not_found') as LiveSnapshotState
  if(!raw.session||!raw.quiz)return {state,questions:[]}

  const currentQuestionId=raw.currentQuestionId?String(raw.currentQuestionId):raw.session.currentQuestionId?String(raw.session.currentQuestionId):undefined
  const rawPhase=liveQuestionPhase({
    currentQuestionIndex:Number(raw.session.currentQuestionIndex??-1),
    revealedQuestionIndex:Number(raw.session.revealedQuestionIndex??-1),
  })
  const publicParticipants:LiveParticipant[]=(raw.session.participants??[]).map(mapParticipant).map((participant:LiveParticipant)=>
    rawPhase==='revealed'?participant:hideLiveParticipantResult(participant,currentQuestionId)
  )
  const mappedOwn=raw.player?mapParticipant(raw.player):undefined
  const own=mappedOwn&&rawPhase!=='revealed'?hideLiveParticipantResult(mappedOwn,currentQuestionId):mappedOwn
  const participants=own?[...publicParticipants.filter(item=>item.id!==own.id),own]:publicParticipants
  const session:QuizSession={
    id:String(raw.session.id),quizId:String(raw.session.quizId),teacherId:String(raw.session.teacherId??''),
    classId:raw.session.classId?String(raw.session.classId):undefined,pin:String(raw.session.pin),status:state==='not_found'?'waiting':state,
    currentQuestionIndex:Number(raw.session.currentQuestionIndex??-1),revealedQuestionIndex:Number(raw.session.revealedQuestionIndex??-1),
    questionStartedAt:raw.session.questionStartedAt??undefined,startedAt:raw.session.startedAt??undefined,endedAt:raw.session.endedAt??undefined,
    participants,
  }
  const quiz:Quiz={
    id:String(raw.quiz.id),teacherId:String(raw.quiz.teacherId??''),title:String(raw.quiz.title??'Live mathematics quiz'),
    courseId:String(raw.quiz.courseId??''),mode:raw.quiz.mode??'live',settings:normalizeQuizSettings(raw.quiz.settings??{}),
    createdAt:String(raw.quiz.createdAt??new Date(0).toISOString()),questionIds:(raw.quiz.questionIds??[]).map(String),
  }
  const mappedQuestion=raw.question?mapQuestion(raw.question):undefined
  const questions=mappedQuestion?[isLiveQuestionRevealed(session)?mappedQuestion:hideLiveQuestionAnswers(mappedQuestion)]:[]
  return {
    state,
    session,
    quiz,
    questions,
    currentQuestionId,
    questionCount:Number(raw.questionCount??quiz.questionIds.length),
    snapshotError:raw.snapshotError==='quiz_has_no_question_at_index'?'quiz_has_no_question_at_index':undefined,
  }
}

export function currentQuestionFromSnapshot(snapshot:LiveGameSnapshot|null|undefined):Question|undefined{
  if(!snapshot)return undefined
  return snapshot.questions.find(question=>question.id===snapshot.currentQuestionId)??snapshot.questions[0]
}

function mapParticipant(raw:any):LiveParticipant{
  const answers=Object.fromEntries(Object.entries(raw.answers??{}).map(([questionId,entry])=>[questionId,mapAnswer(entry)]))
  return {
    id:String(raw.id),nickname:String(raw.nickname??'Player'),score:Number(raw.score??0),
    currentStreak:Number(raw.currentStreak??0),bestStreak:Number(raw.bestStreak??0),
    powerups:{...DEFAULT_POWERUPS,...(raw.powerups??{})},badges:raw.badges??[],powerupEvents:[],
    activePowerup:raw.activePowerup??undefined,answers,
  }
}

function mapAnswer(value:unknown):LiveAnswer{
  const raw=(value&&typeof value==='object'?value:{}) as Record<string,any>
  const detail={...emptyScoreDetail,...(raw.scoreDetail??{})}
  return {answer:raw.answer,correct:Boolean(raw.correct),responseTimeMs:Number(raw.responseTimeMs??0),awardedPoints:Number(raw.awardedPoints??0),streakAfter:Number(raw.streakAfter??0),powerupUsed:raw.powerupUsed??undefined,scoreDetail:detail}
}

function mapQuestion(raw:any):Question{
  return {
    id:String(raw.id),createdBy:'platform',visibility:'public',status:'approved',courseId:String(raw.courseId),
    syllabusPointId:String(raw.syllabusPointId),type:raw.type,prompt:String(raw.prompt??''),answerData:raw.answerData??{},
    explanation:String(raw.explanation??''),difficulty:raw.difficulty??'standard',questionStyle:raw.questionStyle??'conceptual',
    calculator:raw.calculator??'neutral',estimatedTimeSeconds:Number(raw.estimatedTimeSeconds??60),marksEstimate:Number(raw.marksEstimate??1),
    tags:raw.tags??[],source:'platform_seed',createdAt:new Date(0).toISOString(),updatedAt:new Date(0).toISOString(),
    options:(raw.options??[]).map((option:any)=>({id:String(option.id),label:String(option.label),text:String(option.text),isCorrect:Boolean(option.isCorrect),sortOrder:Number(option.sortOrder??0)})),
  }
}
