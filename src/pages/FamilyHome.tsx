import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useChildren } from '@/hooks/useChild'
import { useInvitedFamilies } from '@/hooks/useInvitedFamilies'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Settings, LogOut, Sprout, CalendarDays, BarChart3, BookOpen, Lightbulb, Clock, CheckCircle2, Users } from 'lucide-react'
import type { Child } from '@/types'

const SUBJECT_COLORS: Record<string, string> = {
  math: '#87A878',
  language_arts: '#7A9CC6',
  science: '#C97C5D',
  social_studies: '#B8A9C9',
}

const SUBJECT_SHORT: Record<string, string> = {
  math: 'Math',
  language_arts: 'LA',
  science: 'Sci',
  social_studies: 'SS',
}

interface ChildStats {
  completedToday: number
  totalToday: number
  totalCompleted: number
  subjectLessons: Record<string, number>
}

function useChildStats(childId: string) {
  const [stats, setStats] = useState<ChildStats>({ completedToday: 0, totalToday: 0, totalCompleted: 0, subjectLessons: {} })

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([
      supabase.from('lessons').select('status').eq('child_id', childId).eq('scheduled_for', today),
      supabase.from('lessons').select('subject').eq('child_id', childId).eq('status', 'completed'),
    ]).then(([todayRes, allRes]) => {
      const todayLessons = todayRes.data ?? []
      const allCompleted = (allRes.data ?? []) as { subject: string }[]
      const subjectLessons: Record<string, number> = {}
      allCompleted.forEach((l) => { subjectLessons[l.subject] = (subjectLessons[l.subject] ?? 0) + 1 })
      setStats({
        completedToday: todayLessons.filter((l: { status: string }) => l.status === 'completed').length,
        totalToday: todayLessons.length,
        totalCompleted: allCompleted.length,
        subjectLessons,
      })
    })
  }, [childId])

  return stats
}

function ChildCard({ child, isInvited }: { child: Child; isInvited?: boolean }) {
  const stats = useChildStats(child.id)
  const todayPct = stats.totalToday > 0 ? (stats.completedToday / stats.totalToday) * 100 : 0
  const allDoneToday = stats.completedToday === stats.totalToday && stats.totalToday > 0

  return (
    <Card className="p-0 overflow-hidden hover:shadow-md transition-all duration-200">
      <Link to={`/child/${child.id}/today`} className="block p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center text-white font-display text-xl font-semibold shadow-sm"
            style={{ backgroundColor: child.avatar_color }}
          >
            {child.name.charAt(0).toUpperCase()}
          </div>
          {allDoneToday && (
            <div className="flex items-center gap-1 rounded-full bg-sage/10 px-2.5 py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-sage" />
              <span className="text-[11px] font-medium text-sage">Done today</span>
            </div>
          )}
        </div>

        <h2 className="font-display text-lg font-semibold">{child.name}</h2>
        <p className="text-xs text-muted mt-0.5">
          Age {child.age} · {stats.totalCompleted} lesson{stats.totalCompleted !== 1 ? 's' : ''} completed
        </p>

        {/* Today's progress bar */}
        {stats.totalToday > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted mb-1">
              <span>Today</span>
              <span>{stats.completedToday}/{stats.totalToday}</span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-sage transition-all duration-500" style={{ width: `${todayPct}%` }} />
            </div>
          </div>
        )}

        {/* Subject progress dots */}
        <div className="flex gap-2 mt-3">
          {child.subjects.map((sub) => {
            const count = stats.subjectLessons[sub] ?? 0
            return (
              <div key={sub} className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: SUBJECT_COLORS[sub] ?? '#87A878', opacity: count > 0 ? 1 : 0.3 }} />
                <span className="text-[10px] text-muted">{SUBJECT_SHORT[sub] ?? sub} {count > 0 ? count : ''}</span>
              </div>
            )
          })}
        </div>
      </Link>

      <div className="border-t border-border px-5 py-2.5 flex gap-3 bg-black/[0.01]">
        <Link to={`/child/${child.id}/dashboard`} className="text-[11px] text-sky hover:underline flex items-center gap-1">
          <BarChart3 className="h-3 w-3" /> Progress
        </Link>
        <Link to={`/child/${child.id}/wonder`} className="text-[11px] text-sky hover:underline flex items-center gap-1">
          <Lightbulb className="h-3 w-3" /> Wonders
        </Link>
        <Link to={`/child/${child.id}/keepsake`} className="text-[11px] text-sky hover:underline flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> Keepsake
        </Link>
        <Link to={`/child/${child.id}/history`} className="text-[11px] text-sky hover:underline flex items-center gap-1">
          <Clock className="h-3 w-3" /> History
        </Link>
        {!isInvited && (
          <Link to={`/child/${child.id}/edit`} className="text-[11px] text-muted hover:underline ml-auto">
            Edit
          </Link>
        )}
      </div>
    </Card>
  )
}

export function FamilyHome() {
  const navigate = useNavigate()
  const { user, parent, signOut } = useAuth()
  const { children, loading } = useChildren(user?.id)
  const { families: invitedFamilies, loading: invitedLoading } = useInvitedFamilies(user?.id)

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  const isLoading = loading || invitedLoading

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
        <Link to="/home" className="flex items-center gap-2">
          <Sprout className="h-7 w-7 text-sage" />
          <span className="font-display text-xl font-semibold">Seed</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/rhythm"><CalendarDays className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/settings"><Settings className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="px-6 py-8 max-w-4xl mx-auto">
        <h1 className="font-display text-3xl font-semibold mb-1">
          {parent?.full_name ? `Welcome back, ${parent.full_name.split(' ')[0]}` : 'Welcome back'}
        </h1>
        <p className="text-muted mb-8">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        {isLoading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <>
            {/* Own children */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <ChildCard key={child.id} child={child} />
              ))}

              <Card className="flex items-center justify-center min-h-[200px] border-dashed cursor-pointer hover:border-sage/50 transition-colors">
                <Link to="/child/new" className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-sage/10 flex items-center justify-center">
                    <Plus className="h-6 w-6 text-sage" />
                  </div>
                  <span className="text-sm font-medium text-muted">Add a child</span>
                </Link>
              </Card>
            </div>

            {/* Invited families */}
            {invitedFamilies.map((family, idx) => (
              <div key={idx} className="mt-10">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-sky" />
                  <h2 className="font-display text-lg font-semibold">
                    {family.inviterName
                      ? `${family.inviterName}'s Family`
                      : 'Shared Family'}
                  </h2>
                  <span className="text-xs text-muted capitalize rounded-full bg-sky/10 px-2.5 py-0.5">
                    {family.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {family.children.map((child) => (
                    <ChildCard key={child.id} child={child} isInvited />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  )
}
