import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Child } from '@/types'

export function useChildren(parentId: string | undefined) {
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChildren = useCallback(async () => {
    if (!parentId) return
    setLoading(true)
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at')
    setChildren((data as Child[]) ?? [])
    setLoading(false)
  }, [parentId])

  useEffect(() => {
    fetchChildren()
  }, [fetchChildren])

  return { children, loading, refetch: fetchChildren }
}

export function useChild(childId: string | undefined) {
  const [child, setChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    supabase
      .from('children')
      .select('*')
      .eq('id', childId)
      .single()
      .then(({ data }) => {
        setChild(data as Child | null)
        setLoading(false)
      })
  }, [childId])

  return { child, loading }
}
