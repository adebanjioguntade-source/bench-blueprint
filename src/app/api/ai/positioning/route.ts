import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = createServiceClient()

    // 2. Enforce rate limit (5 request logs in past 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count, error: countError } = await serviceClient
      .from('ai_request_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('requested_at', twentyFourHoursAgo)

    if (countError) {
      console.error('[API AI] Error checking request count:', countError)
    }

    if (count !== null && count >= 5) {
      return NextResponse.json(
        { error: 'You have exceeded your daily limit of 5 AI positioning generations. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    // 3. Parse and validate payload
    const { draft, evidence } = await request.json()

    if (!draft || typeof draft !== 'string' || draft.trim() === '') {
      return NextResponse.json(
        { error: 'Complete the exercise above first. A draft statement is required.' },
        { status: 400 }
      )
    }

    const hasEvidence = Array.isArray(evidence) && evidence.some(
      (ev: any) =>
        ev.delivered &&
        ev.delivered.trim() !== '' &&
        ev.impact &&
        ev.impact.trim() !== ''
    )

    if (!hasEvidence) {
      return NextResponse.json(
        { error: 'Complete the exercise above first. At least one proof point with completed delivery and impact details is required.' },
        { status: 400 }
      )
    }

    // 4. Run Anthropic invocation or dev fallback
    let resultJson: { specific: string; broader: string; bolder: string }

    const apiKey = process.env.ANTHROPIC_API_KEY
    const isPlaceholderKey = !apiKey || apiKey.toLowerCase().includes('placeholder')

    if (isPlaceholderKey) {
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Positioning assist is not configured. Set ANTHROPIC_API_KEY on the server.' },
          { status: 503 }
        )
      }

      console.log('[API AI] Dev fallback: mock suggestions (ANTHROPIC_API_KEY missing or placeholder).')
      resultJson = {
        specific: `${draft.trim()} specifically focusing on operational systems tuning and performance validation.`,
        broader: `A senior strategist partnering with leadership teams to design sustainable growth roadmaps through engineering excellence.`,
        bolder: `The go-to troubleshooter hired to fix broken organizational engines and accelerate product delivery under pressure.`
      }
    } else {
      const anthropic = new Anthropic({ apiKey })

      const promptText = `
Given the following draft positioning statement and proof points (achievements), write three distinct positioning statement revisions:
1. "Specific": Focuses tightly on the immediate target sector and outcomes.
2. "Broader": Focuses on the wider strategic context and scaling up.
3. "Bolder": Emphasizes high-impact leadership and transformational capabilities.

Respond ONLY with a JSON object. Do not include markdown code block formatting like \`\`\`json. Output must be exactly in this format:
{
  "specific": "...",
  "broader": "...",
  "bolder": "..."
}

Draft Statement:
"${draft}"

Proof Points:
${evidence
  .filter((ev: any) => ev.delivered && ev.impact)
  .map((ev: any, idx: number) => `${idx + 1}. Delivered: "${ev.delivered}" &rarr; Impact: "${ev.impact}"`)
  .join('\n')}
`

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1000,
        temperature: 0.7,
        system: 'You are an expert career consultant, copywriter, and professional brand architect.',
        messages: [
          { role: 'user', content: promptText }
        ]
      })

      // Extract content
      const contentText = message.content[0].type === 'text' ? message.content[0].text : ''
      try {
        resultJson = JSON.parse(contentText.trim())
      } catch (parseErr) {
        console.error('[API AI] Parsing Claude response failed. Raw response:', contentText)
        return NextResponse.json(
          { error: 'AI output format could not be verified. Please try again.' },
          { status: 500 }
        )
      }
    }

    // 5. Log request to prevent abuse (using service client to bypass client restrictions)
    const { error: logError } = await serviceClient
      .from('ai_request_logs')
      .insert({ user_id: user.id })

    if (logError) {
      console.error('[API AI] Failed to log AI request:', logError)
    }

    return NextResponse.json(resultJson)
  } catch (err: any) {
    console.error('[API AI] Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during positioning assistance.' },
      { status: 500 }
    )
  }
}
