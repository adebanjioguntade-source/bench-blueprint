import { diagnosticTotal, diagnosticZone, lowestThree } from './scoring'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
  console.log(`✓ Passed: ${message}`)
}

// Test cases for totals
const minScores = {
  d_resume: 1, d_linkedin: 1, d_certs: 1, d_network: 1,
  d_fund: 1, d_positioning: 1, d_proof: 1, d_direction: 1,
  d_gaps: 1, d_visibility: 1, d_plan: 1, d_exit: 1
}
const boundaryReactiveScores = {
  d_resume: 2, d_linkedin: 2, d_certs: 2, d_network: 2,
  d_fund: 2, d_positioning: 2, d_proof: 2, d_direction: 2,
  d_gaps: 1, d_visibility: 1, d_plan: 1, d_exit: 1
} // sum: 2 * 8 + 1 * 4 = 20
const boundaryRepositioningScores1 = {
  d_resume: 2, d_linkedin: 2, d_certs: 2, d_network: 2,
  d_fund: 2, d_positioning: 2, d_proof: 2, d_direction: 2,
  d_gaps: 2, d_visibility: 1, d_plan: 1, d_exit: 1
} // sum: 2 * 9 + 1 * 3 = 21
const boundaryRepositioningScores2 = {
  d_resume: 4, d_linkedin: 4, d_certs: 4, d_network: 4,
  d_fund: 4, d_positioning: 4, d_proof: 4, d_direction: 4,
  d_gaps: 2, d_visibility: 2, d_plan: 2, d_exit: 2
} // sum: 4 * 8 + 2 * 4 = 40
const boundaryMomentumScores1 = {
  d_resume: 4, d_linkedin: 4, d_certs: 4, d_network: 4,
  d_fund: 4, d_positioning: 4, d_proof: 4, d_direction: 4,
  d_gaps: 3, d_visibility: 2, d_plan: 2, d_exit: 2
} // sum: 4 * 8 + 3 * 1 + 2 * 3 = 41
const maxScores = {
  d_resume: 5, d_linkedin: 5, d_certs: 5, d_network: 5,
  d_fund: 5, d_positioning: 5, d_proof: 5, d_direction: 5,
  d_gaps: 5, d_visibility: 5, d_plan: 5, d_exit: 5
} // sum: 60

console.log('Running scoring tests...')

try {
  assert(diagnosticTotal(minScores) === 12, 'Min total should be 12')
  assert(diagnosticZone(12) === 'reactive', 'Score 12 is reactive')

  assert(diagnosticTotal(boundaryReactiveScores) === 20, 'Total should be 20')
  assert(diagnosticZone(20) === 'reactive', 'Score 20 is reactive')

  assert(diagnosticTotal(boundaryRepositioningScores1) === 21, 'Total should be 21')
  assert(diagnosticZone(21) === 'repositioning', 'Score 21 is repositioning')

  assert(diagnosticTotal(boundaryRepositioningScores2) === 40, 'Total should be 40')
  assert(diagnosticZone(40) === 'repositioning', 'Score 40 is repositioning')

  assert(diagnosticTotal(boundaryMomentumScores1) === 41, 'Total should be 41')
  assert(diagnosticZone(41) === 'momentum', 'Score 41 is momentum')

  assert(diagnosticTotal(maxScores) === 60, 'Max total should be 60')
  assert(diagnosticZone(60) === 'momentum', 'Score 60 is momentum')

  // Test lowestThree
  const mockItems = {
    d_resume: 5,
    d_linkedin: 2, // score 2, index 1
    d_certs: 5,
    d_network: 3,
    d_fund: 1, // score 1, index 4
    d_positioning: 5,
    d_proof: 5,
    d_direction: 5,
    d_gaps: 2, // score 2, index 8
    d_visibility: 2, // score 2, index 9
    d_plan: 5,
    d_exit: 5
  }
  const lowest = lowestThree(mockItems)
  console.log('Lowest areas found:', lowest)
  assert(lowest[0] === 'Emergency fund in place', 'First lowest should be d_fund (score 1)')
  assert(lowest[1] === 'LinkedIn updated', 'Second lowest should be d_linkedin (score 2, index 1)')
  assert(lowest[2] === 'Gap list current', 'Third lowest should be d_gaps (score 2, index 8 over d_visibility index 9)')

  console.log('All scoring tests passed successfully!')
} catch (e: any) {
  console.error('Test execution failed:', e.message)
  process.exit(1)
}
