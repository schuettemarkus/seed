import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Landing } from '@/pages/Landing'
import { SignUp } from '@/pages/SignUp'
import { SignIn } from '@/pages/SignIn'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { TermsOfService } from '@/pages/TermsOfService'
import { AuthCallback } from '@/pages/AuthCallback'

// Lazy-loaded routes (code-split for performance)
const COPPAConsent = lazy(() => import('@/pages/COPPAConsent').then((m) => ({ default: m.COPPAConsent })))
const ParentOnboarding = lazy(() => import('@/pages/ParentOnboarding').then((m) => ({ default: m.ParentOnboarding })))
const ChildSetup = lazy(() => import('@/pages/ChildSetup').then((m) => ({ default: m.ChildSetup })))
const FamilyHome = lazy(() => import('@/pages/FamilyHome').then((m) => ({ default: m.FamilyHome })))
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))
const ChildToday = lazy(() => import('@/pages/ChildToday').then((m) => ({ default: m.ChildToday })))
const LessonView = lazy(() => import('@/pages/LessonView').then((m) => ({ default: m.LessonView })))
const ParentDashboard = lazy(() => import('@/pages/ParentDashboard').then((m) => ({ default: m.ParentDashboard })))
const WonderWall = lazy(() => import('@/pages/WonderWall').then((m) => ({ default: m.WonderWall })))
const Keepsake = lazy(() => import('@/pages/Keepsake').then((m) => ({ default: m.Keepsake })))
const Rhythm = lazy(() => import('@/pages/Rhythm').then((m) => ({ default: m.Rhythm })))
const Compliance = lazy(() => import('@/pages/Compliance').then((m) => ({ default: m.Compliance })))
const InviteAccept = lazy(() => import('@/pages/InviteAccept').then((m) => ({ default: m.InviteAccept })))
const LessonHistory = lazy(() => import('@/pages/LessonHistory').then((m) => ({ default: m.LessonHistory })))
const Pricing = lazy(() => import('@/pages/Pricing').then((m) => ({ default: m.Pricing })))

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-muted font-display text-lg">Loading...</div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/signin" replace />
  return <>{children}</>
}

export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected — Parent flows */}
          <Route path="/consent" element={<ProtectedRoute><COPPAConsent /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><ParentOnboarding /></ProtectedRoute>} />
          <Route path="/child/new" element={<ProtectedRoute><ChildSetup /></ProtectedRoute>} />
          <Route path="/child/:childId/edit" element={<ProtectedRoute><ChildSetup /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><FamilyHome /></ProtectedRoute>} />
          <Route path="/child/:childId/today" element={<ProtectedRoute><ChildToday /></ProtectedRoute>} />
          <Route path="/child/:childId/dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
          <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
          <Route path="/child/:childId/wonder" element={<ProtectedRoute><WonderWall /></ProtectedRoute>} />
          <Route path="/child/:childId/keepsake" element={<ProtectedRoute><Keepsake /></ProtectedRoute>} />
          <Route path="/rhythm" element={<ProtectedRoute><Rhythm /></ProtectedRoute>} />
          <Route path="/child/:childId/compliance" element={<ProtectedRoute><Compliance /></ProtectedRoute>} />
          <Route path="/child/:childId/history" element={<ProtectedRoute><LessonHistory /></ProtectedRoute>} />
          <Route path="/invite" element={<InviteAccept />} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
