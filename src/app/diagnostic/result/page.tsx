'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createDiagnosticLead } from '@/app/actions/leads'
import { cn } from '@/lib/utils'
import { trackEvent } from '@/lib/analytics'

export default function DiagnosticResultPage() {
  const [total, setTotal] = useState<number | null>(null)
  const [zone, setZone] = useState<string | null>(null)
  const [priorities, setPriorities] = useState<string[]>([])
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Load diagnostic state from sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTotal = sessionStorage.getItem('bb:diagnostic:total')
      const savedZone = sessionStorage.getItem('bb:diagnostic:zone')
      const savedPriorities = sessionStorage.getItem('bb:diagnostic:priorities')
      const savedEmailSubmitted = sessionStorage.getItem('bb:diagnostic:email_submitted')

      if (savedTotal && savedZone && savedPriorities) {
        setTotal(Number(savedTotal))
        setZone(savedZone)
        setPriorities(JSON.parse(savedPriorities))
      }

      if (savedEmailSubmitted === 'true') {
        setIsSubmitted(true)
        const savedEmail = sessionStorage.getItem('bb:diagnostic:email')
        if (savedEmail) {
          setEmail(savedEmail)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (total === null || !zone) return
    trackEvent({ name: 'diagnostic_scored', properties: { total, zone } })
  }, [total, zone])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    if (total === null || !zone || priorities.length === 0) {
      setErrorMsg('No diagnostic answers found. Please take the diagnostic first.')
      return
    }

    setIsPending(true)
    try {
      const res = await createDiagnosticLead(email, total, zone, priorities)
      if (res.success) {
        setIsSubmitted(true)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('bb:diagnostic:email_submitted', 'true')
          sessionStorage.setItem('bb:diagnostic:email', email)
        }
      } else {
        setErrorMsg(res.error || 'Failed to save progress. Please try again.')
      }
    } catch {
      setErrorMsg('An unexpected error occurred.')
    } finally {
      setIsPending(false)
    }
  }

  // Verbatim copy mapping for diagnostic zones
  const getZoneText = () => {
    if (!zone) return { title: '', guidance: '', colorClass: '' }
    switch (zone.toLowerCase()) {
      case 'reactive':
        return {
          title: 'Reactive',
          guidance: 'Begin with Bench Reset and Bench Audit before spending energy on visibility, networking, or credentials. Sections 01–05 particularly important.',
          colorClass: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
        }
      case 'repositioning':
        return {
          title: 'Repositioning',
          guidance: 'Fundamentals exist but gaps are slowing momentum. Pay particular attention to Sections 03–05.',
          colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        }
      case 'momentum':
        return {
          title: 'Momentum',
          guidance: 'Foundation is strong. Focus on visibility, proof, and opportunity conversion. Sections 06–14 create the greatest leverage.',
          colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
        }
      default:
        return { title: zone, guidance: '', colorClass: '' }
    }
  }

  const zoneInfo = getZoneText()

  if (total === null) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-background">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold font-serif text-foreground">No Diagnostic Data</h1>
          <p className="text-muted-foreground">
            It looks like you haven&apos;t taken the diagnostic yet. Start here to score your readiness.
          </p>
          <Link
            href="/diagnostic"
            className="inline-block px-6 py-2.5 bg-stage-clarify text-white rounded-md font-semibold hover:opacity-90 shadow"
          >
            Start Diagnostic
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 py-12 md:py-20 bg-background flex flex-col justify-center">
      <header className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-wider text-stage-clarify px-2.5 py-1 bg-stage-clarify/10 rounded-full">
          Diagnostic Score
        </span>
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground font-serif mt-4">
          {total} <span className="text-muted-foreground text-3xl sm:text-4xl">/ 60</span>
        </h1>
        <div className={cn("mt-4 p-4 border rounded-md max-w-lg mx-auto text-sm leading-relaxed", zoneInfo.colorClass)}>
          Your current state is <strong className="uppercase">{zoneInfo.title}</strong>.
          <p className="mt-2 font-serif italic text-base">&ldquo;{zoneInfo.guidance}&rdquo;</p>
        </div>
      </header>

      <section className="bg-card border border-border rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
        {!isSubmitted ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground tracking-tight font-serif">
                Unlock Your Diagnostic Priorities
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Save your score and unlock the three lowest areas of your diagnostic to focus on first.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                  {errorMsg}
                </div>
              )}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isPending}
                  className="block w-full px-3 py-2.5 border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-stage-clarify sm:text-sm bg-background text-foreground"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 bg-stage-clarify hover:opacity-95 text-white font-medium rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stage-clarify disabled:opacity-50 transition-opacity"
              >
                {isPending ? 'Unlocking...' : 'Unlock Priority Gaps'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Unlocked
              </span>
              <h2 className="text-xl font-semibold text-foreground font-serif pt-2">
                Your Three Lowest-Scoring Areas
              </h2>
              <p className="text-sm text-muted-foreground">
                These are the three elements of your diagnostic that require your focus first:
              </p>
            </div>

            <ul className="space-y-2 max-w-md mx-auto">
              {priorities.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 bg-muted border border-border rounded-md text-foreground font-medium"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-stage-clarify text-white text-xs font-semibold">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-border space-y-4">
              <div className="text-center">
                <h3 className="text-md font-semibold text-foreground font-serif">
                  Ready to map your path?
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Create your free account using <strong className="text-foreground">{email}</strong> to carry this score into Section 01.
                </p>
              </div>
              <Link
                href={`/signup?email=${encodeURIComponent(email)}`}
                className="w-full flex justify-center py-2.5 px-4 bg-stage-clarify hover:opacity-95 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stage-clarify transition-colors text-center"
              >
                Create Account & Start Reset
              </Link>
            </div>
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-xs text-muted-foreground space-y-2">
        <p>The Bench Blueprint™ · © 2026 Lami Oguntade · All rights reserved.</p>
        <p className="max-w-md mx-auto italic text-[11px]">
          The information in this workbook is for educational purposes only and should not be construed as legal, financial, tax, or career advice.
        </p>
      </footer>
    </main>
  )
}
