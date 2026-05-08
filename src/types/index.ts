// ============ AUTH & USERS ============

export interface Parent {
  id: string
  email: string
  full_name: string | null
  timezone: string
  subscription_tier: 'free' | 'solo' | 'family'
  stripe_customer_id: string | null
  default_content_axis: ContentAxis
  created_at: string
}

export type Gender = 'he' | 'she' | 'they'
export type Language = 'en' | 'es' | 'zh' | 'fr' | 'de'
export type Subject = 'math' | 'language_arts' | 'science' | 'social_studies'
export type PedagogyLean = 'calm' | 'structured' | 'child_led' | 'balanced'
export type ContentAxis = 'secular' | 'faith_neutral' | 'christian' | 'lds' | 'jewish' | 'other'

export interface Accommodations {
  dyslexia_font: boolean
  reduced_motion: boolean
  extended_time: boolean
  larger_text: boolean
  shorter_blocks: boolean
  faster_pacing: boolean
}

export interface Child {
  id: string
  parent_id: string
  name: string
  age: number
  gender: Gender
  language: Language
  subjects: Subject[]
  pedagogy_lean: PedagogyLean
  content_axis: ContentAxis
  content_axis_notes: string | null
  accommodations: Accommodations
  avatar_color: string
  created_at: string
}

// ============ COPPA ============

export interface ParentalConsent {
  id: string
  parent_id: string
  child_id: string
  consented_at: string
  ip_address: string | null
  user_agent: string | null
  consent_version: string
  privacy_policy_version: string
  tos_version: string
}

// ============ FAMILY INVITES ============

export type InviteRole = 'co_parent' | 'grandparent' | 'tutor' | 'viewer'
export type InviteStatus = 'pending' | 'accepted' | 'revoked'

export interface FamilyInvite {
  id: string
  parent_id: string
  email: string
  role: InviteRole
  status: InviteStatus
  invite_token: string
  invited_user_id: string | null
  created_at: string
  accepted_at: string | null
}

// ============ CURRICULUM & LESSONS ============

export interface Curriculum {
  id: string
  child_id: string
  subject: Subject
  generated_at: string
  spec: Record<string, unknown>
}

export type LessonStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface LessonSegment {
  type: 'drag_drop' | 'draw' | 'voice' | 'click_explore' | 'simulation' | 'text' | 'interactive'
  title: string
  content: string
  instructions: string
  data?: Record<string, unknown>
}

export interface Lesson {
  id: string
  child_id: string
  curriculum_id: string
  subject: Subject
  concept_node: string
  title: string
  hook: string | null
  segments: LessonSegment[]
  questions: Record<string, unknown>[] | null
  movement_break: Record<string, unknown> | null
  estimated_minutes: number | null
  pedagogy_source: string | null
  content_axis: ContentAxis | null
  language: Language | null
  status: LessonStatus
  scheduled_for: string | null
  created_at: string
  completed_at: string | null
}

// ============ PROGRESS & MASTERY ============

export interface LessonProgress {
  id: string
  lesson_id: string
  child_id: string
  segment_index: number
  response: Record<string, unknown> | null
  correct: boolean | null
  time_spent_seconds: number | null
  created_at: string
}

export type MasteryLevel = 'introduced' | 'practicing' | 'proficient' | 'mastered'

export interface MasteryState {
  id: string
  child_id: string
  subject: Subject
  concept_node: string
  level: MasteryLevel
  last_seen_at: string
}

// ============ FEEDBACK ============

export interface LessonFeedback {
  id: string
  lesson_id: string
  child_id: string
  parent_id: string
  rating: -1 | 1
  reason: string | null
  notes: string | null
  created_at: string
}

// ============ WONDER WALL ============

export type WonderStatus = 'pending' | 'answered' | 'dismissed'

export interface WonderQuestion {
  id: string
  child_id: string
  parent_lesson_id: string | null
  question_text: string
  status: WonderStatus
  bonus_lesson_id: string | null
  created_at: string
}

// ============ PORTFOLIO ============

export type PortfolioEntryType = 'drawing' | 'voice' | 'text' | 'milestone' | 'parent_favorite'

export interface PortfolioEntry {
  id: string
  child_id: string
  lesson_id: string | null
  entry_type: PortfolioEntryType
  title: string | null
  storage_path: string | null
  caption: string | null
  is_parent_favorite: boolean
  created_at: string
}

// ============ RHYTHM ============

export interface FamilyRhythm {
  id: string
  parent_id: string
  schedule: Record<string, unknown>
  template: string | null
  updated_at: string
}

// ============ COMPLIANCE ============

export interface ComplianceLog {
  id: string
  child_id: string
  date: string
  hours_logged: number | null
  subjects_covered: Subject[] | null
  notes: string | null
  created_at: string
}

// ============ USAGE ============

export interface UsageLog {
  id: string
  parent_id: string
  child_id: string
  endpoint: string
  input_tokens: number | null
  output_tokens: number | null
  cost_usd: number | null
  created_at: string
}
