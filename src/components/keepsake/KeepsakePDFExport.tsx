import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Child, PortfolioEntry } from '@/types'

interface Props {
  child: Child
}

export function KeepsakePDFExport({ child }: Props) {
  const [generating, setGenerating] = useState(false)

  async function generatePDF() {
    setGenerating(true)

    // Fetch all portfolio entries
    const { data: entries } = await supabase
      .from('portfolio_entries')
      .select('*')
      .eq('child_id', child.id)
      .order('created_at')

    const portfolio = (entries as PortfolioEntry[]) ?? []

    // Generate printable HTML
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setGenerating(false)
      return
    }

    const favorites = portfolio.filter((e) => e.is_parent_favorite)
    const milestones = portfolio.filter((e) => e.entry_type === 'milestone')
    const drawings = portfolio.filter((e) => e.entry_type === 'drawing')
    const writings = portfolio.filter((e) => e.entry_type === 'text')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${child.name}'s Year in Review — Seed</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=Inter:wght@400;500&display=swap');
          body { font-family: 'Inter', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 24px; color: #1A1A1A; }
          h1 { font-family: 'Fraunces', serif; font-size: 32px; text-align: center; margin-bottom: 8px; }
          h2 { font-family: 'Fraunces', serif; font-size: 20px; margin-top: 40px; padding-bottom: 8px; border-bottom: 2px solid #87A878; }
          .subtitle { text-align: center; color: #6B6B66; margin-bottom: 40px; }
          .entry { margin-bottom: 24px; padding: 16px; border: 1px solid #E8E6DF; border-radius: 12px; }
          .entry-title { font-weight: 600; margin-bottom: 4px; }
          .entry-date { font-size: 12px; color: #6B6B66; }
          .entry-caption { font-size: 14px; color: #6B6B66; margin-top: 4px; }
          .cover-icon { text-align: center; font-size: 48px; margin: 40px 0; }
          .footer { text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #E8E6DF; font-size: 12px; color: #6B6B66; }
          @media print { body { padding: 20px; } }
          @page { margin: 1in; }
        </style>
      </head>
      <body>
        <div class="cover-icon">🌱</div>
        <h1>${child.name}'s Year in Review</h1>
        <p class="subtitle">Age ${child.age} · A keepsake from Seed</p>

        ${milestones.length > 0 ? `
          <h2>Milestones</h2>
          ${milestones.map((e) => `
            <div class="entry">
              <div class="entry-title">${e.title ?? 'Milestone'}</div>
              <div class="entry-date">${new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              ${e.caption ? `<div class="entry-caption">${e.caption}</div>` : ''}
            </div>
          `).join('')}
        ` : ''}

        ${favorites.length > 0 ? `
          <h2>Parent Favorites</h2>
          ${favorites.map((e) => `
            <div class="entry">
              <div class="entry-title">${e.title ?? e.entry_type}</div>
              <div class="entry-date">${new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
              ${e.caption ? `<div class="entry-caption">${e.caption}</div>` : ''}
            </div>
          `).join('')}
        ` : ''}

        ${drawings.length > 0 ? `
          <h2>Artwork</h2>
          ${drawings.map((e) => `
            <div class="entry">
              <div class="entry-title">${e.title ?? 'Drawing'}</div>
              <div class="entry-date">${new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
              ${e.storage_path ? `<img src="${e.storage_path}" style="max-width:100%;margin-top:8px;border-radius:8px;" />` : ''}
            </div>
          `).join('')}
        ` : ''}

        ${writings.length > 0 ? `
          <h2>Writing</h2>
          ${writings.map((e) => `
            <div class="entry">
              <div class="entry-title">${e.title ?? 'Writing'}</div>
              <div class="entry-date">${new Date(e.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
              ${e.caption ? `<div class="entry-caption">${e.caption}</div>` : ''}
            </div>
          `).join('')}
        ` : ''}

        <div class="footer">
          <p>Made with 🌱 Seed — seedlearning.com</p>
          <p>${portfolio.length} memories captured</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    setGenerating(false)
  }

  return (
    <Button variant="secondary" onClick={generatePDF} disabled={generating}>
      {generating ? (
        'Generating...'
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export Keepsake PDF
        </>
      )}
    </Button>
  )
}
