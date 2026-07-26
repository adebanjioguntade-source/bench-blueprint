export const DIAGNOSTIC_LABELS: Record<string, string> = {
  d_resume: 'Resume current',
  d_linkedin: 'LinkedIn updated',
  d_certs: 'Certifications current',
  d_network: 'Network active',
  d_fund: 'Emergency fund in place',
  d_positioning: 'Positioning clear',
  d_proof: 'Proof visible',
  d_direction: 'Career direction defined',
  d_gaps: 'Gap list current',
  d_visibility: 'Content or visibility habit',
  d_plan: 'Transition plan in place',
  d_exit: 'Exit criteria defined'
}

export const DIAGNOSTIC_KEYS = Object.keys(DIAGNOSTIC_LABELS)

export function diagnosticTotal(items: Record<string, number>): number {
  return DIAGNOSTIC_KEYS.reduce((sum, key) => {
    const val = items[key]
    const score = typeof val === 'number' ? val : 3 // default to 3 if unset
    return sum + Math.max(1, Math.min(5, score)) // restrict to 1-5
  }, 0)
}

export function diagnosticZone(total: number): 'reactive' | 'repositioning' | 'momentum' {
  if (total <= 20) return 'reactive'
  if (total <= 40) return 'repositioning'
  return 'momentum'
}

export function lowestThree(items: Record<string, number>): string[] {
  // Map keys with score and index for tie-breaking
  const scored = DIAGNOSTIC_KEYS.map((key, index) => ({
    label: DIAGNOSTIC_LABELS[key],
    score: typeof items[key] === 'number' ? items[key] : 3,
    index
  }))

  // Sort: lowest score first, then earliest index first
  scored.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score
    }
    return a.index - b.index
  })

  // Return the labels of the lowest 3
  return scored.slice(0, 3).map((item) => item.label)
}
