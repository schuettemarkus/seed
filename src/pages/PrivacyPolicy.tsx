import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sprout } from 'lucide-react'

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4 max-w-3xl mx-auto">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-sage" />
          <span className="font-display text-lg font-semibold">Privacy Policy</span>
        </div>
      </header>

      <main className="px-6 py-8 max-w-3xl mx-auto prose prose-sm">
        <p className="text-xs text-terracotta font-medium mb-4">
          DRAFT — This document requires legal review before public use.
        </p>

        <h2 className="font-display text-xl font-semibold mt-6 mb-3">Overview</h2>
        <p className="text-sm text-muted leading-relaxed">
          Seed is a personalized homeschool learning platform for children ages 5-13.
          This Privacy Policy describes how we collect, use, and protect information about
          parents and their children.
        </p>

        <h2 className="font-display text-xl font-semibold mt-6 mb-3">Information We Collect</h2>
        <h3 className="font-medium text-base mt-4 mb-2">Parent Information</h3>
        <ul className="text-sm text-muted space-y-1 list-disc list-inside">
          <li>Email address and name (for account management)</li>
          <li>Timezone (for scheduling)</li>
          <li>Payment information (processed by Stripe; we do not store card numbers)</li>
        </ul>

        <h3 className="font-medium text-base mt-4 mb-2">Child Information</h3>
        <p className="text-sm text-muted mb-2">Collected with verifiable parental consent per COPPA:</p>
        <ul className="text-sm text-muted space-y-1 list-disc list-inside">
          <li>First name, age, gender/pronouns, and language preference</li>
          <li>Learning preferences (subjects, pedagogy, content approach, accommodations)</li>
          <li>Lesson responses, progress data, and mastery state</li>
          <li>Wonder questions asked during lessons</li>
          <li>Voice recordings and drawings (if those features are used)</li>
        </ul>

        <h2 className="font-display text-xl font-semibold mt-6 mb-3">What We Never Do</h2>
        <ul className="text-sm text-muted space-y-1 list-disc list-inside">
          <li>Show behavioral advertising to children</li>
          <li>Sell family data to third parties</li>
          <li>Track child behavior for analytics purposes</li>
          <li>Use child data for non-educational profiling</li>
        </ul>

        <h2 className="font-display text-xl font-semibold mt-6 mb-3">Your Rights</h2>
        <ul className="text-sm text-muted space-y-1 list-disc list-inside">
          <li>Review all data collected about your child at any time</li>
          <li>Export all family data as JSON</li>
          <li>Request deletion of a child's profile and all associated data</li>
          <li>Revoke consent (which will deactivate the child's profile)</li>
        </ul>

        <p className="text-sm text-muted mt-8">
          Version 1.0 · Last updated: [Date to be set before launch]
        </p>
      </main>
    </div>
  )
}
