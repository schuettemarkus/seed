import { useState } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { Lightbulb, Send, Check } from 'lucide-react'

interface Props {
  childId: string
  lessonId: string
}

export function AskWonderButton({ childId, lessonId }: Props) {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    const text = question.trim()
    if (!text) return

    if (!DEMO_MODE) {
      await supabase.from('wonder_questions').insert({
        child_id: childId,
        parent_lesson_id: lessonId,
        question_text: text,
      })
    }

    setSubmitted(true)
    setQuestion('')
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-sage/10 px-4 py-3 text-sm text-sage-dark font-medium">
        <Check className="h-4 w-4" />
        Wonder captured! You'll get a bonus lesson about this tomorrow.
      </div>
    )
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-foreground hover:border-sage/50 transition-colors touch-target"
      >
        <Lightbulb className="h-4 w-4 text-terracotta" />
        I wonder...
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-terracotta" />
        <span className="text-sm font-medium">What are you wondering?</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="I wonder why..."
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/50"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          onClick={handleSubmit}
          disabled={!question.trim()}
          className="h-9 w-9 rounded-lg bg-terracotta flex items-center justify-center text-white disabled:opacity-50 touch-target"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted hover:text-foreground"
      >
        Never mind
      </button>
    </div>
  )
}
