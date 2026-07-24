import { describe, expect, it } from 'vitest'
import { appBaseUrl, liveJoinUrl, playUrl } from './joinUrl'

describe('static-safe live join URLs',()=>{
  it('builds a development URL',()=>{
    const location={origin:'http://127.0.0.1:4173',pathname:'/'}
    expect(playUrl(location)).toBe('http://127.0.0.1:4173/#/play')
    expect(liveJoinUrl('189412',location)).toBe('http://127.0.0.1:4173/#/play/189412')
  })

  it('preserves a GitHub Pages repository path',()=>{
    const location={origin:'https://teacher.github.io',pathname:'/mathpulse/'}
    expect(appBaseUrl(location)).toBe('https://teacher.github.io/mathpulse/')
    expect(liveJoinUrl('189412',location)).toBe('https://teacher.github.io/mathpulse/#/play/189412')
  })

  it('normalizes an index document',()=>expect(playUrl({origin:'https://school.example',pathname:'/quiz/index.html'})).toBe('https://school.example/quiz/#/play'))
})
