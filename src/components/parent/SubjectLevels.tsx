import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Award } from 'lucide-react'
import type { Subject, MasteryLevel } from '@/types'

const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Math',
  language_arts: 'Language Arts',
  science: 'Science',
  social_studies: 'Social Studies',
}

const SUBJECT_ICONS: Record<Subject, string> = {
  math: '#87A878',
  language_arts: '#7A9CC6',
  science: '#C97C5D',
  social_studies: '#B8A9C9',
}

interface SubjectProgress {
  subject: Subject
  totalConcepts: number
  masteredCount: number
  proficientCount: number
  practicingCount: number
  introducedCount: number
  completedLessons: number
  level: number
  levelLabel: string
}

function computeLevel(completed: number, mastered: number): { level: number; label: string } {
  const score = completed + mastered * 2
  if (score >= 40) return { level: 10, label: 'Scholar' }
  if (score >= 30) return { level: 9, label: 'Expert' }
  if (score >= 24) return { level: 8, label: 'Advanced' }
  if (score >= 18) return { level: 7, label: 'Skilled' }
  if (score >= 14) return { level: 6, label: 'Confident' }
  if (score >= 10) return { level: 5, label: 'Capable' }
  if (score >= 7) return { level: 4, label: 'Growing' }
  if (score >= 4) return { level: 3, label: 'Building' }
  if (score >= 2) return { level: 2, label: 'Exploring' }
  if (score >= 1) return { level: 1, label: 'Beginner' }
  return { level: 0, label: 'New' }
}

interface Props {
  childId: string
  subjects: Subject[]
}

export function SubjectLevels({ childId, subjects }: Props) {
  const [progress, setProgress] = useState<SubjectProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      const [masteryRes, lessonsRes] = await Promise.all([
        supabase.from('mastery_state').select('*').eq('child_id', childId),
        supabase.from('lessons').select('subject').eq('child_id', childId).eq('status', 'completed'),
      ])

      const mastery = (masteryRes.data ?? []) as { subject: string; level: MasteryLevel }[]
      const completedLessons = (lessonsRes.data ?? []) as { subject: string }[]

      const result: SubjectProgress[] = subjects.map((subject) => {
        const subjectMastery = mastery.filter((m) => m.subject === subject)
        const subjectLessons = completedLessons.filter((l) => l.subject === subject)
        const masteredCount = subjectMastery.filter((m) => m.level === 'mastered').length
        const proficientCount = subjectMastery.filter((m) => m.level === 'proficient').length
        const practicingCount = subjectMastery.filter((m) => m.level === 'practicing').length
        const introducedCount = subjectMastery.filter((m) => m.level === 'introduced').length
        const { level, label } = computeLevel(subjectLessons.length, masteredCount)

        return {
          subject,
          totalConcepts: subjectMastery.length,
          masteredCount,
          proficientCount,
          practicingCount,
          introducedCount,
          completedLessons: subjectLessons.length,
          level,
          levelLabel: label,
        }
      })

      setProgress(result)
      setLoading(false)
    }

    fetchProgress()
  }, [childId, subjects])

  if (loading) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-sage" />
          <CardTitle>Subject Levels</CardTitle>
        </div>
        <p className="text-xs text-muted">Levels grow as lessons are completed and concepts mastered.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {progress.map((p) => {
            const pct = Math.min((p.level / 10) * 100, 100)
            return (
              <div key={p.subject} className="rounded-2xl border border-border bg-surface backdrop-blur-xl p-5 shadow-sm shadow-black/[0.03]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: SUBJECT_ICONS[p.subject] }} />
                    <span className="text-sm font-semibold">{SUBJECT_LABELS[p.subject]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-sage">Lv {p.level}</span>
                    <span className="text-[10px] text-muted">{p.levelLabel}</span>
                  </div>
                </div>

                {/* Level bar */}
                <div className="h-2 rounded-full bg-border overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: SUBJECT_ICONS[p.subject] }}
                  />
                </div>

                {/* Stats */}
                <div className="flex justify-between text-[11px] text-muted">
                  <span>{p.completedLessons} lesson{p.completedLessons !== 1 ? 's' : ''}</span>
                  {p.totalConcepts > 0 && (
                    <span>{p.masteredCount}/{p.totalConcepts} concepts mastered</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
