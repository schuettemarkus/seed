import { useEffect, useState } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import type { Child, InviteRole } from '@/types'

export interface InvitedFamily {
  inviterName: string | null
  role: InviteRole
  children: Child[]
}

export function useInvitedFamilies(userId: string | undefined) {
  const [families, setFamilies] = useState<InvitedFamily[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId || DEMO_MODE) {
      setLoading(false)
      return
    }

    async function fetchInvitedFamilies() {
      // Get all accepted invites for this user
      const { data: invites } = await supabase
        .from('family_invites')
        .select('parent_id, role')
        .eq('invited_user_id', userId)
        .eq('status', 'accepted')

      if (!invites || invites.length === 0) {
        setFamilies([])
        setLoading(false)
        return
      }

      // For each invite, fetch the parent's name and their children
      const result: InvitedFamily[] = []

      for (const invite of invites) {
        const [parentRes, childrenRes] = await Promise.all([
          supabase
            .from('parents')
            .select('full_name')
            .eq('id', invite.parent_id)
            .maybeSingle(),
          supabase
            .from('children')
            .select('*')
            .eq('parent_id', invite.parent_id)
            .order('created_at'),
        ])

        result.push({
          inviterName: parentRes.data?.full_name ?? null,
          role: invite.role as InviteRole,
          children: (childrenRes.data as Child[]) ?? [],
        })
      }

      setFamilies(result)
      setLoading(false)
    }

    fetchInvitedFamilies()
  }, [userId])

  return { families, loading }
}
