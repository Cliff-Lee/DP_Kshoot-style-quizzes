import type { AppState, Plan } from '../types'

export const plans: Plan[] = [
  { id: 'free', name: 'Free teacher', monthlyPrice: 0, limits: { classes: 2, students: 60, private_questions: 100, imports: 5, exports: 0, prompt_generations: 20 }, features: ['Live quiz mode', 'Basic mastery reports', 'ChatGPT JSON import'] },
  { id: 'premium', name: 'Premium teacher', monthlyPrice: 14, limits: { classes: null, students: null, private_questions: null, imports: null, exports: null, prompt_generations: null }, features: ['Advanced reports', 'CSV/PDF export', 'Adapt public questions', 'Weak-topic recommendations'] },
  { id: 'school', name: 'School', monthlyPrice: 89, limits: { classes: null, students: null, private_questions: null, imports: null, exports: null, prompt_generations: null }, features: ['Shared school bank', 'Admin dashboard', 'School-wide reports', 'Central billing'] },
]

export type GateAction = 'classes' | 'students' | 'private_questions' | 'imports' | 'exports' | 'prompt_generations'

export function getPlanForRole(role?: string) {
  if (role === 'teacher_premium') return plans[1]
  if (role === 'school_admin' || role === 'platform_admin') return plans[2]
  return plans[0]
}

export function checkPlanGate(state: AppState, action: GateAction): { allowed: boolean; used: number; limit: number | null; message: string } {
  const plan = getPlanForRole(state.user?.role)
  const limit = plan.limits[action] ?? null
  let used = 0
  if (action === 'classes') used = state.classes.filter(item => !item.archived).length
  if (action === 'students') used = state.classes.reduce((sum, item) => sum + item.members.length, 0)
  if (action === 'private_questions') used = state.questions.filter(item => item.visibility === 'private' && item.status !== 'archived').length
  if (['imports','exports','prompt_generations'].includes(action)) {
    const month = new Date().toISOString().slice(0, 7)
    const event = action === 'imports' ? 'import_batch' : action === 'exports' ? 'report_export' : 'prompt_generation'
    used = state.usageEvents.filter(item => item.eventType === event && item.createdAt.startsWith(month)).reduce((sum, item) => sum + item.quantity, 0)
  }
  const allowed = limit === null || used < limit
  return { allowed, used, limit, message: allowed ? '' : `${plan.name} allows ${limit} ${action.replace('_', ' ')}. Upgrade to continue.` }
}
