import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { StickyNote } from 'lucide-react'

interface Props {
  childId: string
  childName: string
}

export function ParentNotes({ childId, childName }: Props) {
  const key = `seed-notes-${childId}`
  const [notes, setNotes] = useState('')
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setNotes(parsed.text ?? '')
        setLastSaved(parsed.savedAt ?? null)
      } catch {
        setNotes(saved)
      }
    }
  }, [key])

  function handleChange(text: string) {
    setNotes(text)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const savedAt = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      localStorage.setItem(key, JSON.stringify({ text, savedAt }))
      setLastSaved(savedAt)
    }, 800)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-terracotta" />
            <CardTitle>Parent Notes</CardTitle>
          </div>
          {lastSaved && (
            <span className="text-xs text-muted">Saved at {lastSaved}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <textarea
          value={notes}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Notes about ${childName}'s progress, observations, or ideas...`}
          className="w-full min-h-[120px] rounded-lg border border-border bg-background px-4 py-3 text-sm leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-sage resize-y"
        />
        <p className="text-xs text-muted mt-2">Private to you. Saved locally on this device.</p>
      </CardContent>
    </Card>
  )
}
