import * as Sentry from '@sentry/react'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Scrub PII — no child data in error reports
    beforeSend(event) {
      if (event.user) {
        delete event.user.email
        delete event.user.username
      }
      return event
    },
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
  })
}
