import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Sprout, Mail } from 'lucide-react'
import { GoogleIcon } from '@/components/ui/google-icon'

export function SignUp() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error } = await signUp(email, password)
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    // If session exists, email confirmation is disabled — go straight through
    if (data.session) {
      navigate('/consent')
    } else {
      // Email confirmation required — show "check your email"
      setConfirmationSent(true)
    }
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
    // Google OAuth redirects away — no need to navigate
  }

  if (confirmationSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sprout className="h-8 w-8 text-sage" />
            <span className="font-display text-2xl font-semibold">Seed</span>
          </div>
          <Card>
            <CardContent className="text-center py-10">
              <Mail className="h-12 w-12 text-sage mx-auto mb-4" />
              <h2 className="font-display text-xl font-semibold mb-2">Check your email</h2>
              <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
                We sent a confirmation link to <strong>{email}</strong>.
                Click the link in the email to activate your account, then come back here to sign in.
              </p>
              <div className="mt-6">
                <Link to="/signin" className="text-sm text-sky hover:underline">
                  Go to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="h-8 w-8 text-sage" />
          <span className="font-display text-2xl font-semibold">Seed</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start your family's learning journey in under 60 seconds.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              {error && <p className="text-sm text-terracotta">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-2 text-muted">or</span>
              </div>
            </div>

            <Button variant="secondary" className="w-full" onClick={handleGoogle}>
              <GoogleIcon className="h-5 w-5 mr-2" />
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted">
              Already have an account?{' '}
              <Link to="/signin" className="text-sky hover:underline">Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
