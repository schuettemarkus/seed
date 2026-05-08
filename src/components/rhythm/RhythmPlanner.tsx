import { useState, useEffect } from 'react'
import { supabase, DEMO_MODE } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GripVertical, Plus, Trash2, Clock } from 'lucide-react'

interface TimeBlock {
  id: string
  label: string
  startTime: string
  durationMin: number
  type: 'lesson' | 'break' | 'activity' | 'custom'
  color: string
}

interface Template {
  name: string
  description: string
  blocks: Omit<TimeBlock, 'id'>[]
}

const TEMPLATES: Template[] = [
  {
    name: 'Charlotte Mason',
    description: 'Short lessons, nature study, read-aloud, handicrafts',
    blocks: [
      { label: 'Morning Meeting', startTime: '08:30', durationMin: 15, type: 'activity', color: '#87A878' },
      { label: 'Math', startTime: '08:45', durationMin: 20, type: 'lesson', color: '#87A878' },
      { label: 'Nature Walk', startTime: '09:05', durationMin: 30, type: 'activity', color: '#6BA3A0' },
      { label: 'Language Arts', startTime: '09:35', durationMin: 20, type: 'lesson', color: '#7A9CC6' },
      { label: 'Snack Break', startTime: '09:55', durationMin: 15, type: 'break', color: '#C97C5D' },
      { label: 'Read-Aloud', startTime: '10:10', durationMin: 20, type: 'activity', color: '#B8A9C9' },
      { label: 'Science', startTime: '10:30', durationMin: 20, type: 'lesson', color: '#C97C5D' },
      { label: 'Handicrafts / Art', startTime: '10:50', durationMin: 30, type: 'activity', color: '#D4A574' },
    ],
  },
  {
    name: 'Classical',
    description: 'Grammar, logic, writing focus with structured lessons',
    blocks: [
      { label: 'Morning Circle', startTime: '08:00', durationMin: 10, type: 'activity', color: '#87A878' },
      { label: 'Math', startTime: '08:10', durationMin: 30, type: 'lesson', color: '#87A878' },
      { label: 'Movement Break', startTime: '08:40', durationMin: 10, type: 'break', color: '#C97C5D' },
      { label: 'Language Arts', startTime: '08:50', durationMin: 30, type: 'lesson', color: '#7A9CC6' },
      { label: 'Snack', startTime: '09:20', durationMin: 15, type: 'break', color: '#C97C5D' },
      { label: 'History / Social Studies', startTime: '09:35', durationMin: 25, type: 'lesson', color: '#B8A9C9' },
      { label: 'Science', startTime: '10:00', durationMin: 25, type: 'lesson', color: '#C97C5D' },
      { label: 'Free Exploration', startTime: '10:25', durationMin: 30, type: 'activity', color: '#6BA3A0' },
    ],
  },
  {
    name: 'Flexible / Relaxed',
    description: 'Loose structure, child-led pacing, lots of play',
    blocks: [
      { label: 'Morning Reading', startTime: '09:00', durationMin: 20, type: 'activity', color: '#B8A9C9' },
      { label: 'Math Lesson', startTime: '09:20', durationMin: 20, type: 'lesson', color: '#87A878' },
      { label: 'Outside Play', startTime: '09:40', durationMin: 30, type: 'break', color: '#6BA3A0' },
      { label: 'Language Arts', startTime: '10:10', durationMin: 20, type: 'lesson', color: '#7A9CC6' },
      { label: 'Creative Time', startTime: '10:30', durationMin: 30, type: 'activity', color: '#D4A574' },
      { label: 'Science or Social Studies', startTime: '11:00', durationMin: 20, type: 'lesson', color: '#C97C5D' },
    ],
  },
]

interface Props {
  parentId: string
}

export function RhythmPlanner({ parentId }: Props) {
  const [blocks, setBlocks] = useState<TimeBlock[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (DEMO_MODE) return
    supabase
      .from('family_rhythm')
      .select('*')
      .eq('parent_id', parentId)
      .single()
      .then(({ data }) => {
        if (data?.schedule) {
          setBlocks((data.schedule as { blocks: TimeBlock[] }).blocks ?? [])
          setSelectedTemplate(data.template ?? null)
        }
      })
  }, [parentId])

  function applyTemplate(template: Template) {
    setBlocks(
      template.blocks.map((b, i) => ({ ...b, id: `block-${i}-${Date.now()}` })),
    )
    setSelectedTemplate(template.name)
    setSaved(false)
  }

  function addBlock() {
    setBlocks((prev) => [
      ...prev,
      { id: `block-${Date.now()}`, label: 'New Block', startTime: '12:00', durationMin: 15, type: 'custom', color: '#E8E6DF' },
    ])
    setSaved(false)
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    setSaved(false)
  }

  function updateBlock(id: string, updates: Partial<TimeBlock>) {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)))
    setSaved(false)
  }

  async function saveSchedule() {
    if (DEMO_MODE) { setSaved(true); return }
    await supabase.from('family_rhythm').upsert({
      parent_id: parentId,
      schedule: { blocks },
      template: selectedTemplate,
      updated_at: new Date().toISOString(),
    })
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      {/* Template picker */}
      <Card>
        <CardHeader>
          <CardTitle>Choose a Template</CardTitle>
          <p className="text-xs text-muted">Start with a rhythm that matches your family, then customize.</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.name}
                onClick={() => applyTemplate(t)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  selectedTemplate === t.name
                    ? 'border-sage bg-sage/5'
                    : 'border-border hover:border-sage/50'
                }`}
              >
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted">{t.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Day builder */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Your Day</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={addBlock}>
                  <Plus className="h-4 w-4 mr-1" /> Add block
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 group"
                >
                  <GripVertical className="h-4 w-4 text-muted flex-shrink-0 cursor-grab" />
                  <div
                    className="h-8 w-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: block.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={block.label}
                      onChange={(e) => updateBlock(block.id, { label: e.target.value })}
                      className="text-sm font-medium bg-transparent border-none outline-none w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="time"
                      value={block.startTime}
                      onChange={(e) => updateBlock(block.id, { startTime: e.target.value })}
                      className="text-xs text-muted bg-transparent border-none outline-none"
                    />
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="h-3 w-3" />
                      <input
                        type="number"
                        value={block.durationMin}
                        onChange={(e) => updateBlock(block.id, { durationMin: Number(e.target.value) })}
                        className="w-8 bg-transparent border-none outline-none text-right"
                        min={5}
                        max={120}
                      />
                      <span>min</span>
                    </div>
                    <button
                      onClick={() => removeBlock(block.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 touch-target"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted hover:text-terracotta" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted">
                Total: {blocks.reduce((sum, b) => sum + b.durationMin, 0)} minutes
              </span>
              <Button size="sm" onClick={saveSchedule} disabled={saved}>
                {saved ? 'Saved!' : 'Save schedule'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
