import { Printer } from 'lucide-react'
import { escapeHtml } from '@/lib/sanitize'
import type { Lesson } from '@/types'

interface Props {
  lesson: Lesson
}

export function PrintLessonButton({ lesson }: Props) {
  function handlePrint() {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const segments = lesson.segments ?? []
    const e = escapeHtml

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${e(lesson.title)} — Seed</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=Inter:wght@400;500&display=swap');
          body { font-family: 'Inter', sans-serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1A1A1A; line-height: 1.7; }
          h1 { font-family: 'Fraunces', serif; font-size: 24px; margin-bottom: 8px; }
          h2 { font-family: 'Fraunces', serif; font-size: 18px; margin-top: 32px; margin-bottom: 8px; }
          .hook { font-style: italic; color: #6B6B66; margin-bottom: 24px; font-size: 16px; }
          .segment { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E8E6DF; }
          .segment:last-child { border-bottom: none; }
          .segment-type { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #87A878; margin-bottom: 4px; }
          .instructions { background: #FAFAF7; padding: 12px 16px; border-radius: 8px; font-size: 14px; color: #6B6B66; margin-top: 8px; }
          .questions { margin-top: 32px; }
          .question { background: #FAFAF7; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; }
          .meta { font-size: 12px; color: #6B6B66; margin-top: 24px; padding-top: 16px; border-top: 1px solid #E8E6DF; }
          @media print { body { margin: 0; padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${e(lesson.title)}</h1>
        ${lesson.hook ? `<p class="hook">${e(lesson.hook)}</p>` : ''}

        ${segments.map((seg) => `
          <div class="segment">
            <div class="segment-type">${e(seg.type.replace('_', ' '))}</div>
            <h2>${e(seg.title)}</h2>
            <p>${e(seg.content)}</p>
            ${seg.instructions ? `<div class="instructions">${e(seg.instructions)}</div>` : ''}
          </div>
        `).join('')}

        ${lesson.questions ? `
          <div class="questions">
            <h2>Check Your Understanding</h2>
            ${(lesson.questions as { question: string }[]).map((q) => `
              <div class="question"><p>${e(q.question)}</p></div>
            `).join('')}
          </div>
        ` : ''}

        <div class="meta">
          <p>${e(lesson.subject)} · ${e(lesson.concept_node?.replace(/-/g, ' ') ?? '')} · ${lesson.estimated_minutes ?? '?'} min</p>
          <p>Printed from Seed — seedlearning.com</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground hover:border-sage/50 transition-colors touch-target"
    >
      <Printer className="h-4 w-4" />
      Print lesson
    </button>
  )
}
