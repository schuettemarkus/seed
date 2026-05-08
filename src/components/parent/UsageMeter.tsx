import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Zap } from 'lucide-react'

interface Props {
  parentId: string
}

export function UsageMeter({ parentId }: Props) {
  const [totalCost, setTotalCost] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const [callCount, setCallCount] = useState(0)

  useEffect(() => {
    // Get current month's usage
    const firstOfMonth = new Date()
    firstOfMonth.setDate(1)
    firstOfMonth.setHours(0, 0, 0, 0)

    supabase
      .from('usage_logs')
      .select('*')
      .eq('parent_id', parentId)
      .gte('created_at', firstOfMonth.toISOString())
      .then(({ data }) => {
        const logs = data ?? []
        setCallCount(logs.length)
        setTotalCost(logs.reduce((sum, l) => sum + (l.cost_usd ?? 0), 0))
        setTotalTokens(logs.reduce((sum, l) => sum + (l.input_tokens ?? 0) + (l.output_tokens ?? 0), 0))
      })
  }, [parentId])

  // Monthly budget tiers
  const BUDGET = 10.0 // $10 per month on free tier
  const pct = BUDGET > 0 ? Math.min((totalCost / BUDGET) * 100, 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-terracotta" />
          <CardTitle>AI Usage This Month</CardTitle>
        </div>
        <p className="text-xs text-muted">Transparency into how Seed uses AI for your family.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xl font-display font-semibold">{callCount}</div>
            <div className="text-xs text-muted">AI calls</div>
          </div>
          <div>
            <div className="text-xl font-display font-semibold">
              {totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}k` : totalTokens}
            </div>
            <div className="text-xs text-muted">Tokens</div>
          </div>
          <div>
            <div className="text-xl font-display font-semibold">${totalCost.toFixed(2)}</div>
            <div className="text-xs text-muted">Cost</div>
          </div>
        </div>

        {/* Budget bar */}
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Monthly budget</span>
            <span>${totalCost.toFixed(2)} / ${BUDGET.toFixed(2)}</span>
          </div>
          <div className="h-2 rounded-full bg-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pct > 80 ? 'bg-terracotta' : 'bg-sage'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
