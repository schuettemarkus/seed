import { useParams } from 'react-router-dom'
import { useChild } from '@/hooks/useChild'
import { useAuth } from '@/hooks/useAuth'
import { ProgressHub } from '@/components/parent/ProgressHub'

export function ParentDashboard() {
  const { childId } = useParams()
  const { user } = useAuth()
  const { child } = useChild(childId)

  if (!child) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return <ProgressHub child={child} parentId={user?.id ?? ''} />
}
