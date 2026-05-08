import { useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Parent } from '@/types'

interface AuthState {
  user: User | null
  session: Session | null
  parent: Parent | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    parent: null,
    loading: true,
  })

  const fetchParent = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('parents')
      .select('*')
      .eq('id', userId)
      .single()
    return data as Parent | null
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let parent: Parent | null = null
      if (session?.user) {
        parent = await fetchParent(session.user.id)
      }
      setState({ user: session?.user ?? null, session, parent, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        let parent: Parent | null = null
        if (session?.user) {
          parent = await fetchParent(session.user.id)
        }
        setState({ user: session?.user ?? null, session, parent, loading: false })
      },
    )

    return () => subscription.unsubscribe()
  }, [fetchParent])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding` },
    })
    return { data, error }
  }

  const signInWithMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ user: null, session: null, parent: null, loading: false })
  }

  return {
    ...state,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithMagicLink,
    signOut,
  }
}
