export type Role = 'student' | 'teacher_free' | 'teacher_premium' | 'school_admin' | 'platform_admin'
export type CourseFamily = 'analysis_approaches' | 'applications_interpretation'
export type CourseLevel = 'SL' | 'HL'
export type QuestionType = 'multiple_choice' | 'numeric_answer' | 'short_answer' | 'multi_select' | 'true_false' | 'matching' | 'ordering' | 'drag_drop' | 'fill_blank' | 'graph_or_image_prompt'
export type Difficulty = 'foundation' | 'standard' | 'extension'
export type QuestionStyle = 'recall' | 'procedural' | 'conceptual' | 'misconception' | 'application' | 'exam_style'
export type CalculatorMode = 'allowed' | 'not_allowed' | 'neutral'
export type PointsMode = 'standard' | 'speed_bonus' | 'accuracy_only'
export type PowerupType = 'double_points' | 'fifty_fifty' | 'time_freeze' | 'shield'
export type BadgeType = 'fastest_correct' | 'hot_streak' | 'comeback' | 'topic_master' | 'perfect_round'

export interface QuizSettings {
  feedback: 'after_each' | 'after_completion' | 'teacher_controlled'
  calculatorAllowed: boolean
  shuffleQuestions: boolean
  showLeaderboard: boolean
  enablePowerups: boolean
  enableStreakBonuses: boolean
  showExplanations: boolean
  timeLimitSeconds: number
  pointsMode: PointsMode
}

export interface Course {
  id:string
  slug:string
  courseFamily:CourseFamily
  level:CourseLevel
  displayName:string
  shortName:string
  active:boolean
}

export interface SyllabusPoint {
  id: string
  courseId: string
  courseFamily: CourseFamily
  code: string
  topicNumber: number
  topicName: string
  level: 'SL' | 'AHL'
  title: string
  description: string
  parentId?: string
  sortOrder: number
}

export interface UserProfile { id: string; email: string; displayName: string; role: Role; schoolId?: string }
export interface ClassRoom { id: string; teacherId: string; name: string; courseId: string; joinCode: string; archived: boolean; members: StudentMember[]; createdAt: string }
export interface StudentMember { id: string; displayName: string; email?: string; joinedAt: string }
export interface QuestionOption { id: string; label: string; text: string; isCorrect: boolean; sortOrder: number }
export interface Question {
  id: string; createdBy: string; visibility: 'private' | 'school' | 'public'; status: 'draft' | 'pending_review' | 'approved' | 'archived';
  courseId: string; syllabusPointId: string; type: QuestionType; prompt: string; answerData: Record<string, unknown>; explanation: string;
  difficulty: Difficulty; questionStyle?: QuestionStyle; calculator?: CalculatorMode; estimatedTimeSeconds?: number; marksEstimate?: number; tags: string[]; source: 'manual' | 'chatgpt_import' | 'platform_seed'; importBatchId?: string; duplicateConfirmed?: boolean; options?: QuestionOption[]; createdAt: string; updatedAt: string
}
export interface QuizQuestion { questionId: string; sortOrder: number; points: number; timeLimitSeconds: number }
export interface Quiz { id: string; teacherId: string; title: string; courseId:string; mode: 'live' | 'assignment' | 'practice'; questionIds: string[]; settings: QuizSettings; createdAt: string }
export interface QuizSession { id: string; quizId: string; teacherId: string; classId?: string; pin: string; status: 'waiting' | 'live' | 'paused' | 'ended'; currentQuestionIndex: number; revealedQuestionIndex?: number; questionStartedAt?: string; startedAt?: string; endedAt?: string; participants: LiveParticipant[] }
export interface ScoreBreakdown { basePoints: number; speedBonus: number; streakBonus: number; multiplier: number; total: number; effectiveResponseTimeMs: number; shieldUsed: boolean }
export interface BadgeAward { type: BadgeType; awardedAt: string; questionId?: string }
export interface PowerupEvent { type: PowerupType; questionId: string; usedAt: string; effect: Record<string, unknown> }
export interface LiveAnswer { answer: unknown; correct: boolean; responseTimeMs: number; awardedPoints: number; streakAfter: number; powerupUsed?: PowerupType; scoreDetail: ScoreBreakdown }
export interface LiveParticipant { id: string; nickname: string; score: number; currentStreak: number; bestStreak: number; powerups: Record<PowerupType, number>; activePowerup?: { type: PowerupType; questionId: string }; badges: BadgeAward[]; powerupEvents: PowerupEvent[]; answers: Record<string, LiveAnswer> }
export interface AttemptAnswer { questionId: string; submittedAnswer: unknown; isCorrect: boolean; responseTimeMs: number; awardedPoints: number; scoreDetail?: ScoreBreakdown }
export interface Attempt { id: string; quizId: string; sessionId?: string; studentId: string; studentName: string; classId?: string; startedAt: string; completedAt?: string; score: number; maxScore: number; answers: AttemptAnswer[] }
export interface ImportBatch { id: string; createdAt: string; status: 'uploaded' | 'validated' | 'partially_valid' | 'imported' | 'failed'; importedCount: number; errorCount: number; validationErrors: unknown[] }
export interface UsageEvent { id: string; eventType: string; quantity: number; createdAt: string }
export interface Plan { id: string; name: string; monthlyPrice: number; limits: Record<string, number | null>; features: string[] }

export interface AppState {
  user: UserProfile | null
  activeCourseId:string
  questions: Question[]
  classes: ClassRoom[]
  quizzes: Quiz[]
  sessions: QuizSession[]
  attempts: Attempt[]
  importBatches: ImportBatch[]
  usageEvents: UsageEvent[]
}
