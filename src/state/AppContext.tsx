import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialState } from '../data/demo'
import { aaQuestionSeed } from '../data/aaQuestionSeed'
import { aiQuestionSeed } from '../data/aiQuestionSeed'
import { courseById, defaultCourseId } from '../data/courses'
import { syllabusById, syllabusPoints } from '../data/syllabus'
import { cloudCreateClass, cloudCreateQuiz, cloudCreateSession, cloudPatchQuestion, cloudPatchSession, cloudRecordUsage, cloudSaveImportBatch, cloudSaveQuestions, loadCloudWorkspace } from '../lib/cloudRepository'
import { awardBadge, calculateScore, checkAnswer, DEFAULT_POWERUPS, initialParticipant, normalizeQuizSettings } from '../lib/gameLogic'
import { joinCloudLiveGame, submitCloudLiveAnswer, useCloudLivePowerup, type LiveJoinCredentials } from '../lib/liveGameRepository'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { AppState, ClassRoom, ImportBatch, LiveParticipant, PowerupType, Question, Quiz, QuizSession, Role, UserProfile } from '../types'

const STORAGE_KEY = 'mathpulse-state-v1'
const CHANNEL = 'mathpulse-realtime-v1'

type CreateQuizInput = Pick<Quiz, 'title'|'courseId'|'mode'|'questionIds'|'settings'>
interface AppActions {
  login: (email: string, password: string, mode: 'signin'|'signup', role?: Role) => Promise<void>
  demoLogin: (role?: Role) => void
  logout: () => Promise<void>
  setActiveCourse:(courseId:string)=>void
  createClass: (name: string,courseId?:string) => ClassRoom
  joinClass: (code: string, name: string, email?: string) => ClassRoom
  addQuestions: (questions: Question[]) => void
  updateQuestion: (question: Question) => void
  duplicateQuestion: (id: string) => void
  archiveQuestion: (id: string) => void
  submitQuestion: (id: string) => void
  createQuiz: (input: CreateQuizInput) => Quiz
  launchSession: (quizId: string, classId?: string) => Promise<QuizSession>
  updateSession: (id: string, patch: Partial<QuizSession>) => Promise<void>
  revealQuestion: (sessionId: string, questionId: string) => Promise<void>
  joinSession: (pin: string, nickname: string) => Promise<LiveJoinCredentials>
  usePowerup: (sessionId: string, participantId: string, questionId: string, powerup: PowerupType, clientToken?:string) => Promise<boolean>
  submitLiveAnswer: (sessionId: string, participantId: string, questionId: string, answer: unknown, responseTimeMs: number, clientToken?:string) => Promise<void>
  addImportBatch: (batch: ImportBatch, rawJson?: unknown) => void
  logUsage: (eventType: string, quantity?: number) => void
  refreshCloud: () => Promise<void>
  resetDemo: () => void
}

const AppContext = createContext<{ state: AppState; actions: AppActions; hydrated: boolean } | null>(null)

