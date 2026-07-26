'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SECTIONS } from '@/lib/sections/definitions'
import { diagnosticTotal, diagnosticZone, lowestThree } from '@/lib/scoring'
import { cn } from '@/lib/utils'

export default function DiagnosticPage() {
  const router = useRouter()
  const section00 = SECTIONS.find((s) => s.id === '00')!

  // Default all 12 scale fields to null (unanswered) or 3 (workbook default)
  // Let's start as unanswered so we can guide the user to fill them
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [ariaMessage, setAriaMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fields = section00.fields.filter((f) => f.type === 'scale_1_5')

  // Set initial answers in sessionStorage if they exist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('bb:diagnostic:answers')
      if (saved) {
        try {
          setAnswers(JSON.parse(saved))
        } catch {
          // ignore
        }
      }
    }
  }, [])

  const handleScoreChange = (fieldId: string, score: number, label: string) => {
    const nextAnswers = { ...answers, [fieldId]: score }
    setAnswers(nextAnswers)
    sessionStorage.setItem('bb:diagnostic:answers', JSON.stringify(nextAnswers))

    // Announce to screen readers
    setAriaMessage(`Selected ${score} for ${label}`)
    setErrorMsg('')
  }

  const answeredCount = fields.filter((f) => answers[f.id] !== undefined).length
  const progressPercent = Math.round((answeredCount / fields.length) * 100)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that all questions are answered
    const unanswered = fields.filter((f) => answers[f.id] === undefined)
    if (unanswered.length > 0) {
      setErrorMsg(`Please answer all questions before proceeding. (${unanswered.length} remaining)`)
      // Scroll to the first unanswered item
      const firstUnansweredId = unanswered[0].id
      document.getElementById(`field-${firstUnansweredId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Calculate outcomes
    const total = diagnosticTotal(answers)
    const zone = diagnosticZone(total)
    const priorities = lowestThree(answers)

    // Save final stats in sessionStorage for results page
    sessionStorage.setItem('bb:diagnostic:total', total.toString())
    sessionStorage.setItem('bb:diagnostic:zone', zone)
    sessionStorage.setItem('bb:diagnostic:priorities', JSON.stringify(priorities))

    // Redirect to result page
    router.push('/diagnostic/result')
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-8 md:py-16 bg-background">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite">
        {ariaMessage}
      </div>

      <header className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-stage-clarify px-2.5 py-1 bg-stage-clarify/10 rounded-full">
          Stage 1 · Clarify · {section00.estimatedMinutes} min
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-serif mt-4">
          {section00.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {section00.instructionText}
        </p>
      </header>

      {/* Progress Tracker */}
      <div className="mb-8 bg-card border border-border rounded-lg p-4 sticky top-4 z-10 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="flex justify-between text-sm font-medium mb-2">
          <span className="text-foreground">Progress</span>
          <span className="text-muted-foreground">{answeredCount} of {fields.length} answered</span>
        </div>
        <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-stage-clarify h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {fields.map((field, idx) => {
            const isAnswered = answers[field.id] !== undefined
            const currentScore = answers[field.id]

            return (
              <article
                key={field.id}
                id={`field-${field.id}`}
                className={cn(
                  "p-5 sm:p-6 border rounded-lg bg-card transition-all duration-200 shadow-sm scroll-mt-24",
                  isAnswered ? 'border-border' : 'border-amber-500/30 ring-1 ring-amber-500/10'
                )}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Question {idx + 1} of {fields.length}
                    </span>
                    <h2 className="text-lg font-semibold text-foreground tracking-tight">
                      {field.label}
                    </h2>
                    {field.helperText && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {field.helperText}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 self-start md:self-center" role="radiogroup" aria-label={field.label}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleScoreChange(field.id, num, field.label)}
                        aria-checked={currentScore === num}
                        role="radio"
                        className={cn(
                          "w-11 h-11 rounded-md border text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stage-clarify",
                          currentScore === num
                            ? "bg-stage-clarify text-white border-stage-clarify"
                            : "bg-background text-foreground border-border hover:bg-muted"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {errorMsg && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium rounded-md text-center">
            {errorMsg}
          </div>
        )}

        <div className="pt-6 flex justify-center">
          <button
            type="submit"
            className="px-8 py-3 bg-stage-clarify hover:bg-stage-clarify/90 text-white font-medium rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stage-clarify transition-colors text-lg"
          >
            Calculate Score & View Results
          </button>
        </div>
      </form>

      <footer className="mt-16 text-center text-xs text-muted-foreground space-y-2 border-t border-border pt-6">
        <p>The Bench Blueprint™ · © 2026 Lami Oguntade · All rights reserved.</p>
        <p className="max-w-md mx-auto italic text-[11px]">
          The information in this workbook is for educational purposes only and should not be construed as legal, financial, tax, or career advice.
        </p>
      </footer>
    </main>
  )
}
