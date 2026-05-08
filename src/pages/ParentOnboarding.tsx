import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { CONTENT_AXIS_LABELS } from '@/lib/content-axis'
import type { ContentAxis } from '@/types'

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
]

export function ParentOnboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('America/Denver')
  const [contentAxis, setContentAxis] = useState<ContentAxis>('faith_neutral')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.from('parents').upsert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      timezone,
      default_content_axis: contentAxis,
    })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigate('/child/new')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Seed</CardTitle>
            <CardDescription>Tell us a little about yourself, then we'll set up your first child.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Your name</label>
                <Input
                  id="name"
                  placeholder="First name or full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-11 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz.replace('_', ' ').replace('America/', '').replace('Pacific/', '')}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Default content approach</label>
                <p className="text-xs text-muted">This can be changed per child later.</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(Object.entries(CONTENT_AXIS_LABELS) as [ContentAxis, string][]).map(([value, label]) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setContentAxis(value)}
                      className={`rounded-lg border px-3 py-2 text-sm text-left transition-colors ${
                        contentAxis === value
                          ? 'border-sage bg-sage/10 text-foreground'
                          : 'border-border bg-surface text-muted hover:border-sage/50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-terracotta">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving...' : 'Continue to add your child'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
