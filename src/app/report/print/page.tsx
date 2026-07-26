import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'My Bench Blueprint - Print Report',
  robots: 'noindex, nofollow'
}

export default async function PrintReportPage() {
  const supabase = await createClient()

  // Retrieve user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user outputs
  const { data: outputs } = await supabase
    .from('user_outputs')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch section entries
  const { data: entriesList } = await supabase
    .from('section_entries')
    .select('section_id, data, status')
    .eq('user_id', user.id)

  const entries: Record<string, any> = {}
  if (entriesList) {
    entriesList.forEach((e) => {
      entries[e.section_id] = e
    })
  }

  // Check complete status
  const mvpIds = ['00', '01', '02', '03', '05', '10', '15']
  const allComplete = mvpIds.every((id) => entries[id]?.status === 'complete')

  if (!allComplete) {
    redirect('/report?error=incomplete')
  }

  const s00 = entries['00']?.data || {}
  const s01 = entries['01']?.data || {}
  const s02 = entries['02']?.data || {}
  const s03 = entries['03']?.data || {}
  const s05 = entries['05']?.data || {}
  const s10 = entries['10']?.data || {}
  const s15 = entries['15']?.data || {}

  return (
    <div className="bg-white text-black min-h-screen py-12 px-8 sm:px-16 max-w-4xl mx-auto font-serif antialiased leading-relaxed print:p-0 print:m-0">
      
      {/* Title cover page header */}
      <header className="border-b-2 border-black pb-6 mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight uppercase">
          The Bench Blueprint™
        </h1>
        <p className="text-md font-sans uppercase tracking-wider text-gray-600 mt-2">
          Your Career Reinvention Roadmap
        </p>
        <div className="mt-4 text-xs font-sans text-gray-500">
          Client: {user.email} &bull; Date Compiled: {new Date().toLocaleDateString()}
        </div>
      </header>

      {/* Page 1: Stage 1 - Clarification */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-1.5 font-sans tracking-wide">
          Stage 1: Clarify (Sections 00, 01, 02)
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-300 rounded">
            <span className="text-[10px] font-sans font-bold uppercase text-gray-500 block">
              Section 00 &bull; Readiness Score
            </span>
            <span className="text-3xl font-bold font-sans block mt-1">
              {outputs?.diagnostic_total} / 60
            </span>
            <span className="text-xs font-sans uppercase font-bold text-gray-600 block mt-1">
              Zone: {outputs?.diagnostic_zone}
            </span>
          </div>

          <div className="p-4 border border-gray-300 rounded">
            <span className="text-[10px] font-sans font-bold uppercase text-gray-500 block">
              Section 00 &bull; Critical Priority Gaps
            </span>
            <ol className="list-decimal pl-4 mt-1 text-sm font-sans space-y-0.5">
              {outputs?.priority_areas?.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Section 01 &bull; Bench Thesis
            </h3>
            <p className="italic text-base text-gray-900 mt-1 pl-4 border-l-2 border-gray-300">
              &ldquo;This bench period is an opportunity to {outputs?.bench_thesis}&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Section 01 &bull; Reset sentence
            </h3>
            <p className="italic text-base text-gray-900 mt-1 pl-4 border-l-2 border-gray-300">
              &ldquo;{outputs?.reset_sentence}&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Section 02 &bull; North Star
            </h3>
            <p className="italic text-lg font-bold text-gray-900 mt-1 pl-4 border-l-2 border-gray-300">
              &ldquo;{outputs?.north_star}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Page 2: Stage 2 - Position */}
      <section className="space-y-6 pt-10 print:break-before-page">
        <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-1.5 font-sans tracking-wide">
          Stage 2: Position (Sections 03, 05)
        </h2>

        <div>
          <h3 className="text-sm font-sans font-bold uppercase text-gray-700 mb-2">
            Section 03 &bull; Strength Map Top 3 Priority Areas
          </h3>
          <ul className="list-disc pl-5 font-sans text-sm space-y-1">
            {outputs?.top_3_areas?.map((area: string, i: number) => (
              <li key={i}>{area}</li>
            ))}
          </ul>
        </div>

        {s03.sm_map && (
          <div className="space-y-3">
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Section 03 &bull; Core Strength Diagnostics (Excerpt)
            </h3>
            <table className="w-full text-xs font-sans border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left w-1/4">Category</th>
                  <th className="border border-gray-300 p-2 text-left">Built</th>
                  <th className="border border-gray-300 p-2 text-left">Surface</th>
                </tr>
              </thead>
              <tbody>
                {['sm_core', 'sm_industry', 'sm_proof', 'sm_comms', 'sm_brand'].map((catKey) => {
                  const cat = s03.sm_map[catKey]
                  const label =
                    catKey === 'sm_core' ? 'Core Skills' :
                    catKey === 'sm_industry' ? 'Industry' :
                    catKey === 'sm_proof' ? 'Proof' :
                    catKey === 'sm_comms' ? 'Comms' : 'Brand'
                  return (
                    <tr key={catKey}>
                      <td className="border border-gray-300 p-2 font-semibold">{label}</td>
                      <td className="border border-gray-300 p-2">{cat?.built || '-'}</td>
                      <td className="border border-gray-300 p-2">{cat?.surface || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Section 05 &bull; Professional Positioning Statement
            </h3>
            <p className="text-base text-gray-900 mt-1 pl-4 border-l-2 border-gray-300 font-serif italic">
              &ldquo;{outputs?.positioning_final}&rdquo;
            </p>
          </div>

          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Section 05 &bull; Go-To Target Audience
            </h3>
            <p className="text-sm text-gray-800 mt-1 font-sans">
              {s05.p_audience || 'Not defined'}
            </p>
          </div>
        </div>
      </section>

      {/* Page 3: Stage 3 - Execute */}
      <section className="space-y-6 pt-10 print:break-before-page">
        <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-1.5 font-sans tracking-wide">
          Stage 3: Execute (Section 10)
        </h2>

        {s10.b_runway_months && (
          <div className="p-3 border border-gray-200 bg-gray-50 text-xs font-sans rounded">
            <strong>Financial Runway Checked:</strong> {s10.b_runway_months} months
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
            Section 10 &bull; 30/60/90 Day Commitments
          </h3>

          {['phase_1', 'phase_2', 'phase_3'].map((ph, idx) => {
            const phase = s10[ph]
            const title = ph === 'phase_1' ? 'Days 1–30 (Foundation)' : ph === 'phase_2' ? 'Days 31–60 (Build)' : 'Days 61–90 (Convert)'
            return (
              <div key={ph} className="p-4 border border-gray-300 rounded">
                <h4 className="text-sm font-sans font-semibold uppercase text-gray-800 border-b border-gray-200 pb-1 mb-2">
                  {title}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <span className="font-bold text-gray-500 block">Priorities:</span>
                    <ul className="list-disc pl-4 mt-1 space-y-0.5">
                      {phase?.priority_1 && <li>{phase.priority_1}</li>}
                      {phase?.priority_2 && <li>{phase.priority_2}</li>}
                      {phase?.priority_3 && <li>{phase.priority_3}</li>}
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-gray-500 block">Milestone / Metrics:</span>
                    <p className="mt-1 font-serif text-sm italic">{phase?.milestone || 'None'}</p>
                    <p className="text-gray-500 mt-1">Metric: {phase?.success_metric || 'None'}</p>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <h4 className="text-xs font-sans font-bold uppercase text-gray-600">Next 7 Days Action Plan:</h4>
              <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{s10.b_next_7_days || '-'}</p>
            </div>
            <div>
              <h4 className="text-xs font-sans font-bold uppercase text-gray-600">Tomorrow Morning:</h4>
              <p className="text-sm text-gray-800 mt-1 font-bold">{s10.b_tomorrow || '-'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Page 4: Stage 4 - Review */}
      <section className="space-y-6 pt-10 print:break-before-page">
        <h2 className="text-xl font-bold uppercase border-b border-gray-300 pb-1.5 font-sans tracking-wide">
          Stage 4: Review (Section 15)
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              Professional I Am Becoming
            </h3>
            <p className="text-sm text-gray-800 mt-1 font-sans pl-2 border-l border-gray-200">
              {s15.v_becoming || '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              What I Proved to Myself
            </h3>
            <p className="text-sm text-gray-800 mt-1 font-sans pl-2 border-l border-gray-200">
              {s15.v_proved || '-'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-sans font-bold uppercase text-gray-700">
              A Letter to the Next Version of Me
            </h3>
            <div className="p-6 bg-gray-50 border border-gray-300 rounded font-serif italic text-base leading-relaxed text-gray-900 whitespace-pre-wrap mt-2">
              &ldquo;{s15.v_letter || 'No letter content written.'}&rdquo;
              <div className="text-right font-sans not-italic text-xs font-semibold text-gray-500 mt-4">
                Signed Date: {s15.v_letter_date || 'Unsigned'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Printable Footnote and disclaimer */}
      <footer className="mt-16 text-center text-xs text-gray-500 space-y-2 border-t border-black pt-6 print:mt-12">
        <p className="font-sans">
          The Bench Blueprint™ &bull; &copy; 2026 Lami Oguntade &bull; All rights reserved.
        </p>
        <p className="max-w-md mx-auto italic text-[10px]">
          Disclaimer: The information in this workbook is for educational purposes only and should not be construed as legal, financial, tax, or career advice.
        </p>
      </footer>
    </div>
  )
}
