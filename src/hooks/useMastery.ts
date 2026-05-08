import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { MasteryState } from '@/types'

export function useMastery(childId: string | undefined) {
  const [mastery, setMastery] = useState<MasteryState[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!childId) return
    setLoading(true)
    supabase
      .from('mastery_state')
      .select('*')
      .eq('child_id', childId)
      .order('last_seen_at', { ascending: false })
      .then(({ data }) => {
        setMastery((data as MasteryState[]) ?? [])
        setLoading(false)
      })
  }, [childId])

  const getMasteryForConcept = (concept: string) =>
    mastery.find((m) => m.concept_node === concept)

  return { mastery, loading, getMasteryForConcept }
}
