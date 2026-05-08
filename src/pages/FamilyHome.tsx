import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useChildren } from '@/hooks/useChild'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Settings, LogOut, Sprout } from 'lucide-react'

export function FamilyHome() {
  const { user, parent, signOut } = useAuth()
  const { children, loading } = useChildren(user?.id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <Sprout className="h-7 w-7 text-sage" />
          <span className="font-display text-xl font-semibold">Seed</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings"><Settings className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-semibold mb-2">
          {parent?.full_name ? `Welcome back, ${parent.full_name.split(' ')[0]}` : 'Welcome back'}
        </h1>
        <p className="text-muted mb-8">Pick a child to start their learning for today.</p>

        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card
                key={child.id}
                className="p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <Link to={`/child/${child.id}/today`} className="block p-6">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center text-white font-display text-2xl font-semibold mb-4"
                    style={{ backgroundColor: child.avatar_color }}
                  >
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="font-display text-xl font-semibold">{child.name}</h2>
                  <p className="text-sm text-muted mt-1">
                    Age {child.age} · {child.subjects.length} subject{child.subjects.length !== 1 ? 's' : ''}
                  </p>
                </Link>
                <div className="border-t border-border px-6 py-3">
                  <Link
                    to={`/child/${child.id}/edit`}
                    className="text-xs text-sky hover:underline"
                  >
                    Edit profile
                  </Link>
                </div>
              </Card>
            ))}

            {/* Add child card */}
            <Card className="flex items-center justify-center min-h-[200px] border-dashed cursor-pointer hover:border-sage/50 transition-colors">
              <Link to="/child/new" className="flex flex-col items-center gap-3 p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-sage/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-sage" />
                </div>
                <span className="text-sm font-medium text-muted">Add a child</span>
              </Link>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
