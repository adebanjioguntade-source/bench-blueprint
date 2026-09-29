import posthog from 'posthog-js'

export type AnalyticsEvent =
  | { name: 'section_started'; properties: { sectionId: string } }
  | { name: 'section_completed'; properties: { sectionId: string } }
  | { name: 'diagnostic_scored'; properties: { total: number; zone: string } }
  | { name: 'report_generated'; properties?: Record<string, never> }

function isPosthogConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  return Boolean(key && !key.toLowerCase().includes('placeholder'))
}

export function initAnalytics() {
  if (typeof window === 'undefined' || !isPosthogConfigured()) {
    return
  }

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
  })
}

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') {
    return
  }

  if (isPosthogConfigured()) {
    posthog.capture(event.name, event.properties)
    return
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] skipped (no PostHog key): ${event.name}`)
  }
}
