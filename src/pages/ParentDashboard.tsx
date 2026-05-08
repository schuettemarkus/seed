import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { useMastery } from '@/hooks/useMastery'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, TrendingUp, Clock } from 'lucide-react'
import type { Lesson, Subject } from '@/types'

const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Math',
  language_arts: 'Language Arts',
  science: 'Science',
  social_studies: 'Social Studies',
}

const MASTERY_COLORS: Record<string, string> = {
  introduced: '#E8E6DF',
  practicing: '#7A9CC6',
  proficient: '#87A878',
  mastered: '#6b8c5e',
}

export function ParentDashboard() {
  const { childId } = useParams()
  const { child } = useChild(childId)
  const { mastery } = useMastery(childId)
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([])
  const [weekStats, setWeekStats] = useState({ completed: 0, totalMinutes: 0 })

  useEffect(() => {
    if (!childId) return

    // Fetch recent completed lessons
    supabase
      .from('lessons')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setRecentLessons((data as Lesson[]) ?? [])
      })

    // Fetch this week's stats
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    supabase
      .from('lessons')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .gte('completed_at', weekAgo.toISOString())
      .then(({ data }) => {
        const lessons = (data as Lesson[]) ?? []
        setWeekStats({
          completed: lessons.length,
          totalMinutes: lessons.reduce((sum, l) => sum + (l.estimated_minutes ?? 0), 0),
        })
      })
  }, [childId])

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  // Group mastery by subject
  const masteryBySubject = child.subjects.reduce<Record<Subject, typeof mastery>>((acc, subject) => {
    acc[subject] = mastery.filter((m) => m.subject === subject)
    return acc
  }, {} as Record<Subject, typeof mastery>)

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold">{child.name}'s Progress</h1>
            <p className="text-sm text-muted">Age {child.age} · This week's overview</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-4xl mx-auto space-y-6">
        {/* Week at a glance */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-sage" />
              <div>
                <div className="text-2xl font-display font-semibold">{weekStats.completed}</div>
                <div className="text-xs text-muted">Lessons this week</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-sky" />
              <div>
                <div className="text-2xl font-display font-semibold">{weekStats.totalMinutes}</div>
                <div className="text-xs text-muted">Minutes learned</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Mastery by subject */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sage" />
              <CardTitle>Mastery Map</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {child.subjects.map((subject) => {
              const subjectMastery = masteryBySubject[subject] ?? []
              return (
                <div key={subject}>
                  <h3 className="text-sm font-medium mb-2">{SUBJECT_LABELS[subject]}</h3>
                  {subjectMastery.length === 0 ? (
                    <p className="text-xs text-muted">No concepts tracked yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {subjectMastery.map((m) => (
                        <span
                          key={m.id}
                          className="rounded-md px-2 py-1 text-xs"
                          style={{
                            backgroundColor: MASTERY_COLORS[m.level] ?? '#E8E6DF',
                            color: m.level === 'mastered' || m.level === 'proficient' ? 'white' : '#1A1A1A',
                          }}
                          title={`${m.concept_node}: ${m.level}`}
                        >
                          {m.concept_node.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="flex gap-3 pt-2">
              {Object.entries(MASTERY_COLORS).map(([level, color]) => (
                <div key={level} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-xs text-muted capitalize">{level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent lessons */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLessons.length === 0 ? (
              <p className="text-sm text-muted">No completed lessons yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentLessons.map((lesson) => (
                  <div key={lesson.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{lesson.title}</p>
                      <p className="text-xs text-muted">
                        {SUBJECT_LABELS[lesson.subject as Subject] ?? lesson.subject} ·{' '}
                        {lesson.completed_at ? new Date(lesson.completed_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <span className="text-xs text-sage font-medium">Completed</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
