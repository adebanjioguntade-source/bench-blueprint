'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const REPORT_ROWS = [
  { id: '00', title: 'Bench Readiness Score', carryKey: 'diagnostic_total', isMvp: true },
  { id: '01', title: 'Bench Thesis', carryKey: 'bench_thesis', isMvp: true },
  { id: '02', title: 'North Star', carryKey: 'north_star', isMvp: true },
  { id: '03', title: 'The Strength Map', carryKey: 'top_3_areas', isMvp: true },
  { id: '04', title: 'The Gap List', isMvp: false },
  { id: '05', title: 'Positioning Statement', carryKey: 'positioning_final', isMvp: true },
  { id: '06', title: 'Personal Brand Blueprint', isMvp: false },
  { id: '07', title: 'The Visibility Plan', isMvp: false },
  { id: '08', title: 'Today in Transition', isMvp: false },
  { id: '09', title: 'Relationship Capital Inventory', isMvp: false },
  { id: '10', title: '30/60/90 Bench Plan', carryKey: 'first_action', isMvp: true },
  { id: '11', title: 'Financial Runway', isMvp: false },
  { id: '12', title: 'Weekly Alignment Patterns', isMvp: false },
  { id: '13', title: 'The Opportunities Funnel', isMvp: false },
  { id: '14', title: 'Conversion and Close', isMvp: false },
  { id: '15', title: 'Reinvention Review', carryKey: 'letter_written_at', isMvp: true }
]

