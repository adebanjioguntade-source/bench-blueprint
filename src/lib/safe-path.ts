const DEFAULT_FALLBACK = '/dashboard'

function fullyDecode(input: string): string {
  let current = input
  for (let i = 0; i < 5; i++) {
    try {
      const next = decodeURIComponent(current)
      if (next === current) break
      current = next
    } catch {
      break
    }
  }
  return current
}

/**
 * Allow only same-origin relative paths (e.g. `/dashboard`, `/workbook/01?return=/workbook/03`).
 * Rejects protocol-relative URLs, absolute URLs, and script schemes.
 */
export function safeInternalPath(
  candidate: string | null | undefined,
  fallback: string = DEFAULT_FALLBACK
): string {
  if (typeof candidate !== 'string') return fallback

  const value = fullyDecode(candidate).trim()
  if (value.length === 0 || value.length > 2048) return fallback
  if (!value.startsWith('/')) return fallback
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback
  if (value.includes('\\') || value.includes('\0') || /[\r\n]/.test(value)) return fallback
  if (value.includes('://')) return fallback

  const lower = value.toLowerCase()
  if (
    lower.includes('javascript:') ||
    lower.includes('data:') ||
    lower.includes('vbscript:')
  ) {
    return fallback
  }

  return value
}
