import { useState } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const DOWN_REASONS = ['Too hard', 'Too easy', 'Boring', 'Off-topic', 'Factual error', 'Tone issue', 'Other']
const UP_REASONS = ['Loved it', 'Perfect difficulty', 'Sparked curiosity', 'Other']

interface Props {
  lessonId: string
  childId: string
  parentId: string
}

export function FeedbackButton({ lessonId, childId, parentId }: Props) {
  const [rating, setRating] = useState<-1 | 1 | null>(null)
  const [, setReason] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function submit(selectedRating: -1 | 1, selectedReason: string) {
    setRating(selectedRating)
    setReason(selectedReason)
    setSubmitted(true)

    if (!DEMO_MODE) {
      await supabase.from('lesson_feedback').insert({
        lesson_id: lessonId,
        child_id: childId,
        parent_id: parentId,
        rating: selectedRating,
        reason: selectedReason,
      })
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg bg-sage/5 border border-sage/20 p-3 text-center">
        <p className="text-sm text-sage-dark font-medium">
          Thanks for the feedback{rating === 1 ? ' — glad they loved it!' : ' — we\'ll improve.'}
        </p>
      </div>
    )
  }

  if (rating !== null) {
    const reasons = rating === 1 ? UP_REASONS : DOWN_REASONS
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-center">What stood out?</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {reasons.map((r) => (
            <button
              key={r}
              onClick={() => submit(rating, r)}
              className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-sage/50 transition-colors touch-target"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <span className="text-sm text-muted">How was this lesson?</span>
      <button
        onClick={() => setRating(1)}
        className={cn(
          'h-11 w-11 rounded-full border flex items-center justify-center transition-colors touch-target',
          'border-border hover:border-sage hover:bg-sage/5',
        )}
      >
        <ThumbsUp className="h-5 w-5 text-sage" />
      </button>
      <button
        onClick={() => setRating(-1)}
        className={cn(
          'h-11 w-11 rounded-full border flex items-center justify-center transition-colors touch-target',
          'border-border hover:border-terracotta hover:bg-terracotta/5',
        )}
      >
        <ThumbsDown className="h-5 w-5 text-terracotta" />
      </button>
    </div>
  )
}