export default function ReportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [outputs, setOutputs] = useState<any>(null)
  const [entries, setEntries] = useState<Record<string, any>>({})
  const supabase = createClient()

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: outs } = await supabase
          .from('user_outputs')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        setOutputs(outs)

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
      } catch (err) {
        console.error('[Report] Fetch report data failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center py-12 bg-background">
        <div className="text-muted-foreground text-sm font-medium animate-pulse">
          Generating your report...
        </div>
      </div>
    )
  }

  // Check which sections are incomplete
  const mvpSectionIds = ['00', '01', '02', '03', '05', '10', '15']
  const incompleteSections = mvpSectionIds.filter(
    (id) => !entries[id] || entries[id].status !== 'complete'
  )
  const isReportFullyLocked = incompleteSections.length > 0

  return (
    <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-16 bg-background space-y-8">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-border pb-6 gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-stage-clarify px-2.5 py-1 bg-stage-clarify/10 rounded-full">
            Durable Artifact
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-foreground font-serif mt-3">
            What You Now Have
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Workbook Page 74 &mdash; Durable output inventory.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-border text-sm font-semibold rounded-md hover:bg-muted text-foreground transition-colors"
          >
            Dashboard
          </Link>
          {!isReportFullyLocked && (
            <Link
              href="/report/print"
              target="_blank"
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:opacity-90 transition-opacity"
            >
              Print / Save PDF
            </Link>
          )}
        </div>
      </header>

      {/* Partial preview info block */}
      {isReportFullyLocked && (
        <div className="p-5 border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-300 rounded-lg text-sm space-y-3">
          <h4 className="font-bold font-serif text-base">⚠️ Complete Remaining Sections to Unlock Full Report</h4>
          <p>
            You are viewing a partial preview. To unlock the printable PDF format and fill all rows, please complete the following sections:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {incompleteSections.map((id) => {
              const secName = REPORT_ROWS.find((row) => row.id === id)?.title || `Section ${id}`
              return (
                <Link
                  key={id}
                  href={`/workbook/${id}`}
                  className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-xs font-semibold rounded hover:bg-amber-500/20 transition-all text-amber-700 dark:text-amber-400"
                >
                  Section {id} - {secName}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Checklist Rows Grid */}
      <div className="space-y-4">
        {REPORT_ROWS.map((row) => {
          const isComplete = entries[row.id]?.status === 'complete'
          const rowData = entries[row.id]?.data

          if (row.isMvp) {
            return (
              <article
                key={row.id}
                className={cn(
                  "p-5 sm:p-6 border rounded-lg bg-card shadow-sm space-y-3 transition-colors",
                  isComplete ? 'border-border' : 'border-dashed border-border/70 bg-card/40 opacity-75'
                )}
              >
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-muted-foreground mr-1">
                      {row.id}
                    </span>
                    <h3 className="text-base font-semibold text-foreground inline-block">
                      {row.title}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded",
                      isComplete ? "text-emerald-700 bg-emerald-500/10" : "text-muted-foreground bg-muted"
                    )}
                  >
                    {isComplete ? 'Completed' : 'Draft / Empty'}
                  </span>
                </div>

                <div className="text-sm text-foreground/90 font-serif leading-relaxed italic">
                  {isComplete ? (
                    // Render details depending on row ID
                    row.id === '00' ? (
                      <p className="not-italic font-sans text-xs text-muted-foreground">
                        Diagnostic Score: <strong className="text-foreground text-sm">{outputs?.diagnostic_total} / 60</strong> &middot; Zone: <strong className="text-foreground text-sm uppercase">{outputs?.diagnostic_zone}</strong>
                      </p>
                    ) : row.id === '03' ? (
                      <div className="not-italic font-sans space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground block uppercase">Top 3 Priorities:</span>
                          <ol className="list-decimal pl-4 text-xs font-medium space-y-0.5 mt-1 text-foreground">
                            {outputs?.top_3_areas?.map((a: string, i: number) => (
                              <li key={i}>{a}</li>
                            ))}
                          </ol>
                        </div>
                        {rowData?.a_action_30d && (
                          <p className="text-xs text-muted-foreground">
                            30-Day Action: <strong className="text-foreground">{rowData.a_action_30d}</strong>
                          </p>
                        )}
                      </div>
                    ) : row.id === '10' ? (
                      <div className="not-italic font-sans space-y-2">
                        {rowData?.b_tomorrow && (
                          <p className="text-xs text-muted-foreground">
                            First thing tomorrow morning: <strong className="text-foreground">{rowData.b_tomorrow}</strong>
                          </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                          {['phase_1', 'phase_2', 'phase_3'].map((ph, idx) => {
                            const phase = rowData?.[ph]
                            return (
                              <div key={ph} className="p-2 border border-border/80 bg-muted/20 rounded text-xs">
                                <span className="font-semibold block mb-1 text-[10px] uppercase text-muted-foreground">
                                  {ph === 'phase_1' ? 'Days 1-30' : ph === 'phase_2' ? 'Days 31-60' : 'Days 61-90'}
                                </span>
                                <p className="font-medium text-foreground truncate">{phase?.priority_1 || 'Unset'}</p>
                                <p className="text-muted-foreground truncate">{phase?.milestone || 'No milestone'}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : row.id === '15' ? (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-muted-foreground block uppercase not-italic font-sans">
                          Letter written on {outputs?.letter_written_at ? new Date(outputs.letter_written_at).toLocaleDateString() : 'date'}
                        </span>
                        <p className="text-sm bg-muted/40 p-3 border border-border rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                          &ldquo;{rowData?.v_letter || 'No letter written'}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <span>&ldquo;{outputs?.[row.carryKey!] || '...'}&rdquo;</span>
                    )
                  ) : (
                    <span className="text-xs italic text-muted-foreground not-serif">
                      This row is draft or has not been completed. Open{' '}
                      <Link href={`/workbook/${row.id}`} className="text-primary hover:underline font-semibold">
                        Section {row.id}
                      </Link>{' '}
                      to record this output.
                    </span>
                  )}
                </div>
              </article>
            );
          } else {
            return (
              <div
                key={row.id}
                className="p-4 border border-dashed border-border/60 bg-muted/10 opacity-60 rounded-lg flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔒</span>
                  <span className="font-mono text-xs text-muted-foreground mr-1">{row.id}</span>
                  <span className="font-medium text-muted-foreground">{row.title}</span>
                </div>
                <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
                  Available in the full sequence
                </span>
              </div>
            );
          }
        })}
      </div>

      <footer className="text-center text-xs text-muted-foreground border-t border-border pt-6">
        The Bench Blueprint™ &middot; &copy; 2026 Lami Oguntade &middot; All rights reserved.
      </footer>
    </main>
  )
}
