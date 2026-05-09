import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sprout, UserPlus, CheckCircle2 } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  co_parent: 'Co-Parent (full access)',
  grandparent: 'Grandparent (view + comment)',
  tutor: 'Tutor (view + comment)',
  viewer: 'Viewer (view only)',
}

export function InviteAccept() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = searchParams.get('token')
  const [invite, setInvite] = useState<{ email: string; role: string } | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'accepting' | 'accepted' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  // Fetch invite data when user is available (RLS requires auth for email match)
  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No invite token provided.')
      return
    }

    if (DEMO_MODE) {
      setInvite({ email: 'demo@example.com', role: 'co_parent' })
      setStatus('ready')
      return
    }

    // Without a user, we can't query (RLS will block). Show sign-in prompt.
    if (!user) {
      setStatus('ready')
      return
    }

    // Already fetched — don't re-fetch
    if (fetchedRef.current) return
    fetchedRef.current = true

    supabase
      .from('family_invites')
      .select('email, role, status')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setStatus('error')
          setError(
            'This invite link is invalid, has already been used, or was sent to a different email address. '
            + 'Make sure you are signed in with the email address the invite was sent to.'
          )
        } else {
          setInvite({ email: data.email, role: data.role })
          setStatus('ready')
        }
      })
  }, [token, user])

  async function handleAccept() {
    if (!token || !user) return
    setStatus('accepting')

    if (DEMO_MODE) {
      setStatus('accepted')
      setTimeout(() => navigate('/home', { replace: true }), 1500)
      return
    }

    // 1. Accept the invite
    const { error: acceptErr } = await supabase
      .from('family_invites')
      .update({
        status: 'accepted',
        invited_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('invite_token', token)

    if (acceptErr) {
      setError(acceptErr.message)
      setStatus('error')
      return
    }

    // 2. Ensure a parent record exists for this user (they may be new)
    const { data: existingParent } = await supabase
      .from('parents')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingParent) {
      await supabase.from('parents').insert({
        id: user.id,
        email: user.email ?? '',
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      })
    }

    setStatus('accepted')
    setTimeout(() => navigate('/home', { replace: true }), 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="h-8 w-8 text-sage" />
          <span className="font-display text-2xl font-semibold">Seed</span>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-sage" />
              <CardTitle>Family Invite</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'loading' && (
              <p className="text-sm text-muted">Loading invite...</p>
            )}

            {status === 'ready' && !user && (
              <>
                <p className="text-sm text-muted leading-relaxed">
                  You've been invited to join a family on Seed. Sign in or create an account to accept this invite.
                </p>
                <p className="text-xs text-muted">
                  Use the same email address the invite was sent to.
                </p>
                <div className="flex gap-3">
                  <Button className="flex-1" asChild>
                    <Link to={`/signin?redirect=/invite?token=${token}`}>Sign in</Link>
                  </Button>
                  <Button className="flex-1" variant="secondary" asChild>
                    <Link to={`/signup?redirect=/invite?token=${token}`}>Create account</Link>
                  </Button>
                </div>
              </>
            )}

            {status === 'ready' && user && invite && (
              <>
                <p className="text-sm text-muted leading-relaxed">
                  You've been invited to join a family on Seed as a{' '}
                  <strong className="text-foreground">{ROLE_LABELS[invite.role] ?? invite.role}</strong>.
                </p>
                <p className="text-xs text-muted">
                  Signed in as {user.email}
                </p>
                <Button className="w-full" onClick={handleAccept}>
                  Accept Invite
                </Button>
              </>
            )}

            {status === 'accepting' && (
              <div className="text-center py-4">
                <Sprout className="h-8 w-8 text-sage mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted">Accepting invite...</p>
              </div>
            )}

            {status === 'accepted' && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-sage mx-auto mb-3" />
                <p className="text-sm font-medium text-sage-dark">Invite accepted!</p>
                <p className="text-xs text-muted mt-1">Redirecting to your family home...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-terracotta">{error}</p>
                <Button variant="secondary" className="w-full" asChild>
                  <Link to="/">Go home</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
