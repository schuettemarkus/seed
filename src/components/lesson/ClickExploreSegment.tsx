import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ExploreItem {
  id: string
  label: string
  content: string
  icon?: string
}

interface Props {
  items: ExploreItem[]
  instruction: string
}

export function ClickExploreSegment({ items, instruction }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [visited, setVisited] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setVisited((prev) => new Set(prev).add(id))
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allVisited = visited.size === items.length

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-sage">{instruction}</p>

      <div className="space-y-2">
        {items.map((item) => {
          const isOpen = expanded.has(item.id)
          const wasVisited = visited.has(item.id)

          return (
            <div key={item.id} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggle(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors touch-target',
                  isOpen ? 'bg-sage/5' : 'bg-surface hover:bg-background',
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className={cn(
                    'text-sm font-medium',
                    wasVisited && !isOpen ? 'text-muted' : 'text-foreground',
                  )}>
                    {item.label}
                  </span>
                </div>
                {isOpen
                  ? <ChevronUp className="h-4 w-4 text-muted flex-shrink-0" />
                  : <ChevronDown className="h-4 w-4 text-muted flex-shrink-0" />
                }
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1">
                  <p className="lesson-text text-muted leading-relaxed">{item.content}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {allVisited && (
        <div className="rounded-lg bg-sage/10 p-3 text-sm text-sage-dark font-medium text-center">
          You explored everything — nice curiosity!
        </div>
      )}

      <div className="flex justify-center">
        <span className="text-xs text-muted">
          {visited.size} of {items.length} explored
        </span>
      </div>
    </div>
  )
}
