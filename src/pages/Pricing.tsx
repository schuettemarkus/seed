import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sprout, Check } from 'lucide-react'

const FREE_FEATURES = [
  'Personalized daily lessons for 1 child',
  'AI-generated content (Claude-powered)',
  'All 4 core subjects',
  'Movement breaks between lessons',
  'Basic progress tracking',
]

const PRO_FEATURES = [
  'Everything in Free, plus:',
  'Unlimited children',
  'Wonder Wall with bonus lessons',
  'AI Learning Companion (Socratic tutor)',
  'Mastery maps & engagement heatmaps',
  'Keepsake portfolio & PDF export',
  'Family rhythm planner',
  'State compliance reports',
  'Multi-adult access (co-parents, grandparents)',
  'Weekly progress email reports',
  'Priority lesson generation',
  'Data export anytime',
]

export function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Sprout className="h-7 w-7 text-sage" />
          <span className="font-display text-xl font-semibold text-foreground">Seed</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      <section className="px-6 pt-12 pb-8 max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight">
          Simple pricing. No surprises.
        </h1>
        <p className="mt-4 text-lg text-muted max-w-xl mx-auto">
          Start for free. Upgrade when you're ready for the full experience.
        </p>
      </section>

      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free tier */}
          <Card className="p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold">Free</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">$0</span>
                <span className="text-muted text-sm">/forever</span>
              </div>
              <p className="text-sm text-muted mt-2">
                Everything you need to get started. Real lessons, real learning.
              </p>
            </div>
            <ul className="space-y-3 flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button variant="secondary" className="w-full" asChild>
                <Link to="/signup">Start free</Link>
              </Button>
            </div>
          </Card>

          {/* Pro tier */}
          <Card className="p-8 flex flex-col border-sage/40 ring-1 ring-sage/20 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-sage text-white text-xs font-medium px-3 py-1 rounded-full">
                Most families choose this
              </span>
            </div>
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold">Seed Pro</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold">$9.99</span>
                <span className="text-muted text-sm">/month</span>
              </div>
              <p className="text-sm text-muted mt-2">
                The full Seed experience. Every feature, every child, every day.
              </p>
            </div>
            <ul className="space-y-3 flex-1">
              {PRO_FEATURES.map((f, i) => (
                <li key={f} className={`flex items-start gap-3 text-sm ${i === 0 ? 'font-medium text-foreground' : ''}`}>
                  {i > 0 && <Check className="h-4 w-4 text-sage flex-shrink-0 mt-0.5" />}
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button className="w-full" asChild>
                <Link to="/signup">Start 14-day free trial</Link>
              </Button>
              <p className="text-xs text-muted text-center mt-2">No credit card required to start</p>
            </div>
          </Card>
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted max-w-lg mx-auto">
            We believe every family deserves access to great education. The free plan isn't a demo —
            it's real, personalized, AI-generated lessons every day. Seed Pro unlocks the tools
            that help you track, plan, and treasure the journey.
          </p>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <Link to="/" className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-sage" />
            <span className="font-display font-medium text-foreground">Seed</span>
          </Link>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
