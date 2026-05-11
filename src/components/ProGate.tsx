import { Link } from 'react-router-dom'
import { useSubscription } from '@/hooks/useSubscription'
import { Sparkles, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: React.ReactNode
  /** Short label for the feature being gated */
  feature?: string
  /** "overlay" blurs children and overlays CTA. "block" replaces children entirely. */
  mode?: 'overlay' | 'block'
}

export function ProGate({ children, feature, mode = 'block' }: Props) {
  const { isPro, loading } = useSubscription()

  if (loading) return null
  if (isPro) return <>{children}</>

  if (mode === 'overlay') {
    return (
      <div className="relative">
        <div className="pointer-events-none select-none blur-[2px] opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-2xl bg-surface-solid border border-border shadow-lg p-6 text-center max-w-xs">
            <Lock className="h-6 w-6 text-sage mx-auto mb-3" />
            <h3 className="font-display text-base font-semibold mb-1">
              {feature ? `${feature} is a Pro feature` : 'Pro feature'}
            </h3>
            <p className="text-xs text-muted mb-4">
              Upgrade to Seed Pro to unlock this and all other premium features.
            </p>
            <Button size="sm" asChild>
              <Link to="/pricing">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Upgrade to Pro
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-sage/20 bg-sage/[0.04] p-8 text-center">
      <Lock className="h-8 w-8 text-sage mx-auto mb-3" />
      <h3 className="font-display text-lg font-semibold mb-2">
        {feature ? `${feature} is a Pro feature` : 'Unlock with Seed Pro'}
      </h3>
      <p className="text-sm text-muted mb-5 max-w-md mx-auto">
        Upgrade to Seed Pro ($9.99/mo) to access this feature and everything else Seed has to offer. Start with a free 14-day trial.
      </p>
      <Button asChild>
        <Link to="/pricing">
          <Sparkles className="h-4 w-4 mr-2" /> See plans
        </Link>
      </Button>
    </div>
  )
}
