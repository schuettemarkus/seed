import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import type { Lesson, Subject } from '@/types'

const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Math',
  language_arts: 'Language Arts',
  science: 'Science',
  social_studies: 'Social Studies',
}

const SUBJECT_COLORS: Record<string, string> = {
  math: '#87A878',
  language_arts: '#7A9CC6',
  science: '#C97C5D',
  social_studies: '#B8A9C9',
}

export function LessonHistory() {
  const { childId } = useParams()
  const { child } = useChild(childId)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    supabase
      .from('lessons')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setLessons((data as Lesson[]) ?? [])
        setLoading(false)
      })
  }, [childId])

  // Group by date
  const grouped: Record<string, Lesson[]> = {}
  for (const lesson of lessons) {
    const date = lesson.completed_at
      ? new Date(lesson.completed_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'Unknown'
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(lesson)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {child?.name ? child.name + "'s" : ''} Lesson History
            </h1>
            <p className="text-sm text-muted">{lessons.length} completed lessons</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-3xl mx-auto space-y-6">
        {loading ? (
          <div className="text-muted text-center py-12">Loading history...</div>
        ) : lessons.length === 0 ? (
          <Card className="text-center py-12">
            <CheckCircle2 className="h-10 w-10 text-border mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold mb-2">No completed lessons yet</h2>
            <p className="text-sm text-muted">Lessons will appear here as {child?.name ?? 'your child'} completes them.</p>
          </Card>
        ) : (
          Object.entries(grouped).map(([date, dateLessons]) => (
            <div key={date}>
              <h2 className="font-display text-sm font-semibold text-muted mb-3">{date}</h2>
              <div className="space-y-2">
                {dateLessons.map((lesson) => (
                  <Card key={lesson.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-sage flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: SUBJECT_COLORS[lesson.subject] ?? '#87A878' }} />
                          <span className="text-xs text-muted">{SUBJECT_LABELS[lesson.subject as Subject] ?? lesson.subject}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted flex-shrink-0">
                        <Clock className="h-3.5 w-3.5" />
                        {lesson.estimated_minutes} min
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
