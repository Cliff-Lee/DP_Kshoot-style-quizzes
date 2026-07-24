import { describe,expect,it } from 'vitest'
import { mapLiveSnapshot,normalizeGamePin } from './liveGameRepository'

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
})
