import { afterEach,describe,expect,it,vi } from 'vitest'
import { reportSupabaseFailure } from './supabaseErrors'

describe('Supabase live error classification',()=>{
  afterEach(()=>vi.restoreAllMocks())

  it('separates RLS failures from connectivity and database failures',()=>{
    vi.spyOn(console,'error').mockImplementation(()=>{})
    expect(reportSupabaseFailure('test',{code:'42501',message:'row-level security policy rejected'}).kind).toBe('permission')
    expect(reportSupabaseFailure('test',{message:'Failed to fetch'}).kind).toBe('network')
    expect(reportSupabaseFailure('test',{code:'42883',message:'function does not exist'}).kind).toBe('database')
  })
})
