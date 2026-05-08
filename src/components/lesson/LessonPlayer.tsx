import { useState } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { DragDropSegment } from './DragDropSegment'
import { DrawCanvasSegment } from './DrawCanvasSegment'
import { VoiceAnswerSegment } from './VoiceAnswerSegment'
import { ClickExploreSegment } from './ClickExploreSegment'
import { SimulationSegment } from './SimulationSegment'
import { MovementBreak } from './MovementBreak'
import { FeedbackButton } from './FeedbackButton'
import { PrintLessonButton } from './PrintLessonButton'
import { AskWonderButton } from './AskWonderButton'
import { ChevronRight, CheckCircle2, HelpCircle } from 'lucide-react'
import type { Lesson, LessonSegment, Child } from '@/types'

interface Props {
  lesson: Lesson
  parentId: string
  child?: Child | null
  onComplete: () => void
}

function InteractiveSegment({
  segment,
  onSegmentComplete,
}: {
  segment: LessonSegment
  onSegmentComplete: () => void
}) {
  const data = segment.data ?? {}

  switch (segment.type) {
    case 'drag_drop':
      if (data.items && data.zones && data.correctMapping) {
        return (
          <DragDropSegment
            data={data as { items: { id: string; label: string }[]; zones: { id: string; label: string }[]; correctMapping: Record<string, string> }}
            onComplete={() => onSegmentComplete()}
          />
        )
      }
      break
    case 'draw':
      return (
        <DrawCanvasSegment
          prompt={segment.instructions}
          onSave={() => onSegmentComplete()}
        />
      )
    case 'voice':
      return (
        <VoiceAnswerSegment
          prompt={segment.instructions}
          onAnswer={() => onSegmentComplete()}
        />
      )
    case 'click_explore':
      if (data.items) {
        return (
          <ClickExploreSegment
            items={data.items as { id: string; label: string; content: string; icon?: string }[]}
            instruction={segment.instructions}
          />
        )
      }
      break
    case 'simulation':
      if (data.params) {
        return (
          <SimulationSegment
            data={data as { title: string; description: string; params: { id: string; label: string; min: number; max: number; step: number; default: number; unit?: string }[]; compute: string }}
            onComplete={onSegmentComplete}
          />
        )
      }
      break
  }

  // Fallback: text/interactive segment — just show content
  return null
}

export function LessonPlayer({ lesson, parentId, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showBreak, setShowBreak] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [segmentStartTime] = useState(Date.now())

  const segments = lesson.segments ?? []
  const segment = segments[currentIndex]
  const isLast = currentIndex >= segments.length - 1
  const breakPoint = Math.floor(segments.length / 2)

  async function recordProgress(correct?: boolean) {
    if (DEMO_MODE) return
    const timeSpent = Math.round((Date.now() - segmentStartTime) / 1000)
    await supabase.from('lesson_progress').insert({
      lesson_id: lesson.id,
      child_id: lesson.child_id,
      segment_index: currentIndex,
      correct: correct ?? null,
      time_spent_seconds: timeSpent,
    })
  }

  function handleNext() {
    recordProgress()
    if (isLast) {
      handleComplete()
      return
    }
    // Show movement break at midpoint
    if (currentIndex === breakPoint - 1 && lesson.movement_break) {
      setShowBreak(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  async function handleComplete() {
    if (!DEMO_MODE) {
      await supabase
        .from('lessons')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', lesson.id)
    }
    setCompleted(true)
  }

  // Movement break overlay
  if (showBreak && lesson.movement_break) {
    const breakData = lesson.movement_break as { activity?: string; duration_minutes?: number }
    return (
      <MovementBreak
        activity={breakData.activity ?? 'Take a stretch, wiggle your body, or take 5 deep breaths.'}
        durationMinutes={breakData.duration_minutes ?? 2}
        onComplete={() => {
          setShowBreak(false)
          setCurrentIndex((i) => i + 1)
        }}
      />
    )
  }

  // Completed state
  if (completed) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center py-6">
          <CheckCircle2 className="h-12 w-12 text-sage mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">Lesson complete!</h2>
          <p className="text-muted">Great work on "{lesson.title}"</p>
        </div>

        {/* Check-for-understanding questions */}
        {lesson.questions && (lesson.questions as { question: string }[]).length > 0 && (
          <div className="rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-sky" />
              <h3 className="font-display text-base font-semibold">Check your understanding</h3>
            </div>
            {(lesson.questions as { question: string; hint?: string }[]).map((q, i) => (
              <div key={i} className="rounded-lg bg-background p-4">
                <p className="text-sm font-medium">{q.question}</p>
                {q.hint && <p className="text-xs text-muted mt-1">Hint: {q.hint}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Wonder button */}
        <AskWonderButton childId={lesson.child_id} lessonId={lesson.id} />

        {/* Feedback */}
        <FeedbackButton lessonId={lesson.id} childId={lesson.child_id} parentId={parentId} />

        {/* Print + Done */}
        <div className="flex items-center justify-between pt-2">
          <PrintLessonButton lesson={lesson} />
          <button
            onClick={onComplete}
            className="rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors touch-target"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  if (!segment) return null

  return (
    <div className="space-y-6">
      {/* Segment progress dots */}
      <div className="flex gap-1">
        {segments.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < currentIndex ? 'bg-sage' : i === currentIndex ? 'bg-sage/60' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Hook on first segment */}
      {currentIndex === 0 && lesson.hook && (
        <div className="rounded-xl bg-sage/5 border border-sage/20 p-5">
          <p className="lesson-text text-foreground italic">{lesson.hook}</p>
        </div>
      )}

      {/* Segment content */}
      <div className="rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">
            {segment.type.replace(/_/g, ' ')}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold">{segment.title}</h3>
        <div className="lesson-text text-muted leading-relaxed">{segment.content}</div>

        {/* Interactive element */}
        {segment.instructions && segment.type === 'text' ? (
          <div className="rounded-lg bg-sage/5 border border-sage/20 p-4">
            <p className="text-sm font-medium text-sage">{segment.instructions}</p>
          </div>
        ) : (
          <InteractiveSegment segment={segment} onSegmentComplete={handleNext} />
        )}
      </div>

      {/* Next button (for non-interactive segments) */}
      {(segment.type === 'text' || segment.type === 'interactive') && (
        <button
          onClick={handleNext}
          className="w-full rounded-lg bg-sage py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors touch-target flex items-center justify-center gap-2"
        >
          {isLast ? (
            <><CheckCircle2 className="h-4 w-4" /> Complete lesson</>
          ) : (
            <>Next <ChevronRight className="h-4 w-4" /></>
          )}
        </button>
      )}
    </div>
  )
}
