import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sprout, UserPlus, CheckCircle2 } from 'lucide-react'

export function InviteAccept() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const token = searchParams.get('token')
  const [invite, setInvite] = useState<{ email: string; role: string } | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'accepted' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

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

    supabase
      .from('family_invites')
      .select('*')
      .eq('invite_token', token)
      .eq('status', 'pending')
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setStatus('error')
          setError('This invite link is invalid or has already been used.')
        } else {
          setInvite({ email: data.email, role: data.role })
          setStatus('ready')
        }
      })
  }, [token])

  async function handleAccept() {
    if (!token || !user || DEMO_MODE) {
      setStatus('accepted')
      return
    }

    const { error: err } = await supabase
      .from('family_invites')
      .update({
        status: 'accepted',
        invited_user_id: user.id,
        accepted_at: new Date().toISOString(),
      })
      .eq('invite_token', token)

    if (err) {
      setError(err.message)
      setStatus('error')
    } else {
      setStatus('accepted')
      setTimeout(() => navigate('/home'), 2000)
    }
  }

  const ROLE_LABELS: Record<string, string> = {
    co_parent: 'Co-Parent (full access)',
    grandparent: 'Grandparent (view + comment)',
    tutor: 'Tutor (view + comment)',
    viewer: 'Viewer (view only)',
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

            {status === 'ready' && invite && (
              <>
                <p className="text-sm text-muted leading-relaxed">
                  You've been invited to join a family on Seed as a{' '}
                  <strong>{ROLE_LABELS[invite.role] ?? invite.role}</strong>.
                </p>
                {!user && (
                  <p className="text-sm text-terracotta">
                    Please sign in or create an account first, then return to this link.
                  </p>
                )}
                <Button className="w-full" onClick={handleAccept} disabled={!user}>
                  Accept Invite
                </Button>
              </>
            )}

            {status === 'accepted' && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-sage mx-auto mb-3" />
                <p className="text-sm font-medium text-sage-dark">Invite accepted!</p>
                <p className="text-xs text-muted mt-1">Redirecting to your family home...</p>
              </div>
            )}

            {status === 'error' && (
              <p className="text-sm text-terracotta">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
