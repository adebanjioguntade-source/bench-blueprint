import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSupabasePublicConfigured, getSupabasePublicEnv } from '@/lib/env'
import { safeInternalPath } from '@/lib/safe-path'

export async function updateSession(request: NextRequest) {
  if (!isSupabasePublicConfigured()) {
    console.error(
      '[supabase] Missing or placeholder NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(
        'Application is misconfigured. Missing Supabase environment variables.',
        { status: 503 }
      )
    }
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const path = request.nextUrl.pathname

  const isProtectedPath =
    path === '/dashboard' ||
    path.startsWith('/workbook') ||
    path.startsWith('/report') ||
    path === '/account'

  const isAuthPath = path === '/login' || path === '/signup'

  if (!isSupabasePublicConfigured()) {
    if (isProtectedPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', safeInternalPath(path + request.nextUrl.search))
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const { url: supabaseUrl, anonKey } = getSupabasePublicEnv()

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', safeInternalPath(path + request.nextUrl.search))
    return NextResponse.redirect(url)
  }

  if (isAuthPath && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
