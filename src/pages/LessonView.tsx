import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { useAccommodations } from '@/hooks/useAccommodations'
import { useChild } from '@/hooks/useChild'
import { useAuth } from '@/hooks/useAuth'
import { LessonPlayer } from '@/components/lesson/LessonPlayer'
import { AICompanion } from '@/components/lesson/AICompanion'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import type { Lesson } from '@/types'

export function LessonView() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { child } = useChild(lesson?.child_id)
  const { classes } = useAccommodations(child?.accommodations)

  useEffect(() => {
    if (!lessonId) {
      setLoading(false)
      setError('No lesson ID provided')
      return
    }

    const timeout = setTimeout(() => {
      setLoading(false)
      setError('Lesson is taking too long to load. Please go back and try again.')
    }, 10000)

    async function fetchLesson() {
      try {
        const { data, error: err } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .maybeSingle()

        clearTimeout(timeout)
        if (err) {
          console.error('Lesson fetch error:', err)
          setError(err.message)
          setLoading(false)
          return
        }
        if (!data) {
          setError('Lesson not found')
          setLoading(false)
          return
        }
        setLesson(data as Lesson)
        setLoading(false)
        if (data.status === 'pending' && !DEMO_MODE) {
          supabase.from('lessons').update({ status: 'in_progress' }).eq('id', lessonId)
        }
      } catch (e) {
        clearTimeout(timeout)
        console.error('Lesson fetch exception:', e)
        setError(e instanceof Error ? e.message : 'Failed to load lesson')
        setLoading(false)
      }
    }
    fetchLesson()

    return () => clearTimeout(timeout)
  }, [lessonId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted font-display text-lg">Loading lesson...</div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-10 w-10 text-terracotta mx-auto mb-4" />
          <h2 className="font-display text-lg font-semibold mb-2">Couldn't load lesson</h2>
          <p className="text-sm text-muted mb-4">{error ?? 'Lesson not found'}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${classes}`}>
      <header className="px-6 py-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <Link
            to={`/child/${lesson.child_id}/today`}
            className="h-11 w-11 rounded-xl flex items-center justify-center hover:bg-black/[0.04] transition-colors touch-target"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="text-center flex-1">
            <h1 className="font-display text-lg font-semibold truncate">{lesson.title}</h1>
          </div>
          <div className="w-11" />
        </div>
      </header>

      <main className="px-6 py-6 max-w-2xl mx-auto">
        <LessonPlayer
          lesson={lesson}
          parentId={user?.id ?? ''}
          child={child}
          onComplete={() => navigate(`/child/${lesson.child_id}/today`)}
        />
      </main>

      {child && (
        <AICompanion
          child={child}
          lessonContext={`Subject: ${lesson.subject}, Topic: ${lesson.concept_node}, Title: ${lesson.title}`}
        />
      )}
    </div>
  )
}
