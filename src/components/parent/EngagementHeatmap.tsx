import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Flame } from 'lucide-react'

interface DayData {
  date: string
  count: number
}

interface Props {
  childId: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getIntensityColor(count: number): string {
  if (count === 0) return '#F0EEE9'
  if (count === 1) return '#a8c49d'
  if (count === 2) return '#87A878'
  if (count <= 4) return '#6b8c5e'
  return '#4a6b3f'
}

export function EngagementHeatmap({ childId }: Props) {
  const [data, setData] = useState<DayData[]>([])

  useEffect(() => {
    // Fetch completed lessons for the last 12 weeks
    const weeksAgo = new Date()
    weeksAgo.setDate(weeksAgo.getDate() - 84)

    supabase
      .from('lessons')
      .select('completed_at')
      .eq('child_id', childId)
      .eq('status', 'completed')
      .gte('completed_at', weeksAgo.toISOString())
      .then(({ data: lessons }) => {
        // Group by date
        const counts: Record<string, number> = {}
        for (const l of (lessons ?? [])) {
          if (!l.completed_at) continue
          const date = new Date(l.completed_at).toISOString().split('T')[0]
          counts[date] = (counts[date] ?? 0) + 1
        }

        // Build 84-day grid
        const days: DayData[] = []
        for (let i = 83; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          const dateStr = d.toISOString().split('T')[0]
          days.push({ date: dateStr, count: counts[dateStr] ?? 0 })
        }
        setData(days)
      })
  }, [childId])

  // Organize into weeks (columns) x days (rows)
  const weeks: DayData[][] = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-terracotta" />
          <CardTitle>Learning Activity</CardTitle>
        </div>
        <p className="text-xs text-muted">Last 12 weeks</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-1">
            {DAYS.map((d, i) => (
              <div key={d} className="h-3 flex items-center">
                {i % 2 === 1 && <span className="text-[9px] text-muted leading-none">{d}</span>}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day) => (
                <div
                  key={day.date}
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: getIntensityColor(day.count) }}
                  title={`${day.date}: ${day.count} lesson${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1 mt-3 justify-end">
          <span className="text-[9px] text-muted mr-1">Less</span>
          {[0, 1, 2, 3, 5].map((n) => (
            <div
              key={n}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(n) }}
            />
          ))}
          <span className="text-[9px] text-muted ml-1">More</span>
        </div>
      </CardContent>
    </Card>
  )
}
