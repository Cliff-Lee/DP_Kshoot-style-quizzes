import { render,screen } from '@testing-library/react'
import { MemoryRouter,Route,Routes } from 'react-router-dom'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { aaQuestionSeed } from '../data/aaQuestionSeed'
import { DEFAULT_QUIZ_SETTINGS } from '../lib/gameLogic'
import { liveCorrectAnswerLabel } from '../lib/liveGameRepository'
import { PlaySessionPage } from './PlayPages'

const appMock=vi.hoisted(()=>({value:null as any}))
vi.mock('../state/AppContext',()=>({useApp:()=>appMock.value}))
vi.mock('../lib/supabase',()=>({isSupabaseConfigured:false,supabase:null}))

const question=aaQuestionSeed.find(item=>item.type==='multiple_choice')!

describe('live quiz student reveal phases',()=>{
  beforeEach(()=>{
    sessionStorage.setItem('mathpulse-live-player-189412',JSON.stringify({sessionId:'session-1',participantId:'player-1'}))
  })
  afterEach(()=>{sessionStorage.clear();vi.clearAllMocks()})

  it('keeps result, correct answer, and explanation hidden before teacher reveal',()=>{
    appMock.value=studentApp(-1)
    renderPlayer()
    expect(screen.getByText('Answer locked')).toBeInTheDocument()
    expect(screen.queryByRole('heading',{name:'Explanation'})).not.toBeInTheDocument()
    expect(screen.queryByText(question.explanation)).not.toBeInTheDocument()
    expect(screen.queryByText(liveCorrectAnswerLabel(question))).not.toBeInTheDocument()
  })

  it('shows the same explanation and correct answer after teacher reveal',()=>{
    appMock.value=studentApp(0)
    renderPlayer()
    expect(screen.getByRole('heading',{name:'Explanation'})).toBeInTheDocument()
    expect(screen.getByText(question.explanation)).toBeInTheDocument()
    expect(screen.getByText(liveCorrectAnswerLabel(question))).toBeInTheDocument()
  })
})

function renderPlayer(){
  return render(<MemoryRouter initialEntries={['/play/189412']}><Routes><Route path="/play/:pin" element={<PlaySessionPage/>}/></Routes></MemoryRouter>)
}

function studentApp(revealedQuestionIndex:number){
  const response={answer:liveCorrectAnswerLabel(question),correct:true,responseTimeMs:1_000,awardedPoints:900,streakAfter:1,scoreDetail:{basePoints:600,speedBonus:300,streakBonus:0,multiplier:1,total:900,effectiveResponseTimeMs:1_000,shieldUsed:false}}
  return {
    state:{
      user:null,
      activeCourseId:question.courseId,
      questions:[question],
      quizzes:[{id:'quiz-1',teacherId:'teacher-1',title:'Functions pulse',courseId:question.courseId,mode:'live',questionIds:[question.id],settings:DEFAULT_QUIZ_SETTINGS,createdAt:'2026-07-26T00:00:00.000Z'}],
      sessions:[{id:'session-1',quizId:'quiz-1',teacherId:'teacher-1',pin:'189412',status:'live',currentQuestionIndex:0,revealedQuestionIndex,participants:[{id:'player-1',nickname:'Mina',score:900,currentStreak:1,bestStreak:1,powerups:{double_points:1,fifty_fifty:1,time_freeze:1,shield:1},badges:[],powerupEvents:[],answers:{[question.id]:response}}]}],
      classes:[],attempts:[],importBatches:[],usageEvents:[],
    },
    hydrated:true,
    actions:{
      joinSession:vi.fn(),
      usePowerup:vi.fn(),
      submitLiveAnswer:vi.fn(),
    },
  }
}
