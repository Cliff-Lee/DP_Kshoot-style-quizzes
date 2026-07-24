import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, BadgeCheck, CheckCircle2, Flame, LoaderCircle, RadioTower, Shield, Snowflake, Sparkles, Split, Trophy, XCircle, Zap } from 'lucide-react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { emptyAnswerFor, isAnswerReady, QuestionAnswerInput } from '../components/QuestionAnswerInput'
import { titleCase } from '../components/UI'
import { subscribeToLiveSession } from '../lib/cloudRepository'
import { currentQuestionFromSnapshot, lookupCloudLiveGame, normalizeGamePin, type LiveGameSnapshot, type LiveJoinCredentials } from '../lib/liveGameRepository'
import { isSupabaseConfigured } from '../lib/supabase'
import { useApp } from '../state/AppContext'
import type { BadgeType, PowerupType } from '../types'

const powerupDetails:Record<PowerupType,{label:string;short:string;icon:typeof Zap}>={
  double_points:{label:'Double Points',short:'2× score',icon:Zap},
  fifty_fifty:{label:'Fifty-Fifty',short:'Hide 2',icon:Split},
  time_freeze:{label:'Time Freeze',short:'+8 sec',icon:Snowflake},
  shield:{label:'Shield',short:'Save streak',icon:Shield},
}
const badgeLabels:Record<BadgeType,string>={fastest_correct:'Fastest Correct',hot_streak:'Hot Streak',comeback:'Comeback',topic_master:'Topic Master',perfect_round:'Perfect Round'}

export function PlayPage(){
  const [params]=useSearchParams()
  const {state}=useApp()
  const initialPin=normalizeGamePin(params.get('pin')??'')
  const [pin,setPin]=useState(initialPin)
  const [cloudPreview,setCloudPreview]=useState<LiveGameSnapshot|null>(null)
  const [lookupError,setLookupError]=useState('')
  const navigate=useNavigate()
  const normalizedPin=normalizeGamePin(pin)
  const localSession=state.sessions.find(item=>item.pin.toUpperCase()===normalizedPin&&item.status!=='ended')
  const localQuiz=state.quizzes.find(item=>item.id===localSession?.quizId)
  const previewQuiz=isSupabaseConfigured?cloudPreview?.quiz:localQuiz
  const previewSession=isSupabaseConfigured?cloudPreview?.session:localSession

  useEffect(()=>{
    if(!isSupabaseConfigured||normalizedPin.length!==6){setCloudPreview(null);setLookupError('');return}
    let active=true
    const timer=window.setTimeout(()=>{
      void lookupCloudLiveGame(normalizedPin).then(snapshot=>{if(active){setCloudPreview(snapshot);setLookupError(snapshot.state==='ended'?'Game has ended':snapshot.state==='not_found'?'Game not found':'')}}).catch(caught=>{if(active)setLookupError(caught instanceof Error?caught.message:'Could not connect to live game')})
    },250)
    return()=>{active=false;window.clearTimeout(timer)}
  },[normalizedPin])

  const submit=(event:FormEvent)=>{
    event.preventDefault()
    if(normalizedPin.length===6)navigate(`/play/${normalizedPin}`)
  }

  return <div className="play-page join-page"><div className="play-texture"/><header><Logo/></header><main><span className="play-kicker">Live IB Mathematics</span><span className="play-icon"><RadioTower/></span><h1>{previewQuiz?`Join ${previewQuiz.title}`:'Ready to make your move?'}</h1><p>{previewQuiz?'This live room is open. Confirm the PIN and continue.':'Enter the six-character PIN from your classroom screen.'}</p>{lookupError&&<div className="alert danger">{lookupError}</div>}<form onSubmit={submit}><label>Game PIN<input inputMode="text" pattern="[A-Za-z0-9]{6}" maxLength={6} value={pin} onChange={event=>setPin(normalizeGamePin(event.target.value))} placeholder="000 000" aria-label="Game PIN" autoCapitalize="characters" autoFocus/></label><button className="button coral wide" disabled={normalizedPin.length!==6}>Enter arena <ArrowRight/></button></form>{previewSession&&<span className="session-found"><RadioTower/>Live now · {previewSession.participants.length} joined</span>}<span className="join-help">Joining a class instead? <Link to="/login">Sign in first</Link></span></main></div>
}

