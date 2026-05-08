import { useRef, useState, useEffect } from 'react'
import { Eraser, Undo2 } from 'lucide-react'

interface Props {
  prompt: string
  onSave: (dataUrl: string) => void
}

const COLORS = ['#1A1A1A', '#87A878', '#7A9CC6', '#C97C5D', '#B8A9C9', '#D4A574']

export function DrawCanvasSegment({ prompt, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [drawing, setDrawing] = useState(false)
  const [color, setColor] = useState(COLORS[0])
  const [history, setHistory] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Size canvas to container
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = Math.min(rect.width * 0.75, 400)
    }

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 3
  }, [])

  function getPos(e: React.TouchEvent | React.MouseEvent) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  function startDraw(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    // Save state for undo
    setHistory((prev) => [...prev.slice(-20), ctx.getImageData(0, 0, canvas.width, canvas.height)])

    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.strokeStyle = color
    setDrawing(true)
  }

  function draw(e: React.TouchEvent | React.MouseEvent) {
    if (!drawing) return
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  function stopDraw() {
    setDrawing(false)
  }

  function undo() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas || history.length === 0) return
    const prev = history[history.length - 1]
    ctx.putImageData(prev, 0, 0)
    setHistory((h) => h.slice(0, -1))
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    setHistory((prev) => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)])
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  function save() {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL('image/png'))
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-sage">{prompt}</p>

      <div className="rounded-xl border border-border overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-8 w-8 rounded-full transition-all touch-target ${
                color === c ? 'ring-2 ring-offset-2 ring-sage scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={undo} className="rounded-lg border border-border p-2 hover:bg-background touch-target">
            <Undo2 className="h-4 w-4" />
          </button>
          <button onClick={clear} className="rounded-lg border border-border p-2 hover:bg-background touch-target">
            <Eraser className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={save}
        className="w-full rounded-lg bg-sage py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors touch-target"
      >
        Save my drawing
      </button>
    </div>
  )
}
