import { safeInternalPath } from './safe-path'

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
  console.log(`✓ Passed: ${message}`)
}

console.log('Running safeInternalPath tests...')

try {
  assert(safeInternalPath('/dashboard') === '/dashboard', 'accepts /dashboard')
  assert(
    safeInternalPath('/workbook/01?return=/workbook/03') ===
      '/workbook/01?return=/workbook/03',
    'accepts relative path with query'
  )
  assert(safeInternalPath('/diagnostic') === '/diagnostic', 'accepts /diagnostic')
  assert(safeInternalPath(null) === '/dashboard', 'null falls back')
  assert(safeInternalPath(undefined) === '/dashboard', 'undefined falls back')
  assert(safeInternalPath('') === '/dashboard', 'empty falls back')
  assert(safeInternalPath('https://evil.com') === '/dashboard', 'rejects absolute https')
  assert(safeInternalPath('http://evil.com') === '/dashboard', 'rejects absolute http')
  assert(safeInternalPath('//evil.com') === '/dashboard', 'rejects protocol-relative')
  assert(safeInternalPath('/\\evil.com') === '/dashboard', 'rejects slash-backslash')
  assert(safeInternalPath('\\evil.com') === '/dashboard', 'rejects backslash path')
  assert(
    safeInternalPath('javascript:alert(1)') === '/dashboard',
    'rejects javascript: scheme'
  )
  assert(
    safeInternalPath('/javascript:alert(1)') === '/dashboard',
    'rejects javascript: in path'
  )
  assert(safeInternalPath('/foo://bar') === '/dashboard', 'rejects embedded ://')
  assert(
    safeInternalPath('/%2F%2Fevil.com') === '/dashboard',
    'rejects encoded protocol-relative'
  )
  assert(
    safeInternalPath('/%252f%252fevil.com') === '/dashboard',
    'rejects double-encoded protocol-relative'
  )
  assert(
    safeInternalPath('/login?next=/dashboard', '/signup') === '/login?next=/dashboard',
    'accepts login with query'
  )
  assert(
    safeInternalPath('https://evil.com', '/workbook/00') === '/workbook/00',
    'uses custom fallback'
  )

  console.log('All safeInternalPath tests passed successfully!')
} catch (e: unknown) {
  const message = e instanceof Error ? e.message : String(e)
  console.error('Test execution failed:', message)
  process.exit(1)
}
