import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Play, RotateCcw, Sliders } from 'lucide-react'

interface SimulationParam {
  id: string
  label: string
  min: number
  max: number
  step: number
  default: number
  unit?: string
}

interface SimulationData {
  title: string
  description: string
  params: SimulationParam[]
  compute: string // description of what happens — actual computation is AI-described
}

interface Props {
  data: SimulationData
  onComplete: () => void
}

export function SimulationSegment({ data, onComplete }: Props) {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(data.params.map((p) => [p.id, p.default])),
  )
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [runCount, setRunCount] = useState(0)

  function updateParam(id: string, value: number) {
    setValues((prev) => ({ ...prev, [id]: value }))
    setResult(null)
  }

  function reset() {
    setValues(Object.fromEntries(data.params.map((p) => [p.id, p.default])))
    setResult(null)
  }

  function runSimulation() {
    setRunning(true)
    // Simulate a brief computation delay for the "aha" moment
    setTimeout(() => {
      // In a real implementation, this would call the AI or a math engine
      // For now, generate a descriptive result based on params
      const paramSummary = data.params
        .map((p) => `${p.label}: ${values[p.id]}${p.unit ?? ''}`)
        .join(', ')
      setResult(`With ${paramSummary} — ${data.compute}`)
      setRunning(false)
      setRunCount((c) => c + 1)
      if (runCount >= 1) onComplete()
    }, 800)
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sliders className="h-4 w-4 text-sky" />
          <h4 className="text-sm font-medium">{data.title}</h4>
        </div>
        <p className="text-sm text-muted leading-relaxed">{data.description}</p>
      </div>

      {/* Parameter sliders */}
      <div className="space-y-4 rounded-xl border border-border p-4 bg-surface">
        {data.params.map((param) => (
          <div key={param.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{param.label}</span>
              <span className="text-sage font-medium">
                {values[param.id]}{param.unit ?? ''}
              </span>
            </div>
            <input
              type="range"
              min={param.min}
              max={param.max}
              step={param.step}
              value={values[param.id]}
              onChange={(e) => updateParam(param.id, Number(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-sage"
            />
            <div className="flex justify-between text-xs text-muted mt-0.5">
              <span>{param.min}{param.unit ?? ''}</span>
              <span>{param.max}{param.unit ?? ''}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Run / Reset */}
      <div className="flex gap-3">
        <button
          onClick={runSimulation}
          disabled={running}
          className={cn(
            'flex-1 rounded-lg py-3 text-sm font-medium transition-colors touch-target flex items-center justify-center gap-2',
            running
              ? 'bg-sage/50 text-white cursor-wait'
              : 'bg-sage text-white hover:bg-sage-dark',
          )}
        >
          <Play className="h-4 w-4" />
          {running ? 'Running...' : 'Run simulation'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg border border-border px-4 py-3 text-sm hover:bg-background transition-colors touch-target"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="rounded-xl bg-sky/5 border border-sky/20 p-4">
          <p className="lesson-text text-foreground leading-relaxed">{result}</p>
          {runCount < 2 && (
            <p className="text-xs text-muted mt-2">
              Try changing the values and running it again to see what happens!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
