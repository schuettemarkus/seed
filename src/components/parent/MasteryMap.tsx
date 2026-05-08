import { useMastery } from '@/hooks/useMastery'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import type { Subject } from '@/types'

const SUBJECT_LABELS: Record<Subject, string> = {
  math: 'Math',
  language_arts: 'Language Arts',
  science: 'Science',
  social_studies: 'Social Studies',
}

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  introduced: { bg: '#E8E6DF', text: '#6B6B66' },
  practicing: { bg: '#7A9CC6', text: '#FFFFFF' },
  proficient: { bg: '#87A878', text: '#FFFFFF' },
  mastered: { bg: '#6b8c5e', text: '#FFFFFF' },
}

interface Props {
  childId: string
  subjects: Subject[]
}

export function MasteryMap({ childId, subjects }: Props) {
  const { mastery } = useMastery(childId)

  const masteryBySubject = subjects.reduce<Record<Subject, typeof mastery>>((acc, subject) => {
    acc[subject] = mastery.filter((m) => m.subject === subject)
    return acc
  }, {} as Record<Subject, typeof mastery>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-sage" />
          <CardTitle>Mastery Map</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {subjects.map((subject) => {
          const items = masteryBySubject[subject] ?? []
          const counts = {
            introduced: items.filter((m) => m.level === 'introduced').length,
            practicing: items.filter((m) => m.level === 'practicing').length,
            proficient: items.filter((m) => m.level === 'proficient').length,
            mastered: items.filter((m) => m.level === 'mastered').length,
          }
          const total = items.length

          return (
            <div key={subject}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">{SUBJECT_LABELS[subject]}</h3>
                <span className="text-xs text-muted">{total} concepts</span>
              </div>

              {total === 0 ? (
                <p className="text-xs text-muted">No concepts tracked yet</p>
              ) : (
                <>
                  {/* Progress bar */}
                  <div className="flex h-3 rounded-full overflow-hidden">
                    {(['mastered', 'proficient', 'practicing', 'introduced'] as const).map((level) => {
                      const pct = total > 0 ? (counts[level] / total) * 100 : 0
                      if (pct === 0) return null
                      return (
                        <div
                          key={level}
                          style={{ width: `${pct}%`, backgroundColor: LEVEL_COLORS[level].bg }}
                          className="transition-all duration-500"
                        />
                      )
                    })}
                  </div>

                  {/* Concept chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {items.map((m) => {
                      const colors = LEVEL_COLORS[m.level] ?? LEVEL_COLORS.introduced
                      return (
                        <span
                          key={m.id}
                          className="rounded-md px-2 py-0.5 text-xs"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                          title={`${m.concept_node}: ${m.level}`}
                        >
                          {m.concept_node.replace(/-/g, ' ')}
                        </span>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Legend */}
        <div className="flex gap-4 pt-2 border-t border-border">
          {Object.entries(LEVEL_COLORS).map(([level, colors]) => (
            <div key={level} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors.bg }} />
              <span className="text-xs text-muted capitalize">{level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
