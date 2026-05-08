import { useState, useEffect } from 'react'
import { Wind, Play } from 'lucide-react'

interface Props {
  activity: string
  durationMinutes: number
  onComplete: () => void
}

export function MovementBreak({ activity, durationMinutes, onComplete }: Props) {
  const [started, setStarted] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60)

  useEffect(() => {
    if (!started || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [started, secondsLeft])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60

  return (
    <div className="flex flex-col items-center py-8 space-y-6">
      <div className="h-20 w-20 rounded-full bg-terracotta/10 flex items-center justify-center">
        <Wind className="h-10 w-10 text-terracotta" />
      </div>

      <div className="text-center space-y-2">
        <h2 className="font-display text-2xl font-semibold">Movement Break</h2>
        <p className="lesson-text text-muted max-w-sm">{activity}</p>
      </div>

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="rounded-lg bg-terracotta px-8 py-3 text-sm font-medium text-white hover:bg-terracotta/90 transition-colors touch-target flex items-center gap-2"
        >
          <Play className="h-4 w-4" /> Start break
        </button>
      ) : secondsLeft > 0 ? (
        <div className="space-y-4 text-center">
          <div className="font-display text-4xl font-semibold text-terracotta">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <p className="text-xs text-muted">Take your time — there's no rush.</p>
          <button
            onClick={onComplete}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Skip — I'm ready
          </button>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <p className="text-sage font-medium">Great break!</p>
          <button
            onClick={onComplete}
            className="rounded-lg bg-sage px-8 py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors touch-target"
          >
            Back to learning
          </button>
        </div>
      )}
    </div>
  )
}
