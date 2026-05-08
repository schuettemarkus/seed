import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAccommodations } from '@/hooks/useAccommodations'
import { useChild } from '@/hooks/useChild'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, ChevronRight, CheckCircle2, Wind, HelpCircle } from 'lucide-react'
import type { Lesson, LessonSegment } from '@/types'

function SegmentRenderer({ segment }: { segment: LessonSegment }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wider">
          {segment.type.replace('_', ' ')}
        </span>
      </div>
      <h3 className="font-display text-lg font-semibold">{segment.title}</h3>
      <div className="lesson-text text-muted leading-relaxed">{segment.content}</div>
      {segment.instructions && (
        <div className="rounded-lg bg-sage/5 border border-sage/20 p-4">
          <p className="text-sm font-medium text-sage">{segment.instructions}</p>
        </div>
      )}
    </div>
  )
}

export function LessonView() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [currentSegment, setCurrentSegment] = useState(0)
  const [showBreak, setShowBreak] = useState(false)
  const [loading, setLoading] = useState(true)

  const { child } = useChild(lesson?.child_id)
  const { classes } = useAccommodations(child?.accommodations)

  useEffect(() => {
    if (!lessonId) return
    supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()
      .then(({ data }) => {
        setLesson(data as Lesson | null)
        setLoading(false)
        // Mark as in_progress
        if (data && data.status === 'pending') {
          supabase.from('lessons').update({ status: 'in_progress' }).eq('id', lessonId)
        }
      })
  }, [lessonId])

  async function handleComplete() {
    if (!lesson) return
    await supabase
      .from('lessons')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', lesson.id)
    navigate(`/child/${lesson.child_id}/today`)
  }

  function handleNext() {
    if (!lesson) return
    const segments = lesson.segments ?? []
    if (currentSegment < segments.length - 1) {
      // Show movement break midway through
      if (currentSegment === Math.floor(segments.length / 2) - 1 && lesson.movement_break) {
        setShowBreak(true)
      } else {
        setCurrentSegment(currentSegment + 1)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Loading lesson...</div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Lesson not found</div>
      </div>
    )
  }

  const segments = lesson.segments ?? []
  const isLastSegment = currentSegment >= segments.length - 1

  return (
    <div className={`min-h-screen bg-background ${classes}`}>
      {/* Header */}
      <header className="px-6 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/child/${lesson.child_id}/today`}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="text-center flex-1">
            <h1 className="font-display text-lg font-semibold truncate">{lesson.title}</h1>
          </div>
          <div className="w-11" />
        </div>

        {/* Segment progress */}
        <div className="flex gap-1 mt-4">
          {segments.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= currentSegment ? 'bg-sage' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="px-6 py-6 max-w-2xl mx-auto">
        {/* Hook */}
        {currentSegment === 0 && lesson.hook && (
          <div className="mb-6 rounded-xl bg-sage/5 border border-sage/20 p-5">
            <p className="lesson-text text-foreground italic">{lesson.hook}</p>
          </div>
        )}

        {/* Movement break overlay */}
        {showBreak && lesson.movement_break ? (
          <Card className="text-center py-10 mb-6">
            <Wind className="h-10 w-10 text-terracotta mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Movement Break</h2>
            <p className="lesson-text text-muted max-w-sm mx-auto mb-6">
              {(lesson.movement_break as { activity?: string }).activity ?? 'Take a stretch, wiggle your body, or take 5 deep breaths.'}
            </p>
            <Button onClick={() => { setShowBreak(false); setCurrentSegment(currentSegment + 1) }}>
              I'm ready to continue
            </Button>
          </Card>
        ) : segments[currentSegment] ? (
          <Card className="p-6">
            <SegmentRenderer segment={segments[currentSegment]} />
          </Card>
        ) : null}

        {/* Check-for-understanding questions at end */}
        {isLastSegment && !showBreak && lesson.questions && (lesson.questions as { question?: string }[]).length > 0 && (
          <Card className="mt-6 p-6">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="h-5 w-5 text-sky" />
              <h3 className="font-display text-base font-semibold">Check your understanding</h3>
            </div>
            <div className="space-y-4">
              {(lesson.questions as { question: string; hint?: string }[]).map((q, i) => (
                <div key={i} className="rounded-lg bg-background p-4">
                  <p className="text-sm font-medium">{q.question}</p>
                  {q.hint && <p className="text-xs text-muted mt-1">Hint: {q.hint}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {!showBreak && !isLastSegment && (
            <Button className="flex-1" onClick={handleNext}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {!showBreak && isLastSegment && (
            <Button className="flex-1" onClick={handleComplete}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete lesson
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
