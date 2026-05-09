import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Sprout } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    async function resolveSession() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      // Try exchanging the PKCE code if present
      if (code) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) console.warn('Code exchange error:', error.message)
        } catch (e) {
          console.warn('Code exchange exception:', e)
        }
      }

      // Poll for session — the exchange or onAuthStateChange may resolve it
      for (let i = 0; i < 20; i++) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) return session
        await new Promise((r) => setTimeout(r, 500))
      }

      return null
    }

    resolveSession().then(async (session) => {
      if (!session) {
        console.warn('Auth callback: no session after waiting')
        navigate('/signin', { replace: true })
        return
      }

      // Check if parent profile exists → route new vs returning users
      const { data: parent } = await supabase
        .from('parents')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      navigate(parent ? '/home' : '/consent', { replace: true })
    }).catch((err) => {
      console.error('Auth callback error:', err)
      navigate('/signin', { replace: true })
    })
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
