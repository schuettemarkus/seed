import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Sprout, BookOpen, Brain, Heart, Shield, Leaf, Clock, Sparkles, Users } from 'lucide-react'

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Lessons That Actually Teach',
    description: 'Every lesson is built from the best of what works globally — the math methods that made Singapore #1, the science approach that put Finland on top, the writing tradition that shaped history\'s clearest thinkers. Your kid gets the best of all of it, blended into one coherent experience.',
    detail: 'No workbooks. No busywork. Real learning.',
  },
  {
    icon: Brain,
    title: 'Built for How Kids Actually Learn',
    description: 'A 5-year-old can focus for about 10 minutes. A 12-year-old, maybe 25. Seed knows this. Lesson blocks are calibrated to your child\'s actual developmental attention span, with movement breaks woven in so they stay engaged — not exhausted.',
    detail: '10-minute blocks for little ones. Zero burnout.',
  },
  {
    icon: Heart,
    title: 'Calm, Not Chaotic',
    description: 'Most ed-tech is designed to be addictive — badges, streaks, leaderboards, confetti. Seed is the opposite. We believe learning is the reward. The interface is warm, beautiful, and distraction-free. Your child opens it and just... learns.',
    detail: 'Inspired by Headspace, not Candy Crush.',
  },
  {
    icon: Sparkles,
    title: 'AI That Gets Your Kid',
    description: 'Seed uses AI to generate lessons personalized to your child\'s age, interests, learning style, and even your family\'s values. A 7-year-old who loves animals gets different science lessons than one who loves space. It\'s not one-size-fits-all. It\'s built for your kid.',
    detail: 'Powered by Claude. Feels like a great tutor.',
  },
  {
    icon: Clock,
    title: 'Setup in 90 Seconds. Seriously.',
    description: 'Add your child — name, age, a few preferences — and Seed handles everything. Daily lesson plans, mastery tracking, progress reports, movement breaks. You don\'t need to plan a thing. Open it up each morning and the day is ready.',
    detail: 'No prep. No curriculum hunting. Just go.',
  },
  {
    icon: Shield,
    title: 'Your Family\'s Privacy is Sacred',
    description: 'We will never show your child an ad. Ever. We don\'t track their behavior for analytics. We don\'t sell data. We\'re COPPA-compliant, and you can export or delete everything with one click. Your family\'s data belongs to your family.',
    detail: 'No ads. No tracking. No compromise.',
  },
  {
    icon: Users,
    title: 'The Whole Family, Together',
    description: 'Invite grandparents to see progress. Let co-parents share access. Print beautiful compliance reports for your state. And every week, get a plain-English summary of what your child learned — so you always feel connected to their growth.',
    detail: 'Co-parents, grandparents, and tutors welcome.',
  },
  {
    icon: Leaf,
    title: 'More Than Academics',
    description: 'Seed captures your child\'s "I wonder why..." questions and turns them into bonus lessons. It builds a keepsake portfolio of their drawings, writing, and breakthroughs. At the end of the year, you get a beautiful book of their growth. This isn\'t just school. It\'s their story.',
    detail: 'Wonder Wall. Keepsake portfolio. Year-in-review.',
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
            <Link to="/pricing">Pricing</Link>
          </Button>
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
          Homeschool that feels like magic.
        </h1>
        <p className="mt-6 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Seed creates personalized, AI-powered lessons for kids ages 5-13 — drawing from
          the world's top education systems. Set up in 90 seconds. Open it each morning.
          Watch them grow.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/signup">Start your free trial</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signin">I have an account</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">No credit card required. Free for one child.</p>
      </section>

      {/* Social proof line */}
      <section className="px-6 pb-16 max-w-4xl mx-auto text-center">
        <p className="text-sm text-muted italic">
          "Finally, a homeschool platform that doesn't make me feel like I need a teaching degree."
        </p>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-semibold mb-3">
            Everything your family needs. Nothing it doesn't.
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            We built Seed for parents who want the best education for their kids without
            spending hours planning, searching for resources, or second-guessing themselves.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-border bg-surface p-7 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-lg bg-sage/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-sage" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-3">{feature.description}</p>
                  <p className="text-xs font-medium text-sage">{feature.detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <h2 className="font-display text-2xl font-semibold text-center mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Add your child', desc: 'Name, age, and a few learning preferences. That\'s it. Takes about 90 seconds.' },
            { step: '2', title: 'Open today\'s path', desc: 'Each morning, Seed has a personalized set of lessons ready. One tap to start.' },
            { step: '3', title: 'Watch them grow', desc: 'Track mastery, read progress reports, and build a keepsake of their learning journey.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="h-10 w-10 rounded-full bg-sage text-white font-display font-semibold text-lg flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-display text-base font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/signup">Start your free trial</Link>
          </Button>
        </div>
      </section>

      {/* Pedagogy bar */}
      <section className="px-6 pb-24 max-w-4xl mx-auto text-center">
        <h2 className="font-display text-2xl font-semibold mb-4">
          Built on research, not trends
        </h2>
        <p className="text-muted mb-8 max-w-2xl mx-auto">
          We studied the world's highest-performing education systems and synthesized
          what actually works into one platform. Your family gets the best of all of them.
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

      {/* FAQ */}
      <section className="px-6 pb-24 max-w-3xl mx-auto">
        <h2 className="font-display text-2xl font-semibold text-center mb-10">
          Questions parents ask
        </h2>
        <div className="space-y-4">
          {[
            {
              q: 'Is this a full curriculum or a supplement?',
              a: 'Seed is designed to be your complete daily curriculum for core subjects (math, language arts, science, social studies). Each day has a full set of age-calibrated lessons. That said, many families use it alongside other activities like sports, music, co-ops, or field trips.',
            },
            {
              q: 'How does the AI work? Is it safe for my kid?',
              a: 'Seed uses Claude (by Anthropic) to generate personalized lessons server-side. Your child never interacts directly with the AI during lessons — all content is pre-generated, reviewed for accuracy, and stored securely. The AI companion chat is Socratic only (asks guiding questions, never gives answers) and has strict safety guardrails.',
            },
            {
              q: 'What ages does Seed work for?',
              a: 'Ages 5 through 13. Lessons are calibrated to developmental attention spans: 10-minute blocks for kindergartners, up to 25-30 minutes for middle schoolers. The content, vocabulary, and complexity all adapt to your child\'s age.',
            },
            {
              q: 'Can I use Seed if we\'re a religious family?',
              a: 'Absolutely. During setup, you choose a content approach: secular, faith-neutral, Christian, Latter-day Saint, Jewish, or custom. This shapes how history, science origins, reading lists, and holidays are framed in lessons. You can set it per child.',
            },
            {
              q: 'What about state homeschool requirements?',
              a: 'Seed auto-tracks attendance hours, subjects covered, and lesson completion. You can generate a one-click compliance report formatted for your state. We currently support the top 11 US states by homeschool population.',
            },
            {
              q: 'Do I need to plan anything?',
              a: 'Nope. Add your child, set a few preferences, and Seed handles the rest. Each morning, a personalized set of lessons is ready. You open the app and go. No prep, no searching for resources, no second-guessing.',
            },
          ].map(({ q, a }) => (
            <details key={q} className="group rounded-xl border border-border bg-surface">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium hover:bg-background rounded-xl transition-colors">
                {q}
                <span className="text-muted group-open:rotate-45 transition-transform text-lg ml-4">+</span>
              </summary>
              <div className="px-5 pb-4 text-sm text-muted leading-relaxed">
                {a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-24 max-w-3xl mx-auto text-center">
        <div className="rounded-2xl bg-sage/5 border border-sage/20 p-10">
          <Sprout className="h-10 w-10 text-sage mx-auto mb-4" />
          <h2 className="font-display text-2xl font-semibold mb-3">
            Ready to try something different?
          </h2>
          <p className="text-muted mb-6 max-w-lg mx-auto">
            Most families set up their first child and start a lesson in under 3 minutes.
            No credit card. No commitment. Just see if Seed feels right for your family.
          </p>
          <Button size="lg" asChild>
            <Link to="/signup">Start for free</Link>
          </Button>
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
