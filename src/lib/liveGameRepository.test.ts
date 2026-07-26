import { describe,expect,it } from 'vitest'
import { currentQuestionFromSnapshot,isLiveQuestionRevealed,liveQuestionPhase,mapLiveSnapshot,normalizeGamePin } from './liveGameRepository'

describe('cross-device live game repository',()=>{
  it('normalizes pasted and case-mixed PINs',()=>{
    expect(normalizeGamePin(' ab 12-cd ')).toBe('AB12CD')
  })

  it('maps a PIN-scoped cloud snapshot into app models',()=>{
    const result=mapLiveSnapshot({
      state:'waiting',
      session:{id:'session-1',quizId:'quiz-1',pin:'189412',status:'waiting',currentQuestionIndex:-1,revealedQuestionIndex:-1,participants:[{id:'player-1',nickname:'Mina',score:0}]},
      quiz:{id:'quiz-1',title:'Functions pulse',courseId:'course-1',mode:'live',settings:{timeLimitSeconds:45},questionIds:['question-1']},
      question:null,
      player:null,
    })
    expect(result.session?.pin).toBe('189412')
    expect(result.quiz?.title).toBe('Functions pulse')
    expect(result.session?.participants[0].nickname).toBe('Mina')
  })

  it('returns a terminal state without exposing an ended game',()=>{
    expect(mapLiveSnapshot({state:'ended'})).toEqual({state:'ended',questions:[]})
  })

  it('resolves the live question from the server snapshot rather than a local quiz array',()=>{
    const result=mapLiveSnapshot({
      state:'live',
      currentQuestionId:'question-1',
      questionCount:1,
      session:{id:'session-1',quizId:'quiz-1',pin:'189412',status:'live',currentQuestionIndex:0,revealedQuestionIndex:-1,questionStartedAt:'2026-07-24T10:00:00.000Z',participants:[]},
      quiz:{id:'quiz-1',title:'Functions pulse',courseId:'course-1',mode:'live',settings:{timeLimitSeconds:45},questionIds:[]},
      question:{
        id:'question-1',
        courseId:'course-1',
        syllabusPointId:'point-1',
        type:'multiple_choice',
        prompt:'If f(x)=2x+1, find f(3).',
        answerData:{},
        explanation:'',
        options:[
          {id:'option-1',label:'A',text:'5',isCorrect:false,sortOrder:0},
          {id:'option-2',label:'B',text:'7',isCorrect:false,sortOrder:1},
        ],
      },
      player:null,
    })

    expect(currentQuestionFromSnapshot(result)?.id).toBe('question-1')
    expect(result.session?.questionStartedAt).toBe('2026-07-24T10:00:00.000Z')
    expect(currentQuestionFromSnapshot(result)?.answerData).toEqual({})
    expect(currentQuestionFromSnapshot(result)?.options?.every(option=>!option.isCorrect)).toBe(true)
  })

  it('starts every active question in the answering phase',()=>{
    expect(liveQuestionPhase({currentQuestionIndex:-1,revealedQuestionIndex:-1})).toBe('waiting')
    expect(liveQuestionPhase({currentQuestionIndex:0,revealedQuestionIndex:-1})).toBe('answering')
    expect(isLiveQuestionRevealed({currentQuestionIndex:0,revealedQuestionIndex:-1})).toBe(false)
  })

  it('removes correct answers, answer data, and explanations from answering-phase student snapshots',()=>{
    const result=mapLiveSnapshot(liveSnapshot({currentQuestionIndex:0,revealedQuestionIndex:-1}))
    const question=currentQuestionFromSnapshot(result)!
    expect(question.answerData).toEqual({})
    expect(question.explanation).toBe('')
    expect(question.options?.every(option=>!option.isCorrect)).toBe(true)
    expect(result.session?.participants[0].answers['question-1'].correct).toBe(false)
    expect(result.session?.participants[0].answers['question-1'].awardedPoints).toBe(0)
    expect(JSON.stringify(result)).not.toContain('Substitute x=3')
  })

  it('exposes answers and explanation only after reveal',()=>{
    const result=mapLiveSnapshot(liveSnapshot({currentQuestionIndex:0,revealedQuestionIndex:0}))
    const question=currentQuestionFromSnapshot(result)!
    expect(liveQuestionPhase(result.session)).toBe('revealed')
    expect(question.answerData).toEqual({answer:'7'})
    expect(question.explanation).toBe('Substitute x=3 to obtain 2(3)+1=7.')
    expect(question.options?.find(option=>option.text==='7')?.isCorrect).toBe(true)
    expect(result.session?.participants[0].answers['question-1'].correct).toBe(true)
    expect(result.session?.participants[0].answers['question-1'].awardedPoints).toBe(900)
  })

  it('resets the next question to hidden even when the previous index was revealed',()=>{
    const result=mapLiveSnapshot(liveSnapshot({currentQuestionIndex:1,revealedQuestionIndex:0}))
    const question=currentQuestionFromSnapshot(result)!
    expect(liveQuestionPhase(result.session)).toBe('answering')
    expect(question.answerData).toEqual({})
    expect(question.explanation).toBe('')
    expect(question.options?.every(option=>!option.isCorrect)).toBe(true)
  })
})

function liveSnapshot(indexes:{currentQuestionIndex:number;revealedQuestionIndex:number}){
  return {
    state:'live',
    currentQuestionId:'question-1',
    questionCount:2,
    session:{id:'session-1',quizId:'quiz-1',pin:'189412',status:'live',...indexes,participants:[]},
    quiz:{id:'quiz-1',title:'Functions pulse',courseId:'course-1',mode:'live',settings:{timeLimitSeconds:45},questionIds:['question-0','question-1']},
    question:{
      id:'question-1',
      courseId:'course-1',
      syllabusPointId:'point-1',
      type:'multiple_choice',
      prompt:'If f(x)=2x+1, find f(3).',
      answerData:{answer:'7'},
      explanation:'Substitute x=3 to obtain 2(3)+1=7.',
      options:[
        {id:'option-1',label:'A',text:'5',isCorrect:false,sortOrder:0},
        {id:'option-2',label:'B',text:'7',isCorrect:true,sortOrder:1},
      ],
    },
    player:{
      id:'player-1',
      nickname:'Mina',
      score:900,
      currentStreak:1,
      bestStreak:1,
      answers:{
        'question-1':{
          answer:'7',
          correct:true,
          responseTimeMs:1_000,
          awardedPoints:900,
          streakAfter:1,
          scoreDetail:{basePoints:600,speedBonus:300,total:900},
        },
      },
    },
  }
}
