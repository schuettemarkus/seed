import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { DragDropSegment } from './DragDropSegment'
import { DrawCanvasSegment } from './DrawCanvasSegment'
import { VoiceAnswerSegment } from './VoiceAnswerSegment'
import { ClickExploreSegment } from './ClickExploreSegment'
import { SimulationSegment } from './SimulationSegment'
import { MovementBreak } from './MovementBreak'
import { FeedbackButton } from './FeedbackButton'
import { PrintLessonButton } from './PrintLessonButton'
import { AskWonderButton } from './AskWonderButton'
import { VoicePlayback } from './VoicePlayback'
import { ChevronRight, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react'
import type { Lesson, LessonSegment, Child } from '@/types'

interface Props {
  lesson: Lesson
  parentId: string
  child?: Child | null
  onComplete: () => void
}

// Each segment is broken into discrete "steps" so the user digests one piece at a time
interface Step {
  type: 'hook' | 'content' | 'activity' | 'interactive' | 'break' | 'questions' | 'complete'
  segmentIndex?: number
  title?: string
  body?: string
  instruction?: string
  segment?: LessonSegment
}

function InteractiveWidget({ segment, onDone }: { segment: LessonSegment; onDone: () => void }) {
  const data = segment.data ?? {}
  switch (segment.type) {
    case 'drag_drop':
      if (data.items && data.zones && data.correctMapping)
        return <DragDropSegment data={data as never} onComplete={onDone} />
      break
    case 'draw':
      return <DrawCanvasSegment prompt={segment.instructions} onSave={onDone} />
    case 'voice':
      return <VoiceAnswerSegment prompt={segment.instructions} onAnswer={onDone} />
    case 'click_explore':
      if (data.items)
        return <ClickExploreSegment items={data.items as never} instruction={segment.instructions} />
      break
    case 'simulation':
      if (data.params)
        return <SimulationSegment data={data as never} onComplete={onDone} />
      break
  }
  return null
}

export function LessonPlayer({ lesson, parentId, onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [autoRead, setAutoRead] = useState(false)
  const tts = useTextToSpeech()
  const prevStepRef = useRef(-1)

  const segments = lesson.segments ?? []

  // Build step list from segments
  const steps = useMemo<Step[]>(() => {
    const s: Step[] = []

    // Hook as first step
    if (lesson.hook) {
      s.push({ type: 'hook', body: lesson.hook })
    }

    const breakPoint = Math.floor(segments.length / 2)

    segments.forEach((seg, i) => {
      // Content step
      s.push({
        type: 'content',
        segmentIndex: i,
        title: seg.title,
        body: seg.content,
        segment: seg,
      })

      // Activity / instruction step (separate screen for prominence)
      if (seg.instructions) {
        s.push({
          type: seg.type !== 'text' && seg.type !== 'interactive' ? 'interactive' : 'activity',
          segmentIndex: i,
          instruction: seg.instructions,
          segment: seg,
        })
      }

      // Movement break after midpoint segment
      if (i === breakPoint - 1 && lesson.movement_break) {
        s.push({ type: 'break' })
      }
    })

    // Questions step
    if (lesson.questions && (lesson.questions as unknown[]).length > 0) {
      s.push({ type: 'questions' })
    }

    // Completion step
    s.push({ type: 'complete' })

    return s
  }, [lesson, segments])

  const currentStep = steps[stepIndex]
  const totalSteps = steps.length
  const progressPct = ((stepIndex + 1) / totalSteps) * 100

  // Get readable text for current step
  function getStepText(step: Step): string {
    const parts: string[] = []
    if (step.title) parts.push(step.title)
    if (step.body) parts.push(step.body)
    if (step.instruction) parts.push('Your turn. ' + step.instruction)
    return parts.join('. ')
  }

  // Read aloud the current step
  function readCurrentStep() {
    if (!currentStep) return
    const text = getStepText(currentStep)
    if (text) tts.speak(text)
    setAutoRead(true)
  }

  // Auto-read when step changes (if auto-read is enabled)
  useEffect(() => {
    if (!autoRead || prevStepRef.current === stepIndex) return
    prevStepRef.current = stepIndex
    if (currentStep) {
      const text = getStepText(currentStep)
      if (text) tts.speak(text)
    }
  }, [stepIndex, autoRead, currentStep])

  // Stop speech on unmount
  useEffect(() => {
    return () => tts.stop()
  }, [])

  const goNext = useCallback(() => {
    if (transitioning) return
    if (stepIndex >= totalSteps - 1) return

    setTransitioning(true)
    setTimeout(() => {
      setStepIndex((i) => i + 1)
      setTransitioning(false)
    }, 150)

    // Record progress when leaving a content step
    if (currentStep?.segmentIndex !== undefined && !DEMO_MODE) {
      supabase.from('lesson_progress').insert({
        lesson_id: lesson.id,
        child_id: lesson.child_id,
        segment_index: currentStep.segmentIndex,
        time_spent_seconds: 0,
      }).then(() => {})
    }
  }, [stepIndex, totalSteps, transitioning, currentStep, lesson])

  async function handleComplete() {
    if (!DEMO_MODE) {
      await supabase
        .from('lessons')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', lesson.id)

      // Update mastery state — advance concept from introduced -> practicing -> proficient
      const { data: existing } = await supabase
        .from('mastery_state')
        .select('level')
        .eq('child_id', lesson.child_id)
        .eq('concept_node', lesson.concept_node)
        .maybeSingle()

      const nextLevel: Record<string, string> = {
        introduced: 'practicing',
        practicing: 'proficient',
        proficient: 'mastered',
        mastered: 'mastered',
      }

      if (existing) {
        await supabase.from('mastery_state')
          .update({ level: nextLevel[existing.level] ?? 'practicing', last_seen_at: new Date().toISOString() })
          .eq('child_id', lesson.child_id)
          .eq('concept_node', lesson.concept_node)
      } else {
        await supabase.from('mastery_state').insert({
          child_id: lesson.child_id,
          subject: lesson.subject,
          concept_node: lesson.concept_node,
          level: 'introduced',
        })
      }
    }
    setCompleted(true)
  }

  // Spacebar / Enter to advance
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === ' ' || e.key === 'Enter') {
        // Don't advance if focused on an input/textarea/button
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'SELECT') return
        e.preventDefault()
        if (currentStep?.type === 'complete') {
          if (!completed) handleComplete()
          else onComplete()
        } else {
          goNext()
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, currentStep, completed, onComplete])

  if (!currentStep) return null

  // Movement break
  if (currentStep.type === 'break' && lesson.movement_break) {
    const bd = lesson.movement_break as { activity?: string; duration_minutes?: number }
    return (
      <MovementBreak
        activity={bd.activity ?? 'Take a stretch and some deep breaths.'}
        durationMinutes={bd.duration_minutes ?? 2}
        onComplete={goNext}
      />
    )
  }

  // Completed — done screen with feedback
  if (currentStep.type === 'complete') {
    if (!completed) handleComplete()
    return (
      <div className="space-y-6 py-4">
        <div className="text-center py-8 rounded-2xl bg-sage/[0.06] border border-sage/15">
          <CheckCircle2 className="h-14 w-14 text-sage mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-2">Lesson complete!</h2>
          <p className="text-muted">Great work on &ldquo;{lesson.title}&rdquo;</p>
        </div>
        <AskWonderButton childId={lesson.child_id} lessonId={lesson.id} />
        <FeedbackButton lessonId={lesson.id} childId={lesson.child_id} parentId={parentId} />
        <div className="flex items-center justify-between pt-2">
          <PrintLessonButton lesson={lesson} />
          <button
            onClick={onComplete}
            className="rounded-xl bg-sage px-6 py-3.5 text-sm font-semibold text-white hover:bg-sage-dark shadow-sm shadow-sage/20 transition-all duration-200 active:scale-[0.97] touch-target"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress bar + voice controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-sage transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <VoicePlayback
            speaking={tts.speaking}
            available={tts.available}
            voices={tts.voices}
            selectedVoiceURI={tts.selectedVoiceURI}
            onPlay={readCurrentStep}
            onStop={tts.stop}
            onSelectVoice={tts.selectVoice}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted">
          <span>Step {stepIndex + 1} of {totalSteps}</span>
          <span className="opacity-50">Press spacebar or tap Next</span>
        </div>
      </div>

      {/* Step content — with transition */}
      <div
        className={`transition-all duration-200 ease-out ${
          transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {/* HOOK step */}
        {currentStep.type === 'hook' && (
          <div className="rounded-2xl bg-sage/[0.06] backdrop-blur-sm border border-sage/15 p-8">
            <Sparkles className="h-6 w-6 text-sage mb-4" />
            <p className="lesson-text text-foreground leading-relaxed text-lg">{currentStep.body}</p>
          </div>
        )}

        {/* CONTENT step */}
        {currentStep.type === 'content' && (
          <div className="rounded-2xl border border-border bg-surface backdrop-blur-xl p-7 shadow-sm shadow-black/[0.03] space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-sage" />
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                {currentStep.segment?.type.replace(/_/g, ' ') ?? 'learn'}
              </span>
            </div>
            {currentStep.title && (
              <h3 className="font-display text-xl font-semibold leading-snug">{currentStep.title}</h3>
            )}
            <div className="lesson-text text-foreground/80 leading-relaxed">{currentStep.body}</div>
          </div>
        )}

        {/* ACTIVITY step — the big prominent callout */}
        {currentStep.type === 'activity' && (
          <div className="rounded-2xl bg-sage/[0.08] border-2 border-sage/25 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-sage rounded-full" />
            <div className="pl-4 space-y-3">
              <p className="text-xs font-bold text-sage uppercase tracking-widest">Your turn</p>
              <p className="text-lg font-semibold text-foreground leading-relaxed">
                {currentStep.instruction}
              </p>
              <p className="text-xs text-muted">Take your time — there's no rush.</p>
            </div>
          </div>
        )}

        {/* INTERACTIVE step — specialized widget */}
        {currentStep.type === 'interactive' && currentStep.segment && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-sage/[0.08] border-2 border-sage/25 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-sage rounded-full" />
              <div className="pl-4">
                <p className="text-xs font-bold text-sage uppercase tracking-widest mb-2">Your turn</p>
                <p className="text-base font-medium text-foreground leading-relaxed">
                  {currentStep.instruction}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-surface backdrop-blur-xl p-6">
              <InteractiveWidget segment={currentStep.segment} onDone={goNext} />
            </div>
          </div>
        )}

        {/* QUESTIONS step */}
        {currentStep.type === 'questions' && (
          <div className="rounded-2xl border border-border bg-surface backdrop-blur-xl p-6 space-y-4 shadow-sm shadow-black/[0.03]">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-sky" />
              <h3 className="font-display text-base font-semibold">Check your understanding</h3>
            </div>
            {(lesson.questions as { question: string; hint?: string }[]).map((q, i) => (
              <div key={i} className="rounded-xl bg-sky/[0.06] border border-sky/15 p-5">
                <p className="text-base font-medium leading-relaxed">{q.question}</p>
                {q.hint && <p className="text-sm text-muted mt-2 italic">Hint: {q.hint}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next button */}
      <button
        onClick={goNext}
        className="w-full rounded-xl bg-sage py-3.5 text-sm font-semibold text-white hover:bg-sage-dark shadow-sm shadow-sage/20 hover:shadow-md hover:shadow-sage/25 transition-all duration-200 active:scale-[0.97] touch-target flex items-center justify-center gap-2"
      >
        {stepIndex >= totalSteps - 2 ? (
          <><CheckCircle2 className="h-4 w-4" /> Complete lesson</>
        ) : (
          <>Next <ChevronRight className="h-4 w-4" /></>
        )}
      </button>
    </div>
  )
}
