import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sprout, BookOpen, Brain, Heart, Shield, Leaf } from 'lucide-react'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'World-Class Curriculum',
    description: 'Each lesson draws from the strongest pedagogy for that subject — Singapore Math, Finnish science, Classical writing, and more.',
  },
  {
    icon: Brain,
    title: 'Age-Calibrated Lessons',
    description: 'Lesson blocks tuned to developmental attention spans. Movement breaks built in. No burnout, no boredom.',
  },
  {
    icon: Heart,
    title: 'Calm by Design',
    description: 'No badges, no streaks, no points. Learning is the reward. Beautiful, warm, distraction-free.',
  },
  {
    icon: Sprout,
    title: 'Personalized Growth',
    description: 'Every child gets a curriculum shaped by their age, interests, learning style, and family values.',
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'COPPA-compliant. No ads, ever. No child behavior tracking. Your family\'s data stays yours.',
  },
  {
    icon: Leaf,
    title: 'The Whole Child',
    description: 'Wonder questions, keepsake portfolios, family together time, and nature-inspired rhythm planning.',
  },
]

export function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
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

      {/* Hero */}
      <section className="px-6 pt-16 pb-24 max-w-3xl mx-auto text-center">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight">
          A calm, curious place to grow.
        </h1>
        <p className="mt-6 text-lg text-muted max-w-xl mx-auto leading-relaxed">
          Seed builds personalized learning paths for kids ages 5–13 using the best
          principles from leading education systems worldwide. Beautiful, tablet-first,
          and genuinely loved by families.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/signup">Start your free trial</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signin">I have an account</Link>
          </Button>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-surface p-6">
              <feature.icon className="h-8 w-8 text-sage mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pedagogy bar */}
      <section className="px-6 pb-24 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-2xl font-semibold mb-4">
          Built on the shoulders of the world's best
        </h2>
        <p className="text-muted mb-8 max-w-2xl mx-auto">
          Seed synthesizes research-backed methods so your family is never locked into one school of thought.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Singapore Math', 'Finnish Science', 'Classical Trivium', 'Charlotte Mason', 'Montessori', 'Waldorf', 'Reggio Emilia', 'Japanese Lesson Study'].map((method) => (
            <span
              key={method}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted"
            >
              {method}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-sage" />
            <span className="font-display font-medium text-foreground">Seed</span>
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
