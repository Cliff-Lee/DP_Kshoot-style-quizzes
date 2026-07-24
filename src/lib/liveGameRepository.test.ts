import { describe,expect,it } from 'vitest'
import { currentQuestionFromSnapshot,mapLiveSnapshot,normalizeGamePin } from './liveGameRepository'

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
})
