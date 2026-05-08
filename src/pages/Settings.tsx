import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Sprout } from 'lucide-react'

export function Settings() {
  const { parent, signOut } = useAuth()

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
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Email</span>
              <span className="text-sm">{parent?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Name</span>
              <span className="text-sm">{parent?.full_name ?? '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Plan</span>
              <span className="text-sm capitalize">{parent?.subscription_tier ?? 'free'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="secondary" className="w-full">
              Export all family data
            </Button>
            <Button variant="destructive" className="w-full">
              Delete account and all data
            </Button>
          </CardContent>
        </Card>

        <div className="pt-4">
          <Button variant="secondary" className="w-full" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </main>
    </div>
  )
}
