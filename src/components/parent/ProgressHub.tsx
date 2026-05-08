import { Link } from 'react-router-dom'
import { MasteryMap } from './MasteryMap'
import { EngagementHeatmap } from './EngagementHeatmap'
import { WeeklyReport } from './WeeklyReport'
import { UsageMeter } from './UsageMeter'
import { ParentNotes } from './ParentNotes'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Lightbulb, BookOpen, Settings } from 'lucide-react'
import type { Child } from '@/types'

interface Props {
  child: Child
  parentId: string
}

export function ProgressHub({ child, parentId }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl font-semibold">{child.name}'s Progress</h1>
              <p className="text-sm text-muted">Age {child.age} · 30-second overview</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link to={`/child/${child.id}/edit`}><Settings className="h-5 w-5" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-4xl mx-auto space-y-6">
        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <Link to={`/child/${child.id}/today`} className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-sage" />
              <div>
                <div className="text-sm font-medium">Today's Path</div>
                <div className="text-xs text-muted">Start learning</div>
              </div>
            </Link>
          </Card>
          <Card className="p-4 hover:shadow-md transition-shadow">
            <Link to={`/child/${child.id}/wonder`} className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-terracotta" />
              <div>
                <div className="text-sm font-medium">Wonder Wall</div>
                <div className="text-xs text-muted">See their curiosities</div>
              </div>
            </Link>
          </Card>
        </div>

        {/* Weekly report with chart */}
        <WeeklyReport childId={child.id} childName={child.name} />

        {/* Engagement heatmap */}
        <EngagementHeatmap childId={child.id} />

        {/* Mastery map */}
        <MasteryMap childId={child.id} subjects={child.subjects} />

        {/* AI usage transparency */}
        <UsageMeter parentId={parentId} />

        {/* Parent notes */}
        <ParentNotes childId={child.id} childName={child.name} />
      </main>
    </div>
  )
}
