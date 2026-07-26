'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateEntrySection } from '@/app/actions/profile'
import { cn } from '@/lib/utils'

const ALL_SECTIONS = [
  { id: '00', title: 'The Bench Diagnostic', stage: 'Clarify', isMvp: true },
  { id: '01', title: 'Bench Reset', stage: 'Clarify', isMvp: true },
  { id: '02', title: 'Designing What\'s Next', stage: 'Clarify', isMvp: true },
  { id: '03', title: 'Bench Audit', stage: 'Position', isMvp: true },
  { id: '04', title: 'The Gap List', stage: 'Position', isMvp: false },
  { id: '05', title: 'Professional Positioning', stage: 'Position', isMvp: true },
  { id: '06', title: 'Personal Brand Blueprint', stage: 'Position', isMvp: false },
  { id: '07', title: 'The Visibility Plan', stage: 'Position', isMvp: false },
  { id: '08', title: 'Today in Transition', stage: 'Position', isMvp: false },
  { id: '09', title: 'Relationship Capital Inventory', stage: 'Execute', isMvp: false },
  { id: '10', title: '30 / 60 / 90 Bench Plan', stage: 'Execute', isMvp: true },
  { id: '11', title: 'Financial Runway', stage: 'Execute', isMvp: false },
  { id: '12', title: 'Weekly Alignment Patterns', stage: 'Execute', isMvp: false },
  { id: '13', title: 'The Opportunities Funnel', stage: 'Execute', isMvp: false },
  { id: '14', title: 'Conversion and Close', stage: 'Execute', isMvp: false },
  { id: '15', title: 'Reinvention Review', stage: 'Review & Reinvent', isMvp: true }
]

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [outputs, setOutputs] = useState<any>(null)
  const [entries, setEntries] = useState<Record<string, any>>({})
  const [letterOpen, setLetterOpen] = useState(false)
  const [letterContent, setLetterContent] = useState('')

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Fetch Profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(prof)

        // Fetch Outputs
        const { data: out } = await supabase
          .from('user_outputs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        setOutputs(out)

        // Fetch Section Entries
        const { data: ents } = await supabase
          .from('section_entries')
          .select('section_id, status, data')
          .eq('user_id', user.id)

        const entriesMap: Record<string, any> = {}
        if (ents) {
          ents.forEach((e) => {
            entriesMap[e.section_id] = e
          })
        }
        setEntries(entriesMap)

        // Extract Section 15 letter if written
        const s15Data = entriesMap['15']?.data
        if (s15Data?.v_letter) {
          setLetterContent(s15Data.v_letter)
        }
      } catch (err) {
        console.error('[Dashboard] Fetch data failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router, supabase])

  const handleEntrySectionChange = async (sectionId: string) => {
    const res = await updateEntrySection(sectionId)
    if (res.success) {
      setProfile((prev: any) => ({ ...prev, entry_section: sectionId }))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 bg-background">
        <div className="text-muted-foreground text-sm font-medium animate-pulse">
          Opening dashboard...
        </div>
      </div>
    )
  }

  // Format date last worked
  const lastWorkedStr = profile?.last_worked_at
    ? new Date(profile.last_worked_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never'

  const activeMvpSections = ALL_SECTIONS.filter((s) => s.isMvp)

  return (
    <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 bg-background space-y-8">
      {/* Top Header Card */}
      <header className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-foreground tracking-tight">
            Hi, {profile?.display_name || 'Friend'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last worked: <strong className="text-foreground">{lastWorkedStr}</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/report"
            className="px-4 py-2 border border-border text-sm font-semibold rounded-md hover:bg-muted text-foreground transition-colors"
          >
            Generated Report
          </Link>
          <Link
            href="/account"
            className="px-4 py-2 border border-border text-sm font-semibold rounded-md hover:bg-muted text-foreground transition-colors"
          >
            Account Settings
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-destructive transition-colors"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Checklist (Main content) */}
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground font-serif border-b border-border pb-3 mb-4">
              Your Workbook Checklist
            </h2>
            <div className="space-y-3.5">
              {ALL_SECTIONS.map((section) => {
                const entry = entries[section.id]
                const status = entry?.status || 'not_started'

                return (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border text-sm transition-all",
                      section.isMvp
                        ? "bg-muted/30 border-border hover:bg-muted/65"
                        : "bg-muted/10 border-dashed border-border/60 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      {section.isMvp ? (
                        status === 'complete' ? (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px]" title="Complete">
                            ✓
                          </span>
                        ) : status === 'in_progress' ? (
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px]" title="In Progress">
                            &bull;
                          </span>
                        ) : (
                          <span className="w-5 h-5 rounded-full border border-muted-foreground/50 block" title="Not Started" />
                        )
                      ) : (
                        <span className="text-xs">🔒</span>
                      )}

                      <div>
                        <span className="font-mono text-xs font-semibold text-muted-foreground mr-2">
                          {section.id}
                        </span>
                        {section.isMvp ? (
                          <Link href={`/workbook/${section.id}`} className="font-medium text-foreground hover:underline">
                            {section.title}
                          </Link>
                        ) : (
                          <span className="font-medium text-muted-foreground">{section.title}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      {section.isMvp ? (
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded",
                          status === 'complete' && "text-emerald-700 bg-emerald-500/10",
                          status === 'in_progress' && "text-amber-700 bg-amber-500/10",
                          status === 'not_started' && "text-muted-foreground bg-muted"
                        )}>
                          {status.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Full Sequence
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Right column: Widgets & Letter */}
        <section className="space-y-6">
          {/* Pick Up Selector Card */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Session Settings
            </h3>
            <div className="space-y-2">
              <label htmlFor="pickUp" className="block text-xs font-semibold text-foreground">
                I am picking up at section:
              </label>
              <select
                id="pickUp"
                value={profile?.entry_section || ''}
                onChange={(e) => handleEntrySectionChange(e.target.value)}
                className="block w-full px-3 py-2 border border-border rounded-md shadow-sm text-xs bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose target --</option>
                {activeMvpSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.id} - {s.title}
                  </option>
                ))}
              </select>
            </div>
            {profile?.entry_section && (
              <Link
                href={`/workbook/${profile.entry_section}`}
                className="block w-full text-center py-2 bg-primary text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity"
              >
                Resume Section {profile.entry_section}
              </Link>
            )}
          </div>

          {/* Diagnostic score details */}
          {outputs?.diagnostic_total !== undefined && (
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Ready Status
              </span>
              <h4 className="text-4xl font-bold font-serif text-foreground">
                {outputs.diagnostic_total ?? '--'} <span className="text-sm font-normal text-muted-foreground">/ 60</span>
              </h4>
              {outputs.diagnostic_zone && (
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stage-clarify/10 text-stage-clarify rounded border border-stage-clarify/20">
                  {outputs.diagnostic_zone}
                </span>
              )}
            </div>
          )}

          {/* Section 15 Letter Widget */}
          {letterContent && (
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">✉️</span>
                <div>
                  <h4 className="text-sm font-bold text-foreground font-serif">
                    Letter to your future self
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Written in Section 15
                  </p>
                </div>
              </div>
              
              {!letterOpen ? (
                <button
                  onClick={() => setLetterOpen(true)}
                  className="w-full text-center py-2 border border-border rounded text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Open & Read Letter
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded font-serif italic text-sm text-foreground max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    &ldquo;{letterContent}&rdquo;
                  </div>
                  <button
                    onClick={() => setLetterOpen(false)}
                    className="w-full text-center py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close Letter
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

      </div>
      <footer className="text-center text-xs text-muted-foreground pt-6 border-t border-border">
        The Bench Blueprint™ · © 2026 Lami Oguntade · All rights reserved.
      </footer>
    </main>
  )
}
