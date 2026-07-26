'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function Stage1CheckpointPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [outputs, setOutputs] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchOutputs = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data } = await supabase
          .from('user_outputs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        setOutputs(data)
      } catch (err) {
        console.error('[CheckpointStage1] Fetch outputs failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOutputs()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 bg-background">
        <div className="text-muted-foreground text-sm font-medium animate-pulse">
          Reviewing Stage 1 assets...
        </div>
      </div>
    )
  }

  const getZoneColorClass = (zone: string) => {
    switch (zone?.toLowerCase()) {
      case 'reactive': return 'text-amber-600 bg-amber-500/10 border-amber-500/20'
      case 'repositioning': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
      case 'momentum': return 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20'
      default: return 'text-muted-foreground bg-muted border-border'
    }
  }

  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12 md:py-20 bg-background">
      <header className="text-center mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-stage-clarify px-3 py-1.5 bg-stage-clarify/10 rounded-full">
          Checkpoint &middot; Stage 1 Complete
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground font-serif mt-5">
          Your Clarify Foundations
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          You have completed the first stage of the workbook. Here are the five key strategic assets you have built to guide your next seasons.
        </p>
      </header>

      {/* Grid of Assets */}
      <div className="space-y-6">
        {/* Row 1: Score & Priorities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset 1: Score */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Asset 1 &bull; Bench Readiness Score
              </span>
              <h3 className="text-3xl font-bold text-foreground font-serif mt-2">
                {outputs?.diagnostic_total ?? '--'} <span className="text-sm font-normal text-muted-foreground">/ 60</span>
              </h3>
            </div>
            {outputs?.diagnostic_zone && (
              <span className={cn("inline-block self-start mt-4 px-2.5 py-1 text-xs font-semibold rounded border uppercase tracking-wider", getZoneColorClass(outputs.diagnostic_zone))}>
                {outputs.diagnostic_zone}
              </span>
            )}
          </div>

          {/* Asset 2: Priorities */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Asset 2 &bull; Three Priority Gaps
              </span>
              {outputs?.priority_areas && outputs.priority_areas.length > 0 ? (
                <ol className="list-decimal pl-4 mt-2 space-y-1 text-sm font-medium text-foreground">
                  {outputs.priority_areas.slice(0, 3).map((area: string, i: number) => (
                    <li key={i}>{area}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm italic text-muted-foreground mt-2">No priorities defined.</p>
              )}
            </div>
            <div className="text-right mt-4">
              <Link href="/workbook/00" className="text-xs font-medium text-stage-clarify hover:underline">
                Re-evaluate Diagnostic &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Asset 3: Thesis */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Asset 3 &bull; Bench Thesis
          </span>
          <p className="mt-3 text-base text-foreground font-serif italic leading-relaxed">
            &ldquo;This bench period is an opportunity to {outputs?.bench_thesis || '...'}&rdquo;
          </p>
          <div className="text-right mt-3">
            <Link href="/workbook/01" className="text-xs font-medium text-stage-clarify hover:underline">
              Refine Thesis &rarr;
            </Link>
          </div>
        </div>

        {/* Asset 4: Reset Statement */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Asset 4 &bull; Success Reset sentence
          </span>
          <p className="mt-3 text-base text-foreground font-serif italic leading-relaxed">
            &ldquo;{outputs?.reset_sentence || '...'}&rdquo;
          </p>
          <div className="text-right mt-3">
            <Link href="/workbook/01" className="text-xs font-medium text-stage-clarify hover:underline">
              Refine Reset Statement &rarr;
            </Link>
          </div>
        </div>

        {/* Asset 5: North Star */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm bg-stage-clarify/5 border-stage-clarify/20">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stage-clarify">
            Asset 5 &bull; North Star
          </span>
          <p className="mt-3 text-lg font-serif font-semibold italic text-foreground leading-relaxed">
            &ldquo;{outputs?.north_star || '...'}&rdquo;
          </p>
          <div className="text-right mt-3">
            <Link href="/workbook/02" className="text-xs font-medium text-stage-clarify hover:underline">
              Refine North Star &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <footer className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors text-center sm:text-left"
        >
          Return to Dashboard
        </Link>
        <Link
          href="/workbook/03"
          className="px-8 py-3 bg-stage-position hover:opacity-95 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stage-position transition-colors text-center"
        >
          Proceed to Stage 2: Position (Bench Audit) &rarr;
        </Link>
      </footer>
    </main>
  )
}
