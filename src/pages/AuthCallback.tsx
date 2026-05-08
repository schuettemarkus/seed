import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Sprout } from 'lucide-react'

/**
 * Handles OAuth and magic link callbacks.
 * Supabase redirects here with auth tokens in the URL hash or a PKCE code.
 * This page exchanges the code for a session, then redirects to the app.
 */
export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      // Check for PKCE code in query params
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Auth callback error:', error.message)
          navigate('/signin', { replace: true })
          return
        }
      }

      // Check if we have a session now (covers both code exchange and hash fragment flows)
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Check if this user already has a parent profile
        const { data: parent } = await supabase
          .from('parents')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (parent) {
          // Returning user — go to home
          navigate('/home', { replace: true })
        } else {
          // New user — go through onboarding flow
          navigate('/consent', { replace: true })
        }
      } else {
        // No session — something went wrong
        navigate('/signin', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Sprout className="h-10 w-10 text-sage mx-auto mb-4 animate-pulse" />
        <p className="text-muted font-display text-lg">Signing you in...</p>
      </div>
    </div>
  )
}
