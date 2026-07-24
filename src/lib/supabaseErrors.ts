export type SupabaseFailureKind='permission'|'network'|'database'

export class SupabaseOperationError extends Error {
  readonly kind:SupabaseFailureKind
  readonly code?:string

  constructor(kind:SupabaseFailureKind,message:string,code?:string){
    super(message)
    this.name='SupabaseOperationError'
    this.kind=kind
    this.code=code
  }
}

export function reportSupabaseFailure(scope:string,error:unknown,context:Record<string,unknown>={}):SupabaseOperationError{
  const record=(error&&typeof error==='object'?error:{}) as Record<string,unknown>
  const code=typeof record.code==='string'?record.code:undefined
  const rawMessage=String(record.message??error??'Unknown Supabase error')
  const permission=code==='42501'||code==='PGRST301'||/row.level security|permission denied|not authorized|jwt/i.test(rawMessage)
  const network=/failed to fetch|network|load failed|timeout|connection|offline/i.test(rawMessage)
  const kind:SupabaseFailureKind=permission?'permission':network?'network':'database'
  const message=kind==='permission'
    ?'Supabase permission error'
    :kind==='network'
      ?'Could not connect to live game'
      :'Live game database error'

  console.error(`[MathPulse:${scope}]`,{
    kind,
    code,
    message:rawMessage,
    details:record.details,
    hint:record.hint,
    ...context,
  })
  return new SupabaseOperationError(kind,message,code)
}