function loadState(): AppState {
  try { const raw = localStorage.getItem(STORAGE_KEY); return normalizeState(raw ? JSON.parse(raw) as AppState : initialState) } catch { return normalizeState(initialState) }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [hydrated, setHydrated] = useState(false)

  const hydrateCloud = useCallback(async (profile: UserProfile) => {
    const cloud = await loadCloudWorkspace()
    setState(current=>{
      const next:AppState=normalizeState({...cloud,user:profile,activeCourseId:current.activeCourseId})
      localStorage.setItem(STORAGE_KEY,JSON.stringify(next))
      return next
    })
  },[])

  const mutate = useCallback((recipe: (current: AppState) => AppState) => {
    setState(current => {
      const next = recipe(current)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      try { new BroadcastChannel(CHANNEL).postMessage({ type:'state', state:next }) } catch { /* older browser */ }
      return next
    })
  }, [])

  useEffect(() => {
    setHydrated(true)
    let channel: BroadcastChannel | undefined
    try {
      channel = new BroadcastChannel(CHANNEL)
      channel.onmessage = event => { if (event.data?.type === 'state') setState(normalizeState(event.data.state as AppState)) }
    } catch { /* BroadcastChannel is an enhancement */ }
    const onStorage = (event: StorageEvent) => { if (event.key === STORAGE_KEY && event.newValue) setState(normalizeState(JSON.parse(event.newValue))) }
    window.addEventListener('storage', onStorage)
    return () => { channel?.close(); window.removeEventListener('storage', onStorage) }
  }, [])

  useEffect(() => {
    const client=supabase
    if (!client) return
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session) return
      const { data: profile } = await client.from('profiles').select('*').eq('id', data.session.user.id).single()
      if (profile) { const mapped={ id:profile.id, email:profile.email, displayName:profile.display_name, role:profile.role, schoolId:profile.school_id ?? undefined } as UserProfile; mutate(current => ({ ...current, user:mapped })); await hydrateCloud(mapped) }
    })
  }, [mutate,hydrateCloud])

  const actions: AppActions = useMemo(() => ({
    async login(email, password, mode, role = 'teacher_free') {
      if (isSupabaseConfigured && supabase) {
        const response = mode === 'signup' ? await supabase.auth.signUp({ email, password, options:{ data:{ display_name:email.split('@')[0], role } } }) : await supabase.auth.signInWithPassword({ email, password })
        if (response.error) throw response.error
        const authUser = response.data.user
        if (!authUser) throw new Error('Check your email to confirm the new account, then sign in.')
        const profile={ id:authUser.id, email, displayName:String(authUser.user_metadata.display_name ?? email.split('@')[0]), role:String(authUser.user_metadata.role ?? role) as Role }
        mutate(current => ({ ...current, user:profile })); await hydrateCloud(profile)
      } else {
        if (!email.includes('@')) throw new Error('Enter a valid email address.')
        if (password.length < 6) throw new Error('Use at least 6 characters for the password.')
        mutate(current => ({ ...current, user:{ id:'teacher-demo', email, displayName:email.split('@')[0].replace(/[._]/g,' '), role } }))
      }
    },
    demoLogin(role = 'teacher_free') { mutate(current => ({ ...current, user:{ id:role === 'student' ? 'student-0' : 'teacher-demo', email:role === 'student' ? 'aisha@school.test' : 'alex.morgan@school.test', displayName:role === 'student' ? 'Aisha Rahman' : 'Alex Morgan', role } })) },
    async logout() { if (supabase) await supabase.auth.signOut(); mutate(current => ({ ...current, user:null })) },
    setActiveCourse(courseId){mutate(current=>({...current,activeCourseId:courseId}))},
    createClass(name,courseId=state.activeCourseId) {
      const item: ClassRoom = { id:crypto.randomUUID(), teacherId:state.user?.id ?? 'teacher-demo', name, courseId, joinCode:makeCode(), archived:false, members:[], createdAt:new Date().toISOString() }
      mutate(current => ({ ...current, classes:[item,...current.classes] })); void cloudCreateClass(item); return item
    },
    joinClass(code, name, email) {
      const found = state.classes.find(item => item.joinCode.toUpperCase() === code.trim().toUpperCase())
      if (!found) throw new Error('No class matches that code.')
      const member = { id:state.user?.role === 'student' ? state.user.id : crypto.randomUUID(), displayName:name, email, joinedAt:new Date().toISOString() }
      mutate(current => ({ ...current, classes:current.classes.map(item => item.id === found.id ? {...item, members:item.members.some(m=>m.id===member.id) ? item.members : [...item.members,member]} : item) })); return found
    },
    addQuestions(questions) { mutate(current => ({ ...current, questions:[...questions,...current.questions] })); void cloudSaveQuestions(questions) },
    updateQuestion(question) { mutate(current => ({ ...current, questions:current.questions.map(item => item.id === question.id ? {...question,updatedAt:new Date().toISOString()} : item) })); void cloudSaveQuestions([question]) },
    duplicateQuestion(id) { const source=state.questions.find(q=>q.id===id); if(!source)return; const copy={...source,id:crypto.randomUUID(),prompt:`${source.prompt} (copy)`,visibility:'private' as const,status:'draft' as const,createdBy:state.user?.id??source.createdBy,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),options:source.options?.map(o=>({...o,id:crypto.randomUUID()}))}; mutate(current=>({...current,questions:[copy,...current.questions]})); void cloudSaveQuestions([copy]) },
    archiveQuestion(id) { mutate(current => ({ ...current, questions:current.questions.map(item => item.id===id ? {...item,status:'archived'} : item) })); void cloudPatchQuestion(id,{status:'archived'}) },
    submitQuestion(id) { mutate(current => ({ ...current, questions:current.questions.map(item => item.id===id ? {...item,visibility:'public',status:'pending_review'} : item) })); void cloudPatchQuestion(id,{visibility:'public',status:'pending_review'}) },
    createQuiz(input) { const quiz:Quiz={id:crypto.randomUUID(),teacherId:state.user?.id ?? 'teacher-demo',createdAt:new Date().toISOString(),...input,settings:normalizeQuizSettings(input.settings)}; mutate(current=>({...current,quizzes:[quiz,...current.quizzes]})); void cloudCreateQuiz(quiz); return quiz },
    async launchSession(quizId,classId) {
      let session:QuizSession|undefined
      for(let attempt=0;attempt<5;attempt+=1){
        const candidate:QuizSession={id:crypto.randomUUID(),quizId,teacherId:state.user?.id ?? 'teacher-demo',classId,pin:String(Math.floor(100000+Math.random()*900000)),status:'waiting',currentQuestionIndex:-1,revealedQuestionIndex:-1,participants:[]}
        try{
          if(isSupabaseConfigured)await cloudCreateSession(candidate)
          session=candidate
          break
        }catch(error){
          if((error as {code?:string})?.code!=='23505')throw error
        }
      }
      if(!session)throw new Error('Could not reserve a game PIN. Please try again.')
      mutate(current=>({...current,sessions:[session!,...current.sessions.filter(item=>item.id!==session!.id)]}))
      return session
    },
    async updateSession(id,patch) {
      if(isSupabaseConfigured)await cloudPatchSession(id,patch)
      mutate(current=>({...current,sessions:current.sessions.map(item=>{
        if(item.id!==id)return item
        let next={...item,...patch}
        if(patch.status==='ended'){
          const quiz=current.quizzes.find(q=>q.id===item.quizId)
          next={...next,participants:next.participants.map(participant=>quiz&&quiz.questionIds.length>0&&quiz.questionIds.every(questionId=>participant.answers[questionId]?.correct)?awardBadge(participant,'perfect_round'):participant)}
        }
        return next
      })}))
    },
    async revealQuestion(sessionId,questionId) {
      const target=state.sessions.find(session=>session.id===sessionId)
      if(isSupabaseConfigured&&target)await cloudPatchSession(sessionId,{revealedQuestionIndex:target.currentQuestionIndex})
      mutate(current=>({...current,sessions:current.sessions.map(session=>{
        if(session.id!==sessionId)return session
        const correct=[...session.participants].filter(p=>p.answers[questionId]?.correct).sort((a,b)=>a.answers[questionId].responseTimeMs-b.answers[questionId].responseTimeMs)
        return {...session,revealedQuestionIndex:session.currentQuestionIndex,participants:session.participants.map(participant=>participant.id===correct[0]?.id?awardBadge(participant,'fastest_correct',questionId):participant)}
      })}))
    },
    async joinSession(pin,nickname) {
      if(isSupabaseConfigured)return joinCloudLiveGame(pin,nickname)
      const normalized=pin.trim().toUpperCase()
      const found=state.sessions.find(item=>item.pin.toUpperCase()===normalized&&item.status!=='ended')
      if(!found)throw new Error('Game not found')
      const participantId=crypto.randomUUID()
      const quiz=state.quizzes.find(item=>item.id===found.quizId)
      mutate(current=>({...current,sessions:current.sessions.map(item=>item.id===found.id?{...item,participants:[...item.participants,initialParticipant(participantId,nickname,quiz?.settings.enablePowerups??true)]}:item)}))
      return {sessionId:found.id,participantId}
    },
    async usePowerup(sessionId,participantId,questionId,powerup,clientToken) {
      if(isSupabaseConfigured){
        await useCloudLivePowerup({sessionId,participantId,clientToken},questionId,powerup)
        return true
      }
      const session=state.sessions.find(item=>item.id===sessionId);const participant=session?.participants.find(item=>item.id===participantId);const quiz=state.quizzes.find(item=>item.id===session?.quizId)
      if(!session||!participant||!quiz?.settings.enablePowerups||participant.answers[questionId]||participant.activePowerup?.questionId===questionId||(participant.powerups[powerup]??0)<1)return false
      mutate(current=>({...current,sessions:current.sessions.map(item=>item.id===sessionId?{...item,participants:item.participants.map(p=>p.id===participantId?{...p,powerups:{...p.powerups,[powerup]:p.powerups[powerup]-1},activePowerup:{type:powerup,questionId},powerupEvents:[...p.powerupEvents,{type:powerup,questionId,usedAt:new Date().toISOString(),effect:powerupEffect(powerup)}]}:p)}:item)}))
      return true
    },
    async submitLiveAnswer(sessionId,participantId,questionId,answer,responseTimeMs,clientToken) {
      if(isSupabaseConfigured){
        await submitCloudLiveAnswer({sessionId,participantId,clientToken},questionId,answer,responseTimeMs)
        return
      }
      mutate(current=>{ const question=current.questions.find(item=>item.id===questionId);const session=current.sessions.find(item=>item.id===sessionId);const quiz=current.quizzes.find(item=>item.id===session?.quizId);if(!question||!session||!quiz)return current;const settings=normalizeQuizSettings(quiz.settings);return {...current,sessions:current.sessions.map(item=>item.id===sessionId?{...item,participants:item.participants.map(participant=>{
      if(participant.id!==participantId||participant.answers[questionId])return participant
      const correct=checkAnswer(question,answer);const powerup=participant.activePowerup?.questionId===questionId?participant.activePowerup.type:undefined;const scoreDetail=calculateScore({correct,responseTimeMs,timeLimitSeconds:settings.timeLimitSeconds,pointsMode:settings.pointsMode,currentStreak:participant.currentStreak,streakBonusesEnabled:settings.enableStreakBonuses,powerup});const nextStreak=correct?participant.currentStreak+1:scoreDetail.shieldUsed?participant.currentStreak:0;let next:LiveParticipant={...participant,score:participant.score+scoreDetail.total,currentStreak:nextStreak,bestStreak:Math.max(participant.bestStreak,nextStreak),activePowerup:undefined,answers:{...participant.answers,[questionId]:{answer,correct,responseTimeMs,awardedPoints:scoreDetail.total,streakAfter:nextStreak,powerupUsed:powerup,scoreDetail}}}
      if(nextStreak>=3)next=awardBadge(next,'hot_streak',questionId)
      const previousAnswers=Object.values(participant.answers);if(correct&&previousAnswers.at(-1)?.correct===false)next=awardBadge(next,'comeback',questionId)
      const topic=syllabusPoints.find(point=>point.id===question.syllabusPointId)?.topicNumber;const topicCorrect=Object.entries(next.answers).filter(([,entry])=>entry.correct).filter(([id])=>syllabusPoints.find(point=>point.id===current.questions.find(q=>q.id===id)?.syllabusPointId)?.topicNumber===topic).length;if(topicCorrect>=3)next=awardBadge(next,'topic_master',questionId)
      return next
    })}:item)}})
    },
    addImportBatch(batch,rawJson) { mutate(current=>({...current,importBatches:[batch,...current.importBatches]})); void cloudSaveImportBatch(batch,rawJson??{}) },
    logUsage(eventType,quantity=1) { mutate(current=>({...current,usageEvents:[{id:crypto.randomUUID(),eventType,quantity,createdAt:new Date().toISOString()},...current.usageEvents]})); void cloudRecordUsage(eventType,quantity) },
    async refreshCloud(){if(state.user&&isSupabaseConfigured)await hydrateCloud(state.user)},
    resetDemo() { localStorage.removeItem(STORAGE_KEY); setState(normalizeState(initialState)) },
  // state is intentional: action lookups must see current sessions and plan state.
  }), [mutate,state,hydrateCloud])

  return <AppContext.Provider value={{state,actions,hydrated}}>{children}</AppContext.Provider>
}

