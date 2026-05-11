import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'
import { AdultInvites } from '@/components/parent/AdultInvites'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Sprout, Download, Trash2, AlertCircle, Sparkles, CreditCard, CheckCircle2, Loader2 } from 'lucide-react'

export function Settings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, parent, signOut } = useAuth()
  const { isPro, stripeCustomerId } = useSubscription()
  const [exporting, setExporting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const billingSuccess = searchParams.get('billing') === 'success'

  async function handleExport() {
    if (!user) return
    setExporting(true)
    try {
      const [parents, children, lessons, mastery] = await Promise.all([
        supabase.from('parents').select('*').eq('id', user.id),
        supabase.from('children').select('*').eq('parent_id', user.id),
        supabase.from('lessons').select('*').in('child_id',
          (await supabase.from('children').select('id').eq('parent_id', user.id)).data?.map((c: { id: string }) => c.id) ?? []
        ),
        supabase.from('mastery_state').select('*').in('child_id',
          (await supabase.from('children').select('id').eq('parent_id', user.id)).data?.map((c: { id: string }) => c.id) ?? []
        ),
      ])

      const exportData = {
        exported_at: new Date().toISOString(),
        parent: parents.data,
        children: children.data,
        lessons: lessons.data,
        mastery: mastery.data,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seed-family-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed:', e)
    }
    setExporting(false)
  }

  async function handleDelete() {
    if (!user) return
    setDeleting(true)
    try {
      await supabase.from('parents').delete().eq('id', user.id)
      await signOut()
      navigate('/', { replace: true })
    } catch (e) {
      console.error('Delete failed:', e)
      setDeleting(false)
    }
  }

  async function handleManageBilling() {
    if (!stripeCustomerId) return
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: stripeCustomerId,
          returnUrl: window.location.origin + '/settings',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (e) {
      console.error('Portal error:', e)
    }
    setPortalLoading(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4 max-w-3xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-sage" />
          <span className="font-display text-lg font-semibold">Settings</span>
        </div>
      </header>

      <main className="px-6 py-4 max-w-3xl mx-auto space-y-6">
        {/* Billing success banner */}
        {billingSuccess && (
          <div className="rounded-xl bg-sage/10 border border-sage/20 p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-sage flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-sage-dark">Welcome to Seed Pro!</p>
              <p className="text-xs text-muted">Your subscription is active. All pro features are now unlocked.</p>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Email</span>
              <span className="text-sm">{parent?.email ?? user?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Name</span>
              <span className="text-sm">{parent?.full_name ?? '\u2014'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Plan</span>
              <span className="text-sm">
                {isPro ? (
                  <span className="inline-flex items-center gap-1.5 text-sage font-medium">
                    <Sparkles className="h-3.5 w-3.5" /> Seed Pro
                  </span>
                ) : (
                  'Free'
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Billing card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-sage" />
              <CardTitle>Billing</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isPro && stripeCustomerId ? (
              <>
                <p className="text-sm text-muted">
                  You're on the <strong className="text-foreground">Seed Pro</strong> plan ($9.99/month).
                  Manage your subscription, update payment methods, or cancel anytime.
                </p>
                <Button variant="secondary" className="w-full" onClick={handleManageBilling} disabled={portalLoading}>
                  {portalLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Opening billing portal...</>
                  ) : (
                    <><CreditCard className="h-4 w-4 mr-2" /> Manage subscription</>
                  )}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  You're on the <strong className="text-foreground">Free</strong> plan. Upgrade to Pro to unlock
                  unlimited children, Wonder Wall, AI Companion, keepsake portfolio, and more.
                </p>
                <Button className="w-full" asChild>
                  <Link to="/pricing">
                    <Sparkles className="h-4 w-4 mr-2" /> Upgrade to Seed Pro
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <AdultInvites parentId={user?.id ?? ''} />

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full" onClick={handleExport} disabled={exporting}>
              <Download className="h-4 w-4 mr-2" />
              {exporting ? 'Exporting...' : 'Export all family data'}
            </Button>

            {!confirmDelete ? (
              <Button variant="destructive" className="w-full" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete account and all data
              </Button>
            ) : (
              <div className="rounded-lg border border-terracotta/30 bg-terracotta/5 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-terracotta flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">This will permanently delete your account</p>
                    <p className="text-xs text-muted mt-1">
                      All children, lessons, progress, and portfolio entries will be deleted. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Yes, delete everything'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button variant="secondary" className="w-full" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </main>
    </div>
  )
}
