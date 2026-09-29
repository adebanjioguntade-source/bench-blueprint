function isUnsetOrPlaceholder(value: string | undefined): boolean {
  if (!value || value.trim() === '') return true
  return value.toLowerCase().includes('placeholder')
}

export function isSupabasePublicConfigured(): boolean {
  return (
    !isUnsetOrPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    !isUnsetOrPlaceholder(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isUnsetOrPlaceholder(url) || isUnsetOrPlaceholder(anonKey)) {
    throw new Error(
      '[supabase] Missing or placeholder NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Set real values in .env.local (see .env.example).'
    )
  }

  return { url: url as string, anonKey: anonKey as string }
}

export function isAnthropicConfigured(): boolean {
  return !isUnsetOrPlaceholder(process.env.ANTHROPIC_API_KEY)
}

export function isResendConfigured(): boolean {
  return !isUnsetOrPlaceholder(process.env.RESEND_API_KEY)
}

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit && explicit.trim() !== '') {
    return explicit.replace(/\/$/, '')
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
