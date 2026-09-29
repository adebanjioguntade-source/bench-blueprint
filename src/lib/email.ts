import { Resend } from 'resend'
import { getSiteUrl, isResendConfigured } from '@/lib/env'

function skipReason(): string {
  if (!isResendConfigured()) {
    return 'RESEND_API_KEY is missing or a placeholder'
  }
  return ''
}

/**
 * Transactional diagnostic-result email. Fail-soft: never throws to the caller.
 * Logs a clear skip when the key is unset so production operators are not misled.
 */
export async function sendDiagnosticResultEmail(params: {
  to: string
  total: number
  zone: string
}): Promise<{ sent: boolean }> {
  const reason = skipReason()
  if (reason) {
    const level = process.env.NODE_ENV === 'production' ? 'warn' : 'log'
    console[level](`[email] Skipping diagnostic result email: ${reason}`)
    return { sent: false }
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'The Bench Blueprint <beth.t@example.com>'
  const siteUrl = getSiteUrl()
  const signupUrl = `${siteUrl}/signup?email=${encodeURIComponent(params.to)}`

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Your Bench Diagnostic: ${params.total} / 60`,
      text: [
        `Your Bench Diagnostic score is ${params.total} / 60.`,
        `Zone: ${params.zone}.`,
        '',
        `Create your account to carry this score into the workbook:`,
        signupUrl,
        '',
        'The Bench Blueprint™ · Educational purposes only — not legal, financial, tax, or career advice.',
      ].join('\n'),
    })

    if (error) {
      console.error('[email] Resend rejected diagnostic result email:', error)
      return { sent: false }
    }

    return { sent: true }
  } catch (err) {
    console.error('[email] Failed to send diagnostic result email:', err)
    return { sent: false }
  }
}
