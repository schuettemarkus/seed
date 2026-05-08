import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lesson } from '@/types'

export function useTodayPath(childId: string | undefined) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTodayLessons = useCallback(async () => {
    if (!childId) return
    setLoading(true)

    const today = new Date().toISOString().split('T')[0]

    const { data } = await supabase
      .from('lessons')
      .select('*')
      .eq('child_id', childId)
      .eq('scheduled_for', today)
      .order('created_at')

    setLessons((data as Lesson[]) ?? [])
    setLoading(false)
  }, [childId])

  useEffect(() => {
    fetchTodayLessons()
  }, [fetchTodayLessons])

  const completedCount = lessons.filter((l) => l.status === 'completed').length
  const totalCount = lessons.length
  const currentLesson = lessons.find((l) => l.status === 'pending' || l.status === 'in_progress')

  return {
    lessons,
    loading,
    completedCount,
    totalCount,
    currentLesson,
    refetch: fetchTodayLessons,
  }
}
