import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Landing } from '@/pages/Landing'
import { SignUp } from '@/pages/SignUp'
import { SignIn } from '@/pages/SignIn'
import { COPPAConsent } from '@/pages/COPPAConsent'
import { ParentOnboarding } from '@/pages/ParentOnboarding'
import { ChildSetup } from '@/pages/ChildSetup'
import { FamilyHome } from '@/pages/FamilyHome'
import { Settings } from '@/pages/Settings'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { TermsOfService } from '@/pages/TermsOfService'
import { ChildToday } from '@/pages/ChildToday'
import { LessonView } from '@/pages/LessonView'
import { ParentDashboard } from '@/pages/ParentDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted font-display text-lg">Loading...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/signin" replace />
  return <>{children}</>
}

export function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Protected — Parent flows */}
      <Route path="/consent" element={<ProtectedRoute><COPPAConsent /></ProtectedRoute>} />
      <Route path="/onboarding" element={<ProtectedRoute><ParentOnboarding /></ProtectedRoute>} />
      <Route path="/child/new" element={<ProtectedRoute><ChildSetup /></ProtectedRoute>} />
      <Route path="/child/:childId/edit" element={<ProtectedRoute><ChildSetup /></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><FamilyHome /></ProtectedRoute>} />
      <Route path="/child/:childId/today" element={<ProtectedRoute><ChildToday /></ProtectedRoute>} />
      <Route path="/child/:childId/dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
      <Route path="/lesson/:lessonId" element={<ProtectedRoute><LessonView /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
