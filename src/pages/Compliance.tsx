import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, FileText, Printer } from 'lucide-react'
import { escapeHtml } from '@/lib/sanitize'
import type { Lesson, Subject } from '@/types'

const STATES = [
  { code: 'TX', name: 'Texas', requirement: 'Written curriculum in reading, spelling, grammar, math, and good citizenship' },
  { code: 'FL', name: 'Florida', requirement: 'Annual evaluation or portfolio review by certified teacher' },
  { code: 'NC', name: 'North Carolina', requirement: 'Attendance records and annual nationally standardized test' },
  { code: 'GA', name: 'Georgia', requirement: 'Annual progress assessment, attendance records, monthly report' },
  { code: 'VA', name: 'Virginia', requirement: 'Evidence of academic progress annually (test scores or evaluation)' },
  { code: 'CA', name: 'California', requirement: 'Private school affidavit filed, instruction in required branches' },
  { code: 'MI', name: 'Michigan', requirement: 'No reporting required for home education (notification optional)' },
  { code: 'PA', name: 'Pennsylvania', requirement: 'Portfolio review + evaluator, standardized tests at grades 3/5/8' },
  { code: 'TN', name: 'Tennessee', requirement: 'Attendance records 4hrs/day 180 days, standardized tests grades 5/7/9' },
  { code: 'OH', name: 'Ohio', requirement: 'Annual notification, 900 hours instruction, annual assessment' },
  { code: 'UT', name: 'Utah', requirement: 'Annual affidavit filed with school district, instruction in required subjects' },
]

const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Mathematics',
  language_arts: 'Language Arts',
  science: 'Science',
  social_studies: 'Social Studies',
}

export function Compliance() {
  const { childId } = useParams()
  const { child } = useChild(childId)
  const [state, setState] = useState('TX')
  const [lessons, setLessons] = useState<Lesson[]>([])

  useEffect(() => {
    if (!childId) return

    supabase
      .from('lessons')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        setLessons((data as Lesson[]) ?? [])
      })
  }, [childId])

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  const stateInfo = STATES.find((s) => s.code === state)
  const totalHours = lessons.reduce((sum, l) => sum + (l.estimated_minutes ?? 0), 0) / 60
  const uniqueDays = new Set(lessons.map((l) => l.completed_at?.split('T')[0]).filter(Boolean)).size
  const subjectsCovered = [...new Set(lessons.map((l) => l.subject))]

  function printReport() {
    if (!child) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Compliance Report — ${escapeHtml(child.name)} — ${escapeHtml(stateInfo?.name ?? state)}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
          body { font-family: 'Inter', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 24px; color: #1A1A1A; font-size: 14px; line-height: 1.6; }
          h1 { font-size: 24px; margin-bottom: 4px; }
          h2 { font-size: 16px; margin-top: 32px; padding-bottom: 8px; border-bottom: 1px solid #E8E6DF; }
          .meta { color: #6B6B66; margin-bottom: 32px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #E8E6DF; }
          th { font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #6B6B66; }
          .stat { display: inline-block; margin-right: 32px; }
          .stat-value { font-size: 24px; font-weight: 600; }
          .stat-label { font-size: 11px; color: #6B6B66; text-transform: uppercase; }
          .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #E8E6DF; font-size: 11px; color: #6B6B66; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>Homeschool Compliance Report</h1>
        <p class="meta">${escapeHtml(child.name)}, Age ${child.age} · ${escapeHtml(stateInfo?.name ?? state)} · Generated ${new Date().toLocaleDateString()}</p>

        <h2>State Requirement: ${stateInfo?.name ?? state}</h2>
        <p>${stateInfo?.requirement ?? 'See your state homeschool laws for specific requirements.'}</p>

        <h2>Summary Statistics</h2>
        <div>
          <div class="stat"><div class="stat-value">${totalHours.toFixed(1)}</div><div class="stat-label">Total Hours</div></div>
          <div class="stat"><div class="stat-value">${uniqueDays}</div><div class="stat-label">Days Attended</div></div>
          <div class="stat"><div class="stat-value">${lessons.length}</div><div class="stat-label">Lessons Completed</div></div>
          <div class="stat"><div class="stat-value">${subjectsCovered.length}</div><div class="stat-label">Subjects</div></div>
        </div>

        <h2>Subjects Covered</h2>
        <table>
          <thead><tr><th>Subject</th><th>Lessons</th><th>Hours</th></tr></thead>
          <tbody>
            ${subjectsCovered.map((sub) => {
              const subLessons = lessons.filter((l) => l.subject === sub)
              const hrs = subLessons.reduce((s, l) => s + (l.estimated_minutes ?? 0), 0) / 60
              return `<tr><td>${SUBJECT_LABELS[sub as Subject] ?? sub}</td><td>${subLessons.length}</td><td>${hrs.toFixed(1)}</td></tr>`
            }).join('')}
          </tbody>
        </table>

        <h2>Recent Attendance Log</h2>
        <table>
          <thead><tr><th>Date</th><th>Subjects</th><th>Hours</th></tr></thead>
          <tbody>
            ${[...new Set(lessons.map((l) => l.completed_at?.split('T')[0]).filter(Boolean))].slice(0, 30).map((date) => {
              const dayLessons = lessons.filter((l) => l.completed_at?.startsWith(date!))
              const hrs = dayLessons.reduce((s, l) => s + (l.estimated_minutes ?? 0), 0) / 60
              const subs = [...new Set(dayLessons.map((l) => SUBJECT_LABELS[l.subject as Subject] ?? l.subject))]
              return `<tr><td>${date}</td><td>${subs.join(', ')}</td><td>${hrs.toFixed(1)}</td></tr>`
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Generated by Seed Homeschool Platform · seedlearning.com</p>
          <p>This report is auto-generated from lesson completion data. Verify against your state's specific requirements.</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 py-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/home"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6 text-sage" />
              Compliance Report
            </h1>
            <p className="text-sm text-muted">{child.name} · Auto-tracked from lessons</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-4 max-w-3xl mx-auto space-y-6">
        {/* State selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATES.map((s) => (
                <button
                  key={s.code}
                  onClick={() => setState(s.code)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    state === s.code
                      ? 'border-sage bg-sage/10 text-foreground font-medium'
                      : 'border-border text-muted hover:border-sage/50'
                  }`}
                >
                  {s.code}
                </button>
              ))}
            </div>
            {stateInfo && (
              <p className="text-xs text-muted mt-3">
                <strong>{stateInfo.name}:</strong> {stateInfo.requirement}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-display font-semibold">{totalHours.toFixed(1)}</div>
            <div className="text-xs text-muted">Total Hours</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-display font-semibold">{uniqueDays}</div>
            <div className="text-xs text-muted">Days Attended</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-display font-semibold">{lessons.length}</div>
            <div className="text-xs text-muted">Lessons</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-display font-semibold">{subjectsCovered.length}</div>
            <div className="text-xs text-muted">Subjects</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={printReport}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </main>
    </div>
  )
}
