'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SECTIONS } from '@/lib/sections/definitions'
import { createClient } from '@/lib/supabase/client'
import SectionRenderer from '@/components/workbook/SectionRenderer'
import BridgePanel from '@/components/workbook/BridgePanel'
import { useAutosave } from '@/hooks/useAutosave'
import { cn } from '@/lib/utils'

export default function WorkbookSectionPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionId = params.sectionId as string
  const returnUrl = searchParams.get('return')

  const section = SECTIONS.find((s) => s.id === sectionId)

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({})
  const [status, setStatus] = useState<'not_started' | 'in_progress' | 'complete'>('not_started')
  const [userOutputs, setUserOutputs] = useState<any>({})
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()
  const [isPending, startTransition] = useTransition()

  // Fetch section data and carried context
  useEffect(() => {
    if (!section) return

    const fetchData = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (!currentUser) {
          router.push('/login')
          return
        }
        setUser(currentUser)

        // 1. Fetch saved section entry
        const { data: entry } = await supabase
          .from('section_entries')
          .select('data, status')
          .eq('user_id', currentUser.id)
          .eq('section_id', sectionId)
          .maybeSingle()

        if (entry) {
          setData(entry.data || {})
          setStatus(entry.status || 'not_started')
        } else {
          // Initialize defaults
          const defaults: any = {}
          section.fields.forEach((f) => {
            if (f.defaultValue !== undefined) {
              defaults[f.id] = f.defaultValue
            }
          })
          setData(defaults)
        }

        // 2. Fetch carried context outputs
        const { data: outputs } = await supabase
          .from('user_outputs')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle()

        if (outputs) {
          setUserOutputs(outputs)
        }
      } catch (err) {
        console.error('[WorkbookSection] Fetch data failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sectionId, section, router, supabase])

  // Hook up autosave logic
  const { saveStatus, saveImmediately } = useAutosave(
    sectionId,
    data,
    status === 'complete' ? 'complete' : 'in_progress'
  )

  if (!section) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-background">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold font-serif text-foreground">Section Not Found</h1>
          <p className="text-muted-foreground">The workbook section you are looking for does not exist.</p>
          <Link href="/dashboard" className="inline-block px-6 py-2.5 bg-primary text-white rounded-md hover:opacity-90">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 bg-background">
        <div className="text-muted-foreground text-sm font-medium animate-pulse">
          Loading workbook section...
        </div>
      </div>
    )
  }

  const handleFormChange = (newData: any) => {
    setData(newData)
    if (status === 'not_started') {
      setStatus('in_progress')
    }
  }

  const handleComplete = async () => {
    saveImmediately()
    startTransition(async () => {
      try {
        // Mark complete in database via direct save
        const completedAt = new Date().toISOString()
        const { error } = await supabase.from('section_entries').upsert({
          user_id: user.id,
          section_id: sectionId,
          data,
          status: 'complete',
          completed_at: completedAt,
          updated_at: completedAt
        }, { onConflict: 'user_id,section_id' })

        if (error) throw error

        // Update local status
        setStatus('complete')

        // Sync outputs
        const { saveSectionEntry } = await import('@/app/actions/workbook')
        await saveSectionEntry(sectionId, data, 'complete')

        // Handle routing
        if (returnUrl) {
          router.push(returnUrl)
        } else if (sectionId === '02') {
          // Special checkpoint interstitial after Stage 1 Clarify (S00, S01, S02)
          router.push('/workbook/checkpoint/stage-1')
        } else {
          // Route to dashboard or next section
          const order = ['00', '01', '02', '03', '05', '10', '15']
          const currentIndex = order.indexOf(sectionId)
          if (currentIndex !== -1 && currentIndex < order.length - 1) {
            router.push(`/workbook/${order[currentIndex + 1]}`)
          } else {
            router.push('/dashboard')
          }
        }
      } catch (err) {
        console.error('[WorkbookSection] Failed to complete section:', err)
      }
    })
  }

  // Get active stage styles
  const getStageHeaderColor = () => {
    switch (section.stage) {
      case 'Clarify': return 'text-stage-clarify bg-stage-clarify/10'
      case 'Position': return 'text-stage-position bg-stage-position/10'
      case 'Execute': return 'text-stage-execute bg-stage-execute/10'
      case 'Review & Reinvent': return 'text-stage-review bg-stage-review/10'
      default: return 'text-primary bg-primary/10'
    }
  }

  const getStageBtnColor = () => {
    switch (section.stage) {
      case 'Clarify': return 'bg-stage-clarify hover:opacity-90'
      case 'Position': return 'bg-stage-position hover:opacity-90'
      case 'Execute': return 'bg-stage-execute hover:opacity-90'
      case 'Review & Reinvent': return 'bg-stage-review hover:opacity-90'
      default: return 'bg-primary hover:opacity-90'
    }
  }

  // Section 15 operates in a different, quiet register
  const isSection15 = sectionId === '15'

  return (
    <main className={cn("flex-1 bg-background pb-24", isSection15 ? "max-w-4xl mx-auto px-6 py-12 sm:py-20" : "max-w-3xl mx-auto px-4 py-8 md:py-16")}>
      
      {/* Header Info */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={cn("text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full", getStageHeaderColor())}>
              Stage &middot; {section.stage}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {section.workbookPages} &bull; {section.estimatedMinutes} min
            </span>
          </div>

          {/* Autosave Status Indicator */}
          {!isSection15 && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded border border-border">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                saveStatus === 'saving' && "bg-amber-500 animate-pulse",
                saveStatus === 'saved' && "bg-emerald-500",
                saveStatus === 'failed' && "bg-destructive",
                saveStatus === 'idle' && "bg-muted-foreground/45"
              )} />
              <span className="capitalize font-mono">
                {saveStatus === 'saving' && 'saving...'}
                {saveStatus === 'saved' && 'saved'}
                {saveStatus === 'failed' && 'save failed'}
                {saveStatus === 'idle' && status}
              </span>
            </div>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-serif mt-4">
          Section {section.id} &mdash; {section.title}
        </h1>
        {section.instructionText && (
          <p className="mt-3 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {section.instructionText}
          </p>
        )}
      </header>

      {/* Bench Note Story Panel */}
      {section.benchNote && (
        <section className="mb-8 pl-5 border-l-4 border-amber-500/50 bg-amber-500/5 py-4 pr-4 rounded-r-md">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500 font-sans mb-1.5">
            Bench Note
          </h4>
          <blockquote className="font-serif italic text-base leading-relaxed text-foreground/90">
            &ldquo;{section.benchNote}&rdquo;
          </blockquote>
        </section>
      )}

      {/* Bridge Context Panel */}
      {section.carries && section.carries.length > 0 && (
        <BridgePanel
          carries={section.carries}
          outputs={userOutputs}
          currentSectionId={sectionId}
          isSticky={sectionId === '03'} // Section 03 keeps North Star pinned on scroll
          stage={section.stage}
        />
      )}

      {/* Questionnaire Form */}
      <section className="space-y-6">
        <SectionRenderer
          section={section}
          data={data}
          onChange={handleFormChange}
          userOutputs={userOutputs}
        />
      </section>

      {/* Navigation Footer */}
      <footer className="mt-12 pt-6 border-t border-border flex items-center justify-between gap-4">
        <Link
          href={returnUrl || "/dashboard"}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; {returnUrl ? 'Cancel and Return' : 'Back to Dashboard'}
        </Link>
        <button
          onClick={handleComplete}
          disabled={isPending}
          className={cn(
            "px-6 py-2.5 text-white font-semibold rounded-md shadow transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2",
            getStageBtnColor(),
            isPending && "opacity-50"
          )}
        >
          {isPending ? 'Saving...' : returnUrl ? 'Apply & Return' : 'Complete and Continue &rarr;'}
        </button>
      </footer>
    </main>
  )
}
