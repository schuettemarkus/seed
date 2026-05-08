import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { useTodayPath } from '@/hooks/useTodayPath'
import { useAccommodations } from '@/hooks/useAccommodations'
import { generateTodayLessons } from '@/lib/lesson-generator'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, Clock, Sparkles, Loader2 } from 'lucide-react'
import type { Lesson } from '@/types'

const SUBJECT_LABELS: Record<string, string> = {
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

function LessonIcon({ status }: { status: Lesson['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-6 w-6 text-sage" />
    case 'in_progress':
      return <PlayCircle className="h-6 w-6 text-sky" />
    case 'skipped':
      return <Circle className="h-6 w-6 text-muted" />
    default:
      return <Circle className="h-6 w-6 text-border" />
  }
}

export function ChildToday() {
  const { childId } = useParams()
  const { child } = useChild(childId)
  const { lessons, loading, completedCount, totalCount, refetch } = useTodayPath(childId)
  const { classes } = useAccommodations(child?.accommodations)
  const [generating, setGenerating] = useState(false)
  const generatingRef = useRef(false)

  // Auto-generate today's lessons if none exist
  useEffect(() => {
    if (!child || loading || lessons.length > 0 || generatingRef.current) return
    generatingRef.current = true
    setGenerating(true)
    console.log('[Seed] Generating lessons for', child.name, '...')
    generateTodayLessons(child).then(() => {
      console.log('[Seed] Lesson generation complete, refetching...')
      refetch().then(() => {
        setGenerating(false)
        generatingRef.current = false
      })
    }).catch((err) => {
      console.error('[Seed] Lesson generation failed:', err)
      setGenerating(false)
      generatingRef.current = false
    })
  }, [child, loading, lessons.length, refetch])

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allDone = completedCount === totalCount && totalCount > 0

  return (
    <div className={`min-h-screen bg-background ${classes}`}>
      {/* Header */}
      <header className="px-6 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="text-center">
            <h1 className="font-display text-xl font-semibold">{child.name}'s Day</h1>
            <p className="text-xs text-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="w-11" /> {/* spacer */}
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted mb-2">
            <span>{completedCount} of {totalCount} lessons</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-sage transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Today Path — vertical timeline */}
      <main className="px-6 pb-12 max-w-2xl mx-auto">
        {loading || generating ? (
          <Card className="text-center py-12">
            <Loader2 className="h-10 w-10 text-sage mx-auto mb-4 animate-spin" />
            <h2 className="font-display text-lg font-semibold mb-2">
              {generating ? 'Preparing today\'s lessons...' : 'Loading...'}
            </h2>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Building a personalized learning path for {child.name}.
            </p>
          </Card>
        ) : lessons.length === 0 ? (
          <Card className="text-center py-12">
            <Sparkles className="h-10 w-10 text-sage mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold mb-2">No lessons yet</h2>
            <p className="text-sm text-muted max-w-sm mx-auto">
              Something went wrong generating lessons for {child.name}. Try refreshing the page.
            </p>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[18px] top-3 bottom-3 w-0.5 bg-border" />

            <div className="space-y-4">
              {lessons.map((lesson, i) => {
                const isActive = lesson.status === 'pending' || lesson.status === 'in_progress'
                const isDone = lesson.status === 'completed'

                return (
                  <div key={lesson.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 mt-4 flex-shrink-0">
                      <LessonIcon status={lesson.status} />
                    </div>

                    {/* Lesson card */}
                    <Card
                      className={`flex-1 p-4 transition-all ${
                        isActive ? 'border-sage shadow-md' : isDone ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ backgroundColor: SUBJECT_COLORS[lesson.subject] ?? '#87A878' }}
                            />
                            <span className="text-xs text-muted font-medium">
                              {SUBJECT_LABELS[lesson.subject] ?? lesson.subject}
                            </span>
                          </div>
                          <h3 className="font-display text-base font-semibold leading-snug">
                            {lesson.title}
                          </h3>
                          {lesson.hook && (
                            <p className="text-sm text-muted mt-1 leading-relaxed">{lesson.hook}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted flex-shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{lesson.estimated_minutes ?? '?'} min</span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-3">
                          <Button size="sm" asChild>
                            <Link to={`/lesson/${lesson.id}`}>
                              {lesson.status === 'in_progress' ? 'Continue' : 'Start lesson'}
                            </Link>
                          </Button>
                        </div>
                      )}
                    </Card>

                    {/* Movement break indicator between lessons */}
                    {i < lessons.length - 1 && lesson.movement_break && (
                      <div className="absolute -bottom-2 left-[13px] z-10">
                        <div className="h-3 w-3 rounded-full bg-terracotta/30 border-2 border-background" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* All done message */}
            {allDone && (
              <Card className="mt-6 text-center py-8 border-sage/30 bg-sage/5">
                <Sparkles className="h-8 w-8 text-sage mx-auto mb-3" />
                <h2 className="font-display text-lg font-semibold">All done for today!</h2>
                <p className="text-sm text-muted mt-1">
                  Great work, {child.name}. Time to play, explore, or rest.
                </p>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
