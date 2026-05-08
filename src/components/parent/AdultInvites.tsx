import { useState, useEffect } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Trash2, Mail, CheckCircle2 } from 'lucide-react'
import type { FamilyInvite, InviteRole } from '@/types'

const ROLE_OPTIONS: { value: InviteRole; label: string; desc: string }[] = [
  { value: 'co_parent', label: 'Co-Parent', desc: 'Full edit access to all children' },
  { value: 'grandparent', label: 'Grandparent', desc: 'View progress + comment' },
  { value: 'tutor', label: 'Tutor', desc: 'View progress + comment' },
  { value: 'viewer', label: 'Viewer', desc: 'View-only access' },
]

interface Props {
  parentId: string
}

export function AdultInvites({ parentId }: Props) {
  const [invites, setInvites] = useState<FamilyInvite[]>([])
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('co_parent')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (DEMO_MODE) return
    supabase
      .from('family_invites')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvites((data as FamilyInvite[]) ?? [])
      })
  }, [parentId])

  async function sendInvite() {
    if (!email.trim()) return
    setSending(true)

    const token = crypto.randomUUID()

    if (!DEMO_MODE) {
      const { data, error } = await supabase
        .from('family_invites')
        .insert({
          parent_id: parentId,
          email: email.trim(),
          role,
          invite_token: token,
        })
        .select()
        .single()

      if (!error && data) {
        setInvites((prev) => [data as FamilyInvite, ...prev])
      }
    }

    setEmail('')
    setSending(false)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  async function revokeInvite(inviteId: string) {
    if (!DEMO_MODE) {
      await supabase
        .from('family_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId)
    }
    setInvites((prev) => prev.map((i) => (i.id === inviteId ? { ...i, status: 'revoked' as const } : i)))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-sage" />
          <CardTitle>Family Access</CardTitle>
        </div>
        <p className="text-xs text-muted">
          Invite co-parents, grandparents, or tutors to view your children's progress.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Send invite form */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as InviteRole)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <Button onClick={sendInvite} disabled={sending || !email.trim()}>
            {sending ? '...' : <Mail className="h-4 w-4" />}
          </Button>
        </div>

        {sent && (
          <div className="flex items-center gap-2 text-sm text-sage font-medium">
            <CheckCircle2 className="h-4 w-4" /> Invite sent!
          </div>
        )}

        {/* Existing invites */}
        {invites.length > 0 && (
          <div className="divide-y divide-border">
            {invites.map((invite) => (
              <div key={invite.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{invite.email}</p>
                  <p className="text-xs text-muted capitalize">
                    {invite.role.replace('_', ' ')} · {invite.status}
                  </p>
                </div>
                {invite.status === 'pending' && (
                  <button
                    onClick={() => revokeInvite(invite.id)}
                    className="text-muted hover:text-terracotta p-1 touch-target"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
