'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState(
    errorParam === 'auth-callback-failed'
      ? 'Authentication failed. Please try again.'
      : ''
  )
  const [successMessage, setSuccessMessage] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isMagicLinkPending, setIsMagicLinkPending] = useState(false)

  const supabase = createClient()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        router.push(next)
        router.refresh()
      }
    })
  }

  const handleMagicLink = async () => {
    setErrorMessage('')
    setSuccessMessage('')

    if (!email) {
      setErrorMessage('Please enter your email to receive a sign-in link.')
      return
    }

    setIsMagicLinkPending(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })

      if (error) {
        setErrorMessage(error.message)
      } else {
        setSuccessMessage('Check your email for a secure link to sign in.')
      }
    } catch {
      setErrorMessage('An unexpected error occurred.')
    } finally {
      setIsMagicLinkPending(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-4xl font-semibold tracking-tight text-foreground font-serif">
          The Bench Blueprint
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Welcome back. Continue your career reinvention.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm border border-border sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handlePasswordLogin}>
            {errorMessage && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-md">
                {successMessage}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending || isMagicLinkPending}
                  className="block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending || isMagicLinkPending}
                  className="block w-full px-3 py-2 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isPending || isMagicLinkPending}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-opacity"
              >
                {isPending ? 'Signing in...' : 'Sign in with Password'}
              </button>

              <button
                type="button"
                onClick={handleMagicLink}
                disabled={isPending || isMagicLinkPending}
                className="w-full flex justify-center py-2 px-4 border border-border rounded-md shadow-sm text-sm font-medium text-foreground bg-transparent hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
              >
                {isMagicLinkPending ? 'Sending link...' : 'Send Magic Link Email'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        The Bench Blueprint™ · © 2026 Lami Oguntade · All rights reserved.
      </footer>
    </main>
  )
}