export function useApp() { const value=useContext(AppContext); if(!value) throw new Error('useApp must be used inside AppProvider'); return value }

function makeCode() { const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return Array.from({length:6},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('') }

function normalizeState(input:AppState):AppState {
  const seededQuestions=[...aaQuestionSeed,...aiQuestionSeed]
  const currentSeeds=new Map(seededQuestions.map(question=>[question.id,question]))
  const preservedQuestions=(input.questions??[]).filter(question=>!currentSeeds.has(question.id))
  const localClasses=isSupabaseConfigured?(input.classes??[]):[...(input.classes??[]),...initialState.classes.filter(seed=>!(input.classes??[]).some(item=>item.id===seed.id))]
  const localQuizzes=isSupabaseConfigured?(input.quizzes??[]):[...(input.quizzes??[]),...initialState.quizzes.filter(seed=>!(input.quizzes??[]).some(item=>item.id===seed.id))]
  const normalizeQuestion=(question:Question):Question=>{
    const point=syllabusById.get(question.syllabusPointId)
    return {...question,courseId:point?.courseId??(courseById.has(question.courseId)?question.courseId:defaultCourseId)}
  }
  return {...input,
    activeCourseId:courseById.has(input.activeCourseId)?input.activeCourseId:defaultCourseId,
    quizzes:localQuizzes.map(quiz=>({...quiz,courseId:courseById.has(quiz.courseId)?quiz.courseId:defaultCourseId,settings:normalizeQuizSettings(quiz.settings)})),
    sessions:(input.sessions??[]).map(session=>({...session,revealedQuestionIndex:session.revealedQuestionIndex??-1,participants:(session.participants??[]).map(participant=>({...initialParticipant(participant.id,participant.nickname),...participant,powerups:{...DEFAULT_POWERUPS,...(participant.powerups??{})},badges:participant.badges??[],powerupEvents:participant.powerupEvents??[],currentStreak:participant.currentStreak??0,bestStreak:participant.bestStreak??0,answers:participant.answers??{}}))})),
    importBatches:input.importBatches??[],usageEvents:input.usageEvents??[],attempts:input.attempts??[],
    classes:localClasses.map(item=>({...item,courseId:courseById.has(item.courseId)?item.courseId:defaultCourseId})),
    questions:[...seededQuestions,...preservedQuestions.map(normalizeQuestion)],
  }
}

function powerupEffect(powerup:PowerupType):Record<string,unknown>{
  if(powerup==='double_points')return {multiplier:2}
  if(powerup==='fifty_fifty')return {hideIncorrectChoices:2}
  if(powerup==='time_freeze')return {scoreTimeCreditMs:8000}
  return {preserveStreakOnIncorrect:true}
}
