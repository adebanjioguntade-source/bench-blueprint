import posthog from 'posthog-js'

export type AnalyticsEvent =
  | { name: 'section_started'; properties: { sectionId: string } }
  | { name: 'section_completed'; properties: { sectionId: string } }
  | { name: 'diagnostic_scored'; properties: { total: number; zone: string } }
  | { name: 'report_generated'; properties?: Record<string, any> }

export function initAnalytics() {
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'placeholder-posthog-key-value'
  ) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      autocapture: false, // Disable autocapture to protect user input fields
      capture_pageview: true,
      disable_session_recording: true // Strict rule: No session recording or heatmaps
    })
  }
}

export function trackEvent(event: AnalyticsEvent) {
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY !== 'placeholder-posthog-key-value'
  ) {
    posthog.capture(event.name, event.properties)
  } else {
    console.log(`[Analytics Mock] Event tracked: ${event.name}`, event.properties || '')
  }
}
