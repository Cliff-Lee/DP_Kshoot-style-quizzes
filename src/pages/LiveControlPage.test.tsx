import { act,fireEvent,render,screen } from '@testing-library/react'
import { MemoryRouter,Route,Routes } from 'react-router-dom'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import { aaQuestionSeed } from '../data/aaQuestionSeed'
import { DEFAULT_QUIZ_SETTINGS } from '../lib/gameLogic'
import { LiveControlPage } from './LiveControlPage'

const appMock=vi.hoisted(()=>({value:null as any}))
vi.mock('../state/AppContext',()=>({useApp:()=>appMock.value}))
vi.mock('../lib/supabase',()=>({isSupabaseConfigured:false,supabase:null}))

const question=aaQuestionSeed.find(item=>item.type==='multiple_choice')!
const secondQuestion=aaQuestionSeed.find(item=>item.id!==question.id&&item.type==='multiple_choice')!

describe('live quiz teacher reveal phases',()=>{
  beforeEach(()=>{vi.useFakeTimers();appMock.value=liveApp(-1)})
  afterEach(()=>{vi.useRealTimers();vi.clearAllMocks()})

  it('shows choices and response count without answer indicators or explanation while answering',()=>{
    const {container}=renderControl()
    expect(screen.getByRole('button',{name:'Reveal Answer'})).toBeInTheDocument()
    expect(screen.queryByRole('heading',{name:'Explanation'})).not.toBeInTheDocument()
    expect(screen.queryByText(question.explanation)).not.toBeInTheDocument()
    expect(screen.queryByText('Correct')).not.toBeInTheDocument()
    expect(screen.queryByText('Incorrect')).not.toBeInTheDocument()
    expect(container.querySelectorAll('.answer-choice')).toHaveLength(question.options?.length??0)
    expect(container.querySelector('.question-stage>footer')?.textContent).toContain('1of 1 answered')
  })

  it('reveals differentiated answers and a classroom-sized explanation only after the teacher action',()=>{
    appMock.value=liveApp(0)
    const {container}=renderControl()
    expect(screen.getByRole('heading',{name:'Explanation'})).toBeInTheDocument()
    expect(screen.getByText(question.explanation)).toBeInTheDocument()
    expect(screen.getAllByText('Correct').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Incorrect').length).toBeGreaterThan(0)
    expect(container.querySelector('.answer-correct')).toBeInTheDocument()
    expect(container.querySelector('.answer-incorrect')).toBeInTheDocument()
  })

  it('does not auto-reveal when the answering timer reaches zero',()=>{
    renderControl()
    act(()=>{vi.advanceTimersByTime(35_000)})
    expect(appMock.value.actions.revealQuestion).not.toHaveBeenCalled()
    expect(screen.getByRole('button',{name:'Reveal Answer'})).toBeInTheDocument()
  })

  it('uses the existing reveal action when the teacher clicks Reveal Answer',()=>{
    renderControl()
    fireEvent.click(screen.getByRole('button',{name:'Reveal Answer'}))
    expect(appMock.value.actions.revealQuestion).toHaveBeenCalledWith('session-1',question.id)
  })
})

function renderControl(){
  return render(<MemoryRouter initialEntries={['/teacher/live/session-1/control']}><Routes><Route path="/teacher/live/:sessionId/control" element={<LiveControlPage/>}/></Routes></MemoryRouter>)
}

function liveApp(revealedQuestionIndex:number){
  const response={answer:question.options?.[0].text??'',correct:false,responseTimeMs:1_000,awardedPoints:0,streakAfter:0,scoreDetail:{basePoints:0,speedBonus:0,streakBonus:0,multiplier:1,total:0,effectiveResponseTimeMs:1_000,shieldUsed:false}}
  return {
    state:{
      user:{id:'teacher-1',email:'teacher@example.test',displayName:'Teacher',role:'teacher_premium'},
      activeCourseId:question.courseId,
      questions:[question,secondQuestion],
      quizzes:[{id:'quiz-1',teacherId:'teacher-1',title:'Functions pulse',courseId:question.courseId,mode:'live',questionIds:[question.id,secondQuestion.id],settings:DEFAULT_QUIZ_SETTINGS,createdAt:'2026-07-26T00:00:00.000Z'}],
      sessions:[{id:'session-1',quizId:'quiz-1',teacherId:'teacher-1',pin:'189412',status:'live',currentQuestionIndex:0,revealedQuestionIndex,participants:[{id:'player-1',nickname:'Mina',score:0,currentStreak:0,bestStreak:0,powerups:{double_points:1,fifty_fifty:1,time_freeze:1,shield:1},badges:[],powerupEvents:[],answers:{[question.id]:response}}]}],
      classes:[],attempts:[],importBatches:[],usageEvents:[],
    },
    hydrated:true,
    actions:{
      revealQuestion:vi.fn().mockResolvedValue(undefined),
      updateSession:vi.fn().mockResolvedValue(undefined),
      refreshCloud:vi.fn().mockResolvedValue(undefined),
    },
  }
}
