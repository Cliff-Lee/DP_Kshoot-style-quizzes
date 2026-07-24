import type { BadgeAward, BadgeType, LiveParticipant, PointsMode, PowerupType, Question, QuizSettings, ScoreBreakdown } from '../types'

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  feedback: 'after_each',
  calculatorAllowed: false,
  shuffleQuestions: false,
  showLeaderboard: true,
  enablePowerups: true,
  enableStreakBonuses: true,
  showExplanations: true,
  timeLimitSeconds: 30,
  pointsMode: 'speed_bonus',
}

export const DEFAULT_POWERUPS: Record<PowerupType, number> = {
  double_points: 1,
  fifty_fifty: 1,
  time_freeze: 1,
  shield: 1,
}

export function normalizeQuizSettings(settings?: Partial<QuizSettings> | Record<string, unknown>): QuizSettings {
  return { ...DEFAULT_QUIZ_SETTINGS, ...(settings ?? {}) } as QuizSettings
}

const normalizeText = (value: unknown) => String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase()
const normalizeList = (value: unknown) => Array.isArray(value) ? value.map(normalizeText) : []

export function checkAnswer(question: Question | undefined, submitted: unknown): boolean {
  if (!question) return false
  const data = question.answerData
  if (question.type === 'numeric_answer') {
    const value = Number(submitted); const target = Number(data.answer)
    return Number.isFinite(value) && Number.isFinite(target) && Math.abs(value - target) <= Number(data.tolerance ?? 0)
  }
  if (question.type === 'short_answer' || question.type === 'fill_blank') {
    const values = [data.answer, ...(Array.isArray(data.acceptedAnswers) ? data.acceptedAnswers : [])]
    return values.some(value => normalizeText(value) === normalizeText(submitted))
  }
  if (question.type === 'true_false') return submitted === data.answer || normalizeText(submitted) === normalizeText(data.answer)
  if (question.type === 'multi_select') {
    const target = normalizeList(data.answers ?? data.answer).sort()
    const answer = normalizeList(submitted).sort()
    return target.length > 0 && target.length === answer.length && target.every((value, index) => value === answer[index])
  }
  if (question.type === 'ordering') {
    const target = normalizeList(data.correctOrder ?? data.items ?? data.answer)
    const answer = normalizeList(submitted)
    return target.length > 0 && target.length === answer.length && target.every((value, index) => value === answer[index])
  }
  if (question.type === 'matching') {
    const pairs = Array.isArray(data.pairs) ? data.pairs as Array<{ left?: unknown; right?: unknown }> : []
    if (!submitted || typeof submitted !== 'object' || Array.isArray(submitted)) return false
    const answer = submitted as Record<string, unknown>
    return pairs.length > 0 && pairs.every(pair => normalizeText(answer[String(pair.left)]) === normalizeText(pair.right))
  }
  if (question.type === 'drag_drop') {
    const items = Array.isArray(data.items) ? data.items as Array<{ text?: unknown; correctZone?: unknown }> : []
    if (!submitted || typeof submitted !== 'object' || Array.isArray(submitted)) return false
    const answer = submitted as Record<string, unknown>
    return items.length > 0 && items.every(item => normalizeText(answer[String(item.text)]) === normalizeText(item.correctZone))
  }
  return normalizeText(submitted) === normalizeText(data.answer)
}

export function calculateScore(input: {
  correct: boolean
  responseTimeMs: number
  timeLimitSeconds: number
  pointsMode: PointsMode
  currentStreak: number
  streakBonusesEnabled: boolean
  powerup?: PowerupType
}): ScoreBreakdown {
  const frozenMs = input.powerup === 'time_freeze' ? 8000 : 0
  const effectiveResponseTimeMs = Math.max(0, input.responseTimeMs - frozenMs)
  const shieldUsed = !input.correct && input.powerup === 'shield'
  if (!input.correct) return { basePoints: 0, speedBonus: 0, streakBonus: 0, multiplier: 1, total: 0, effectiveResponseTimeMs, shieldUsed }

  const timeLimitMs = Math.max(1000, input.timeLimitSeconds * 1000)
  const speedRatio = Math.max(0, 1 - effectiveResponseTimeMs / timeLimitMs)
  const basePoints = input.pointsMode === 'speed_bonus' ? 600 : input.pointsMode === 'standard' ? 800 : 1000
  const speedCeiling = input.pointsMode === 'speed_bonus' ? 400 : input.pointsMode === 'standard' ? 200 : 0
  const speedBonus = Math.round(speedCeiling * speedRatio)
  const streakBonus = input.streakBonusesEnabled ? Math.min(input.currentStreak, 5) * 50 : 0
  const multiplier = input.powerup === 'double_points' ? 2 : 1
  const total = Math.max(0, Math.round((basePoints + speedBonus + streakBonus) * multiplier))
  return { basePoints, speedBonus, streakBonus, multiplier, total, effectiveResponseTimeMs, shieldUsed }
}

export function initialParticipant(id: string, nickname: string, powerupsEnabled = true): LiveParticipant {
  return { id, nickname, score: 0, currentStreak: 0, bestStreak: 0, powerups: powerupsEnabled ? { ...DEFAULT_POWERUPS } : { double_points:0, fifty_fifty:0, time_freeze:0, shield:0 }, badges: [], powerupEvents: [], answers: {} }
}

export function awardBadge(participant: LiveParticipant, type: BadgeType, questionId?: string): LiveParticipant {
  if (participant.badges.some(badge => badge.type === type)) return participant
  const award: BadgeAward = { type, questionId, awardedAt: new Date().toISOString() }
  return { ...participant, badges: [...participant.badges, award] }
}
