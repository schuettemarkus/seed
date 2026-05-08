import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { BarChart3 } from 'lucide-react'
import type { Subject } from '@/types'

const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Math',
  language_arts: 'Lang Arts',
  science: 'Science',
  social_studies: 'Soc Studies',
}

const SUBJECT_COLORS: Record<Subject, string> = {
  math: '#87A878',
  language_arts: '#7A9CC6',
  science: '#C97C5D',
  social_studies: '#B8A9C9',
}

interface Props {
  childId: string
  childName: string
}

interface WeekData {
  subject: string
  lessons: number
  minutes: number
  fill: string
}

export function WeeklyReport({ childId, childName }: Props) {
  const [weekData, setWeekData] = useState<WeekData[]>([])
  const [summary, setSummary] = useState('')

  useEffect(() => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    supabase
      .from('lessons')
      .select('*')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .gte('completed_at', weekAgo.toISOString())
      .then(({ data: lessons }) => {
        const bySubject: Record<string, { lessons: number; minutes: number }> = {}
        for (const l of (lessons ?? [])) {
          const sub = l.subject as Subject
          if (!bySubject[sub]) bySubject[sub] = { lessons: 0, minutes: 0 }
          bySubject[sub].lessons++
          bySubject[sub].minutes += l.estimated_minutes ?? 0
        }

        const chartData: WeekData[] = Object.entries(bySubject).map(([sub, stats]) => ({
          subject: SUBJECT_LABELS[sub as Subject] ?? sub,
          lessons: stats.lessons,
          minutes: stats.minutes,
          fill: SUBJECT_COLORS[sub as Subject] ?? '#87A878',
        }))

        setWeekData(chartData)

        // Generate plain-English summary
        const totalLessons = (lessons ?? []).length
        const totalMinutes = (lessons ?? []).reduce((sum, l) => sum + (l.estimated_minutes ?? 0), 0)
        if (totalLessons === 0) {
          setSummary(`${childName} didn't complete any lessons this week. That's okay — every week is a fresh start.`)
        } else {
          const topSubject = chartData.sort((a, b) => b.lessons - a.lessons)[0]
          setSummary(
            `${childName} completed ${totalLessons} lesson${totalLessons !== 1 ? 's' : ''} this week (about ${totalMinutes} minutes of learning). ` +
            `${topSubject ? `${topSubject.subject} was the most active subject. ` : ''}` +
            `Keep it up!`,
          )
        }
      })
  }, [childId, childName])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-sky" />
          <CardTitle>This Week</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plain-English summary */}
        <p className="text-sm text-muted leading-relaxed">{summary}</p>

        {/* Chart */}
        {weekData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6B6B66' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B6B66' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E8E6DF',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="lessons" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
