import { Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Sprout } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="text-center max-w-md">
            <Sprout className="h-12 w-12 text-sage mx-auto mb-4" />
            <h1 className="font-display text-2xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-6">
              We hit an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
              className="rounded-lg bg-sage px-6 py-3 text-sm font-medium text-white hover:bg-sage-dark transition-colors"
            >
              Go home
            </button>
            {this.state.error && (
              <p className="text-xs text-muted mt-4 font-mono">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
