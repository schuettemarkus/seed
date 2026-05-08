import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Sprout } from 'lucide-react'

export function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    async function handleCallback() {
      try {
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

        // Wait briefly for auth state to settle
        await new Promise((r) => setTimeout(r, 500))

        const { data: { session } } = await supabase.auth.getSession()

        if (session) {
          const { data: parent } = await supabase
            .from('parents')
            .select('id')
            .eq('id', session.user.id)
            .maybeSingle()

          navigate(parent ? '/home' : '/consent', { replace: true })
        } else {
          navigate('/signin', { replace: true })
        }
      } catch (err) {
        console.error('Auth callback unexpected error:', err)
        navigate('/signin', { replace: true })
      }
    }

    // Safety timeout — never stay stuck
    timeout = setTimeout(() => {
      console.warn('Auth callback timed out, redirecting to signin')
      navigate('/signin', { replace: true })
    }, 10000)

    handleCallback().finally(() => clearTimeout(timeout))

    return () => clearTimeout(timeout)
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
