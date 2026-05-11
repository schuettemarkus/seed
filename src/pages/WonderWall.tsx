import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { supabase } from '@/lib/supabase'
import { ProGate } from '@/components/ProGate'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Lightbulb, Sparkles, MessageCircle } from 'lucide-react'
import type { WonderQuestion } from '@/types'

export function WonderWall() {
  const { childId } = useParams()
  const { child } = useChild(childId)
  const [questions, setQuestions] = useState<WonderQuestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    supabase
      .from('wonder_questions')
      .select('*')
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setQuestions((data as WonderQuestion[]) ?? [])
        setLoading(false)
      })
  }, [childId])

  const pending = questions.filter((q) => q.status === 'pending')
  const answered = questions.filter((q) => q.status === 'answered')

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-terracotta" />
              {child?.name}'s Wonder Wall
            </h1>
            <p className="text-sm text-muted">Every question is a seed of curiosity.</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-3xl mx-auto space-y-8">
        <ProGate feature="Wonder Wall">
        {loading ? (
          <div className="text-muted text-center py-12">Loading wonders...</div>
        ) : questions.length === 0 ? (
          <Card className="text-center py-12">
            <Sparkles className="h-10 w-10 text-terracotta mx-auto mb-4" />
            <h2 className="font-display text-lg font-semibold mb-2">No wonders yet</h2>
            <p className="text-sm text-muted max-w-sm mx-auto">
              During lessons, {child?.name} can tap "I wonder..." to capture any question
              that sparks their curiosity. Those questions appear here — and become bonus
              lessons the next morning.
            </p>
          </Card>
        ) : (
          <>
            {/* Pending wonders */}
            {pending.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-terracotta" />
                  Fresh Wonders
                </h2>
                <p className="text-xs text-muted mb-4">
                  These will become bonus mini-lessons tomorrow morning.
                </p>
                <div className="space-y-3">
                  {pending.map((q) => (
                    <Card key={q.id} className="p-4 border-terracotta/20 bg-terracotta/5">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-terracotta flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{q.question_text}</p>
                          <p className="text-xs text-muted mt-1">
                            {new Date(q.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Answered wonders */}
            {answered.length > 0 && (
              <section>
                <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-sage" />
                  Explored Wonders
                </h2>
                <div className="space-y-3">
                  {answered.map((q) => (
                    <Card key={q.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-sage flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{q.question_text}</p>
                          <p className="text-xs text-muted mt-1">
                            {new Date(q.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric',
                            })}
                          </p>
                          {q.bonus_lesson_id && (
                            <Link
                              to={`/lesson/${q.bonus_lesson_id}`}
                              className="text-xs text-sky hover:underline mt-1 inline-block"
                            >
                              View bonus lesson
                            </Link>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
        </ProGate>
      </main>
    </div>
  )
}
