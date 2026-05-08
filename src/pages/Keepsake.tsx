import { Link, useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { PortfolioGallery } from '@/components/keepsake/PortfolioGallery'
import { KeepsakePDFExport } from '@/components/keepsake/KeepsakePDFExport'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BookOpen } from 'lucide-react'

export function Keepsake() {
  const { childId } = useParams()
  const { child } = useChild(childId)

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-sage" />
                {child.name}'s Keepsake
              </h1>
              <p className="text-sm text-muted">A growing collection of learning memories.</p>
            </div>
          </div>
          <KeepsakePDFExport child={child} />
        </div>
      </header>

      <main className="px-6 py-4 max-w-4xl mx-auto">
        <PortfolioGallery childId={child.id} childName={child.name} />
      </main>
    </div>
  )
}
