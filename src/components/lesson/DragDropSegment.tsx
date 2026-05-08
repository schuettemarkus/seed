import { useState } from 'react'
import { cn } from '@/lib/utils'

interface DragDropItem {
  id: string
  label: string
  zone?: string
}

interface DragDropZone {
  id: string
  label: string
}

interface DragDropData {
  items: DragDropItem[]
  zones: DragDropZone[]
  correctMapping: Record<string, string>
}

interface Props {
  data: DragDropData
  onComplete: (correct: boolean) => void
}

export function DragDropSegment({ data, onComplete }: Props) {
  const { items, zones, correctMapping } = data
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<string, boolean>>({})

  const unplaced = items.filter((item) => !placed[item.id])

  function handleDragStart(itemId: string) {
    setDragging(itemId)
  }

  function handleDrop(zoneId: string) {
    if (!dragging) return
    setPlaced((prev) => ({ ...prev, [dragging]: zoneId }))
    setDragging(null)
  }

  function handleTapPlace(itemId: string, zoneId: string) {
    setPlaced((prev) => ({ ...prev, [itemId]: zoneId }))
  }

  function handleRemove(itemId: string) {
    if (checked) return
    setPlaced((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
  }

  function handleCheck() {
    const res: Record<string, boolean> = {}
    let allCorrect = true
    for (const item of items) {
      const correct = placed[item.id] === correctMapping[item.id]
      res[item.id] = correct
      if (!correct) allCorrect = false
    }
    setResults(res)
    setChecked(true)
    onComplete(allCorrect)
  }

  const allPlaced = Object.keys(placed).length === items.length

  return (
    <div className="space-y-6">
      {/* Unplaced items */}
      {unplaced.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unplaced.map((item) => (
            <button
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              className="rounded-lg border border-sage/40 bg-sage/5 px-4 py-2.5 text-sm font-medium cursor-grab active:cursor-grabbing touch-target transition-transform hover:scale-105"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Drop zones */}
      <div className="grid gap-3">
        {zones.map((zone) => {
          const zoneItems = items.filter((item) => placed[item.id] === zone.id)
          return (
            <div
              key={zone.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              className={cn(
                'rounded-xl border-2 border-dashed p-4 min-h-[60px] transition-colors',
                dragging ? 'border-sage/60 bg-sage/5' : 'border-border',
              )}
            >
              <div className="text-xs font-medium text-muted mb-2">{zone.label}</div>
              <div className="flex flex-wrap gap-2">
                {zoneItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleRemove(item.id)}
                    className={cn(
                      'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      checked
                        ? results[item.id]
                          ? 'bg-sage/20 text-sage-dark border border-sage/40'
                          : 'bg-terracotta/20 text-terracotta border border-terracotta/40'
                        : 'bg-surface border border-border hover:border-sage/40',
                    )}
                  >
                    {item.label}
                    {checked && (results[item.id] ? ' ✓' : ' ✗')}
                  </button>
                ))}
              </div>
              {/* Tap-to-place for touch devices when an item is selected */}
              {!checked && unplaced.length > 0 && zoneItems.length === 0 && (
                <button
                  onClick={() => unplaced[0] && handleTapPlace(unplaced[0].id, zone.id)}
                  className="text-xs text-muted mt-1 hover:text-sage"
                >
                  Tap to place here
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Check button */}
      {allPlaced && !checked && (
        <button
          onClick={handleCheck}
          className="w-full rounded-lg bg-sage py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors touch-target"
        >
          Check my answers
        </button>
      )}

      {checked && (
        <div className={cn(
          'rounded-lg p-4 text-sm font-medium',
          Object.values(results).every(Boolean)
            ? 'bg-sage/10 text-sage-dark'
            : 'bg-terracotta/10 text-terracotta',
        )}>
          {Object.values(results).every(Boolean)
            ? 'Perfect! You got them all right.'
            : 'Not quite — take a look at the ones marked with ✗ and think about why.'}
        </div>
      )}
    </div>
  )
}
