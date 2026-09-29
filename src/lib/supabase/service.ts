import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const missing =
    !url ||
    !serviceKey ||
    url.toLowerCase().includes('placeholder') ||
    serviceKey.toLowerCase().includes('placeholder')

  if (missing) {
    throw new Error(
      '[serviceClient] Missing or placeholder NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
