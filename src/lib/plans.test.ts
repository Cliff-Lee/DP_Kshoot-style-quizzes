import { describe, expect, it } from 'vitest'
import { initialState } from '../data/demo'
import { checkPlanGate } from './plans'

describe('plan gates',()=>{
  it('reads limits from the plan definition',()=>{const state={...initialState,user:{id:'teacher-demo',email:'a@b.test',displayName:'A',role:'teacher_free' as const}};const gate=checkPlanGate(state,'classes');expect(gate.limit).toBe(2);expect(gate.used).toBe(3);expect(gate.allowed).toBe(false)})
  it('treats premium limits as unlimited',()=>{const state={...initialState,user:{id:'teacher-demo',email:'a@b.test',displayName:'A',role:'teacher_premium' as const}};expect(checkPlanGate(state,'classes').allowed).toBe(true);expect(checkPlanGate(state,'imports').limit).toBeNull()})
})
