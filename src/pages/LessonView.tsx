import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { useAccommodations } from '@/hooks/useAccommodations'
import { useChild } from '@/hooks/useChild'
import { useAuth } from '@/hooks/useAuth'
import { LessonPlayer } from '@/components/lesson/LessonPlayer'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import type { Lesson } from '@/types'

export function LessonView() {
  const { lessonId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lesson, setLesson] = useState<Lesson | null>(null)
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
        if (data && data.status === 'pending' && !DEMO_MODE) {
          supabase.from('lessons').update({ status: 'in_progress' }).eq('id', lessonId)
        }
      })
  }, [lessonId])

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
      </header>

      <main className="px-6 py-6 max-w-2xl mx-auto">
        <LessonPlayer
          lesson={lesson}
          parentId={user?.id ?? ''}
          onComplete={() => navigate(`/child/${lesson.child_id}/today`)}
        />
      </main>
    </div>
  )
}