export function PlaySessionPage(){
  const route=useParams()
  const pin=normalizeGamePin(route.pin??'')
  const {state,actions}=useApp()
  const [nickname,setNickname]=useState('')
  const [credentials,setCredentials]=useState<LiveJoinCredentials|undefined>(()=>readCredentials(pin))
  const [snapshot,setSnapshot]=useState<LiveGameSnapshot|null>(null)
  const [lookupState,setLookupState]=useState<'loading'|'ready'|'error'>(isSupabaseConfigured?'loading':'ready')
  const [error,setError]=useState('')
  const [answer,setAnswer]=useState<unknown>('')
  const [startTime,setStartTime]=useState(Date.now())
  const [seconds,setSeconds]=useState(30)
  const [powerupNotice,setPowerupNotice]=useState('')
  const [submitting,setSubmitting]=useState(false)

  const refreshCloud=useCallback(async(nextCredentials=credentials)=>{
    if(!isSupabaseConfigured)return
    try{
      const next=await lookupCloudLiveGame(pin,nextCredentials)
      setSnapshot(next)
      setLookupState('ready')
      setError('')
    }catch(caught){
      setLookupState('error')
      setError(caught instanceof Error?caught.message:'Could not connect to live game')
    }
  },[credentials,pin])

  useEffect(()=>{
    if(!isSupabaseConfigured)return
    void refreshCloud()
    const timer=window.setInterval(()=>{void refreshCloud()},2500)
    return()=>window.clearInterval(timer)
  },[refreshCloud])

  useEffect(()=>{
    if(!isSupabaseConfigured||!snapshot?.session?.id)return
    return subscribeToLiveSession(snapshot.session.id,()=>{void refreshCloud()})
  },[snapshot?.session?.id,refreshCloud])

  const localSession=state.sessions.find(session=>session.pin.toUpperCase()===pin)
  const session=isSupabaseConfigured?snapshot?.session:localSession
  const quiz=isSupabaseConfigured?snapshot?.quiz:state.quizzes.find(item=>item.id===session?.quizId)
  const participantId=credentials?.participantId??''
  const participant=session?.participants.find(item=>item.id===participantId)
  const localQuestionId=quiz?.questionIds[session?.currentQuestionIndex??-1]
  const question=isSupabaseConfigured?currentQuestionFromSnapshot(snapshot):state.questions.find(item=>item.id===localQuestionId)
  const submitted=question&&participant?.answers[question.id]
  const revealed=session?.revealedQuestionIndex===session?.currentQuestionIndex
  const leaderboard=useMemo(()=>[...(session?.participants??[])].sort((a,b)=>b.score-a.score),[session?.participants])
  const rank=leaderboard.findIndex(item=>item.id===participantId)+1

  useEffect(()=>{
    if(!question)return
    setAnswer(emptyAnswerFor(question))
    setStartTime(Date.now())
    setSeconds(quiz?.settings.timeLimitSeconds??30)
    setPowerupNotice('')
  },[session?.currentQuestionIndex,question?.id,quiz?.settings.timeLimitSeconds])

  useEffect(()=>{
    if(session?.status!=='live'||submitted||revealed)return
    const timer=window.setInterval(()=>setSeconds(value=>Math.max(0,value-1)),1000)
    return()=>window.clearInterval(timer)
  },[session?.status,submitted,revealed,question?.id])

  const join=async(event:FormEvent)=>{
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try{
      const result=await actions.joinSession(pin,nickname.trim())
      setCredentials(result)
      sessionStorage.setItem(credentialsKey(pin),JSON.stringify(result))
      if(isSupabaseConfigured)await refreshCloud(result)
    }catch(caught){
      setError(caught instanceof Error?caught.message:'Could not connect to live game')
    }finally{setSubmitting(false)}
  }

  const submit=async()=>{
    if(!session||!participantId||!question||!isAnswerReady(question,answer)||submitting)return
    setSubmitting(true)
    setError('')
    try{
      await actions.submitLiveAnswer(session.id,participantId,question.id,answer,Date.now()-startTime,credentials?.clientToken)
      if(isSupabaseConfigured)await refreshCloud()
    }catch(caught){setError(caught instanceof Error?caught.message:'Could not submit answer')}finally{setSubmitting(false)}
  }

  const usePowerup=async(type:PowerupType)=>{
    if(!session||!participant||!question)return
    setError('')
    try{
      if(await actions.usePowerup(session.id,participant.id,question.id,type,credentials?.clientToken)){
        setPowerupNotice(`${powerupDetails[type].label} armed`)
        if(isSupabaseConfigured)await refreshCloud()
      }
    }catch(caught){setError(caught instanceof Error?caught.message:'Could not use powerup')}
  }

  const hiddenOptions=useMemo(()=>{
    const hidden=new Set<string>()
    const activePowerup=participant?.activePowerup
    if(!activePowerup||!question||activePowerup.questionId!==question.id||activePowerup.type!=='fifty_fifty')return hidden
    const supplied=question.answerData.hiddenOptionIds
    if(Array.isArray(supplied)){
      supplied.forEach(id=>hidden.add(String(id)))
      return hidden
    }
    question.options?.filter(option=>!option.isCorrect).slice(0,2).forEach(option=>hidden.add(option.id))
    return hidden
  },[participant?.activePowerup,question])

  if(lookupState==='loading')return <PlayMessage icon={<LoaderCircle className="spin"/>} title="Finding your live game…" body="Connecting securely with the classroom screen."/>
  if(lookupState==='error'){const copy=liveConnectionCopy(error);return <PlayMessage icon="!" title={copy.title} body={copy.body} retry={()=>void refreshCloud()}/>}
  if((isSupabaseConfigured?snapshot?.state==='not_found':!session))return <PlayMessage icon="?" title="Game not found" body="Check the PIN on the main screen and try again."/>
  if(snapshot?.state==='ended'&&!session)return <PlayMessage icon={<Trophy/>} title="Game has ended" body="This PIN is no longer accepting new players."/>
  if(!session)return <PlayMessage icon="?" title="Game not found" body="Check the PIN on the main screen and try again."/>

  if(!participantId||!participant)return <div className="play-page join-page nickname-page"><div className="play-texture"/><header><Logo/></header><main><span className="play-kicker">PIN {session.pin}</span><span className="play-icon"><Sparkles/></span><h1>Join {quiz?.title}</h1><p>{session.status==='ended'?'This game has ended and is no longer accepting players.':'Choose the name your teacher will recognize.'}</p>{error&&<div className="alert danger">{error}</div>}{session.status==='ended'?<Link className="button primary wide" to="/play">Try another PIN</Link>:<form onSubmit={join}><label>Nickname<input value={nickname} onChange={event=>setNickname(event.target.value)} maxLength={40} placeholder="Your nickname" autoFocus required/></label><button className="button coral wide" disabled={submitting}>{submitting?'Joining…':<>Join game <ArrowRight/></>}</button></form>}</main></div>
  if(session.status==='waiting'||session.status==='paused')return <div className="play-page waiting-page"><div className="play-texture"/><header><Logo/><span className="score-chip">{participant.score.toLocaleString()} pts</span></header><main><div className="waiting-orbit"><LoaderCircle className="spin"/><i/><i/><i/></div><span className="play-kicker">You’re on the roster</span><h1>Nice one, {participant.nickname}.</h1><p>{session.status==='paused'?'Quick pause. Your streak and score are safe.':'Look up—the first question will appear when your teacher starts.'}</p><div className="lobby-roster">{session.participants.slice(0,8).map(player=><span key={player.id}>{player.nickname.slice(0,1)}</span>)}</div><strong>{session.participants.length} player{session.participants.length===1?'':'s'} ready</strong><small>PIN {session.pin}</small></main></div>
  if(session.status==='ended')return <div className="play-page finish-page"><div className="play-texture"/><header><Logo/></header><main><Trophy/><span className="play-kicker">Final result · #{rank}</span><h1>{participant.score.toLocaleString()}</h1><p>Every response has been added to your syllabus progress.</p><div className="mini-leaderboard">{leaderboard.slice(0,3).map((player,index)=><div className={player.id===participant.id?'you':''} key={player.id}><b>{index+1}</b><span>{player.nickname}</span><strong>{player.score.toLocaleString()}</strong></div>)}</div>{participant.badges.length>0&&<div className="badge-rack"><span>Your badges</span><div>{participant.badges.map(badge=><b key={badge.type}><BadgeCheck/>{badgeLabels[badge.type]}</b>)}</div></div>}<Link className="button light" to="/play">Join another game</Link></main></div>
  if(!question&&snapshot?.snapshotError==='quiz_has_no_question_at_index')return <PlayMessage icon="!" title="Question unavailable" body="This quiz has no playable question at the current position. Ask your teacher to relaunch the game." retry={()=>void refreshCloud()}/>
  if(!question)return <PlayMessage icon={<LoaderCircle className="spin"/>} title="Question incoming…" body="Keep this screen open while your teacher starts the next question."/>
  if(submitted)return <div className={`play-page feedback-page ${revealed?(submitted.correct?'correct':'incorrect'):'locked'}`}><div className="play-texture"/><header><Logo/><span className="score-chip">{participant.score.toLocaleString()} pts</span></header><main>{!revealed?<><LoaderCircle className="spin"/><span className="play-kicker">Answer locked</span><h1>Eyes on the main screen…</h1><p>Your result appears when your teacher reveals the answer.</p></>:<>{submitted.correct?<CheckCircle2/>:<XCircle/>}<span className="play-kicker">{submitted.correct?'That’s right':'Not this time'}</span><h1>{submitted.correct?`+${submitted.awardedPoints.toLocaleString()} points`:'Keep moving'}</h1><div className="score-breakdown"><span>Base <b>{submitted.scoreDetail.basePoints}</b></span><span>Speed <b>+{submitted.scoreDetail.speedBonus}</b></span><span>Streak <b>+{submitted.scoreDetail.streakBonus}</b></span>{submitted.scoreDetail.multiplier>1&&<span>Powerup <b>×{submitted.scoreDetail.multiplier}</b></span>}{submitted.scoreDetail.shieldUsed&&<span>Shield <b>Streak saved</b></span>}</div>{quiz?.settings.showExplanations&&<div className="phone-explanation"><b>Why?</b><p>{question.explanation}</p></div>}<div className="feedback-footer"><span><Flame/>{participant.currentStreak} streak</span><span><Trophy/>#{rank} place</span></div></>}</main></div>
  return <div className="play-page answer-page"><div className="play-texture"/><header><Logo/><div><span><Flame/>{participant.currentStreak}</span><span>{participant.score.toLocaleString()} pts</span></div></header><div className="phone-progress"><i style={{width:`${((session.currentQuestionIndex+1)/(quiz?.questionIds.length??1))*100}%`}}/></div><main>{error&&<div className="alert danger">{error}</div>}<div className="answer-meta"><small>{titleCase(question.type)}</small><span className={seconds<8?'urgent':''}>{seconds}s</span></div><h1>{question.prompt}</h1>{quiz?.settings.enablePowerups&&<div className="powerup-tray"><span>Powerups</span><div>{(Object.keys(powerupDetails) as PowerupType[]).map(type=>{const detail=powerupDetails[type];const Icon=detail.icon;const count=participant.powerups[type]??0;const active=participant.activePowerup?.questionId===question.id&&participant.activePowerup.type===type;return <button type="button" className={active?'active':''} disabled={!count||Boolean(participant.activePowerup?.questionId===question.id)} onClick={()=>void usePowerup(type)} key={type} title={detail.label}><Icon/><b>{detail.short}</b><em>{count}</em></button>})}</div>{powerupNotice&&<small>{powerupNotice}</small>}</div>}<QuestionAnswerInput question={question} value={answer} onChange={setAnswer} hiddenOptions={hiddenOptions}/><button className="button coral wide submit-answer" onClick={()=>void submit()} disabled={!isAnswerReady(question,answer)||submitting}>{submitting?'Sending…':'Lock answer'}</button></main></div>
}

function PlayMessage({icon,title,body,retry}:{icon:React.ReactNode;title:string;body:string;retry?:()=>void}){
  return <div className="play-page join-page"><header><Logo/></header><main><span className="play-icon error">{icon}</span><h1>{title}</h1><p>{body}</p>{retry?<button className="button primary" onClick={retry}>Try again</button>:<Link className="button primary" to="/play">Try another PIN</Link>}</main></div>
}

function credentialsKey(pin:string){return `mathpulse-live-player-${pin}`}
function readCredentials(pin:string):LiveJoinCredentials|undefined{
  try{
    const raw=sessionStorage.getItem(credentialsKey(pin))
    if(!raw)return undefined
    const parsed=JSON.parse(raw) as LiveJoinCredentials
    return parsed?.participantId?parsed:undefined
  }catch{return undefined}
}

function liveConnectionCopy(error:string){
  if(error==='Supabase permission error')return {title:error,body:'The live-game security policy rejected this request. Ask the teacher to verify that the latest Supabase migration has been applied.'}
  if(error==='Live game database error')return {title:error,body:'The live-game database function or table is unavailable. The latest Supabase migration may still need to be applied.'}
  return {title:'Could not connect to live game',body:'Check your internet connection, then try again.'}
}
