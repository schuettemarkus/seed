import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { COPPA_CONSENT_TEXT } from '@/lib/coppa'
import { Shield } from 'lucide-react'

export function COPPAConsent() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [agreed, setAgreed] = useState(false)
  const [privacyRead, setPrivacyRead] = useState(false)
  const [tosRead, setTosRead] = useState(false)

  function handleContinue() {
    if (!agreed || !privacyRead || !tosRead || !user) return
    // Consent is logged per-child at child creation time
    // This screen just gates the flow so the parent sees the language
    navigate('/onboarding')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-6 w-6 text-sage" />
              <CardTitle>Before we get started</CardTitle>
            </div>
            <p className="text-sm text-muted">
              We need your consent to create learning profiles for your children.
              Here's what that means in plain English.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-background p-4 text-sm text-muted leading-relaxed whitespace-pre-line">
              {COPPA_CONSENT_TEXT}
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyRead}
                  onChange={(e) => setPrivacyRead(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-sage focus:ring-sage"
                />
                <span className="text-sm">
                  I have read the{' '}
                  <Link to="/privacy" target="_blank" className="text-sky hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tosRead}
                  onChange={(e) => setTosRead(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-sage focus:ring-sage"
                />
                <span className="text-sm">
                  I have read the{' '}
                  <Link to="/terms" target="_blank" className="text-sky hover:underline">
                    Terms of Service
                  </Link>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border text-sage focus:ring-sage"
                />
                <span className="text-sm font-medium">
                  I am the parent or legal guardian. I consent to Seed collecting and
                  processing my child's data as described.
                </span>
              </label>
            </div>

            <Button
              className="w-full"
              disabled={!agreed || !privacyRead || !tosRead}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
