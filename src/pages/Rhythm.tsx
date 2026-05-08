import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { RhythmPlanner } from '@/components/rhythm/RhythmPlanner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CalendarDays } from 'lucide-react'

export function Rhythm() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-sage" />
              Family Rhythm
            </h1>
            <p className="text-sm text-muted">Plan your weekly learning rhythm.</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-3xl mx-auto">
        <RhythmPlanner parentId={user?.id ?? ''} />
      </main>
    </div>
  )
}
