import posthog from 'posthog-js'

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return

  posthog.init(key, {
    api_host: 'https://us.i.posthog.com',
    // Privacy-respecting: no autocapture, no session recording
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    persistence: 'localStorage',
  })
}

// Parent-only event tracking — never track child behavior
export function trackParentEvent(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties)
}
