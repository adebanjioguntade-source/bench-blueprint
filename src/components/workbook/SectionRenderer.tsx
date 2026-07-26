'use client'

import React from 'react'
import { FieldDefinition, SectionDefinition } from '@/lib/sections/types'
import { cn } from '@/lib/utils'

// Helpers to get/set values in nested paths
function getValue(obj: any, path: string[]): any {
  let current = obj
  for (const key of path) {
    if (current == null) return undefined
    current = current[key]
  }
  return current
}

function setValue(obj: any, path: string[], value: any): any {
  const newObj = { ...obj }
  let current = newObj
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]
    current[key] = current[key] ? { ...current[key] } : {}
    current = current[key]
  }
  current[path[path.length - 1]] = value
  return newObj
}

interface SectionRendererProps {
  section: SectionDefinition
  data: any
  onChange: (newData: any) => void
  userOutputs?: any
  readOnly?: boolean
}

export default function SectionRenderer({
  section,
  data,
  onChange,
  userOutputs = {},
  readOnly = false
}: SectionRendererProps) {
  // Stage colors mapper
  const getStageAccentColor = () => {
    switch (section.stage) {
      case 'Clarify':
        return 'text-stage-clarify hover:bg-stage-clarify/10 border-stage-clarify'
      case 'Position':
        return 'text-stage-position hover:bg-stage-position/10 border-stage-position'
      case 'Execute':
        return 'text-stage-execute hover:bg-stage-execute/10 border-stage-execute'
      case 'Review & Reinvent':
        return 'text-stage-review hover:bg-stage-review/10 border-stage-review'
      default:
        return 'text-primary border-primary'
    }
  }

  const getStageBgColor = (isActive: boolean) => {
    if (!isActive) return 'bg-transparent text-foreground border-border'
    switch (section.stage) {
      case 'Clarify':
        return 'bg-stage-clarify text-white border-stage-clarify'
      case 'Position':
        return 'bg-stage-position text-white border-stage-position'
      case 'Execute':
        return 'bg-stage-execute text-white border-stage-execute'
      case 'Review & Reinvent':
        return 'bg-stage-review text-white border-stage-review'
      default:
        return 'bg-primary text-white border-primary'
    }
  }

  const getStageRingColor = () => {
    switch (section.stage) {
      case 'Clarify':
        return 'focus:ring-stage-clarify focus:border-stage-clarify'
      case 'Position':
        return 'focus:ring-stage-position focus:border-stage-position'
      case 'Execute':
        return 'focus:ring-stage-execute focus:border-stage-execute'
      case 'Review & Reinvent':
        return 'focus:ring-stage-review focus:border-stage-review'
      default:
        return 'focus:ring-primary focus:border-primary'
    }
  }

  // Sourced from Strength Map `built` inputs
  const getBuiltStrengthOptions = () => {
    const options: string[] = []
    const smMap = data.sm_map || {}
    const categories = [
      'sm_core',
      'sm_industry',
      'sm_proof',
      'sm_comms',
      'sm_network',
      'sm_credibility',
      'sm_brand'
    ]
    categories.forEach((cat) => {
      const builtText = smMap[cat]?.built
      if (builtText && typeof builtText === 'string' && builtText.trim() !== '') {
        // Strengths can be comma-separated or simple sentences. Split by comma/period or display raw
        const parts = builtText.split(/[,;\n\.]+/).map(p => p.trim()).filter(Boolean)
        parts.forEach((p) => {
          if (!options.includes(p)) {
            options.push(p)
          }
        })
      }
    })
    return options
  }

  // Field change handler
  const handleFieldChange = (path: string[], value: any) => {
    if (readOnly) return
    const updated = setValue(data, path, value)
    onChange(updated)
  }

  // Render a specific field definition
  const renderField = (field: FieldDefinition, path: string[]) => {
    const val = getValue(data, path) ?? field.defaultValue ?? ''

    switch (field.type) {
      case 'scale_1_5': {
        const score = Number(val || 3)
        return (
          <div key={field.id} className="space-y-2 py-4 border-b border-border last:border-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
              <div>
                <label className="text-base font-medium text-foreground">{field.label}</label>
                {field.helperText && (
                  <p className="text-sm text-muted-foreground mt-0.5">{field.helperText}</p>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2 sm:mt-0">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={readOnly}
                    onClick={() => handleFieldChange(path, num)}
                    className={cn(
                      "w-10 h-10 rounded-md border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary",
                      getStageBgColor(score === num),
                      readOnly && 'opacity-55 cursor-not-allowed'
                    )}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      }

      case 'text_short': {
        if (field.optionsSource === 'sm_built_picker') {
          const strengthOptions = getBuiltStrengthOptions()
          const isEmpty = strengthOptions.length === 0
          return (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                {field.label}
              </label>
              {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
              {isEmpty ? (
                <div className="p-3 text-sm border border-amber-200/50 bg-amber-500/5 text-amber-600 dark:text-amber-400 rounded-md">
                  No strengths detected. Please go up and fill your <strong>Strength Map (Built)</strong> rows first.
                </div>
              ) : (
                <select
                  id={field.id}
                  value={val}
                  disabled={readOnly}
                  onChange={(e) => handleFieldChange(path, e.target.value)}
                  className={cn(
                    "block w-full px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0",
                    getStageRingColor(),
                    readOnly && 'opacity-55 cursor-not-allowed'
                  )}
                >
                  <option value="">-- Select a strength from your map --</option>
                  {strengthOptions.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )
        }

        const runwayVal = parseFloat(data.b_runway_months || '')
        const hasLowRunway = !isNaN(runwayVal) && runwayVal > 0 && runwayVal < 2

        return (
          <div key={field.id} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                {field.label}
              </label>
              {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
              <input
                id={field.id}
                type="text"
                value={val}
                disabled={readOnly}
                placeholder={field.placeholder}
                onChange={(e) => handleFieldChange(path, e.target.value)}
                className={cn(
                  "block w-full px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0",
                  getStageRingColor(),
                  readOnly && 'opacity-55'
                )}
              />
            </div>
            {field.id === 'b_runway_months' && hasLowRunway && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 rounded-md text-sm leading-relaxed">
                <strong>⚠️ Provisional Plan Warning:</strong> Because your financial runway is under 2 months, the workbook recommends only committing to Days 1–30. Focus energy on stabilizing your runway first. Phases 2 and 3 have been made optional.
              </div>
            )}
          </div>
        )
      }

      case 'text_long': {
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label htmlFor={field.id} className="text-sm font-medium text-foreground">
              {field.label}
            </label>
            {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
            <textarea
              id={field.id}
              rows={3}
              value={val}
              disabled={readOnly}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(path, e.target.value)}
              className={cn(
                "block w-full px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y",
                getStageRingColor(),
                readOnly && 'opacity-55'
              )}
            />
          </div>
        )
      }

      case 'text_xl': {
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label htmlFor={field.id} className="text-sm font-medium text-foreground">
              {field.label}
            </label>
            {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
            <textarea
              id={field.id}
              rows={8}
              value={val}
              disabled={readOnly}
              placeholder={field.placeholder}
              onChange={(e) => handleFieldChange(path, e.target.value)}
              className={cn(
                "block w-full px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0 resize-y font-serif leading-relaxed text-base",
                getStageRingColor(),
                readOnly && 'opacity-55'
              )}
            />
          </div>
        )
      }

      case 'list_n': {
        const count = field.count || 3
        const listVal = (Array.isArray(val) ? val : []).concat(Array(count).fill('')).slice(0, count)
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-foreground">{field.label}</label>
            {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
            <div className="space-y-2">
              {Array.from({ length: count }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  value={listVal[i] || ''}
                  disabled={readOnly}
                  placeholder={`Priority #${i + 1}`}
                  onChange={(e) => {
                    const nextVal = [...listVal]
                    nextVal[i] = e.target.value
                    handleFieldChange(path, nextVal)
                  }}
                  className={cn(
                    "block w-full px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0",
                    getStageRingColor(),
                    readOnly && 'opacity-55'
                  )}
                />
              ))}
            </div>
          </div>
        )
      }

      case 'list_dyn': {
        const listVal = Array.isArray(val) ? val : (field.defaultValue || ['', '', ''])
        const minVal = field.min ?? 3
        const maxVal = field.max ?? 6

        const handleAdd = () => {
          if (listVal.length < maxVal) {
            handleFieldChange(path, [...listVal, ''])
          }
        }

        const handleRemove = (index: number) => {
          if (listVal.length > minVal) {
            const nextVal = listVal.filter((_: any, idx: number) => idx !== index)
            handleFieldChange(path, nextVal)
          }
        }

        return (
          <div key={field.id} className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">{field.label}</label>
              {!readOnly && listVal.length < maxVal && (
                <button
                  type="button"
                  onClick={handleAdd}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1.5 border rounded-md transition-colors",
                    getStageAccentColor()
                  )}
                >
                  + Add Item
                </button>
              )}
            </div>
            {field.prompt && <p className="text-sm text-muted-foreground -mt-2">{field.prompt}</p>}
            <div className="space-y-2">
              {listVal.map((item: string, i: number) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={item}
                    disabled={readOnly}
                    placeholder={`Item #${i + 1}`}
                    onChange={(e) => {
                      const nextVal = [...listVal]
                      nextVal[i] = e.target.value
                      handleFieldChange(path, nextVal)
                    }}
                    className={cn(
                      "block flex-1 px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0",
                      getStageRingColor(),
                      readOnly && 'opacity-55'
                    )}
                  />
                  {!readOnly && listVal.length > minVal && (
                    <button
                      type="button"
                      onClick={() => handleRemove(i)}
                      className="text-muted-foreground hover:text-destructive p-2 text-sm transition-colors"
                      title="Remove row"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'date': {
        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label htmlFor={field.id} className="text-sm font-medium text-foreground">
              {field.label}
            </label>
            {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
            <input
              id={field.id}
              type="date"
              value={val}
              disabled={readOnly}
              onChange={(e) => handleFieldChange(path, e.target.value)}
              className={cn(
                "block w-full px-3 py-2 border border-border rounded-md shadow-sm sm:text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-offset-0",
                getStageRingColor(),
                readOnly && 'opacity-55'
              )}
            />
          </div>
        )
      }

      case 'computed': {
        let displayText = val
        const isDraftField = field.id === 'p_draft'

        if (isDraftField) {
          const who = data.p_who || ''
          const outcome = data.p_outcome || ''
          const approach = data.p_approach || ''
          displayText = who || outcome || approach 
            ? `I help ${who} achieve ${outcome} through ${approach}.`
            : ''
        }

        // States for Section 05 AI Assist
        // Note: Using React hooks directly. Since SectionRenderer runs in a client component,
        // we can manage local suggestion states using inline client logic.
        const [suggestions, setSuggestions] = React.useState<{ specific: string; broader: string; bolder: string } | null>(null)
        const [aiLoading, setAiLoading] = React.useState(false)
        const [aiError, setAiError] = React.useState('')

        const handleAiRefinement = async () => {
          setAiError('')
          setSuggestions(null)
          setAiLoading(true)

          try {
            // Collect evidence items
            const evList = data.p_evidence_list || {}
            const evidenceArray = ['ev_1', 'ev_2', 'ev_3'].map(key => ({
              delivered: evList[key]?.delivered || '',
              impact: evList[key]?.impact || ''
            }))

            const response = await fetch('/api/ai/positioning', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                draft: displayText,
                evidence: evidenceArray
              })
            })

            const result = await response.json()
            if (response.ok) {
              setSuggestions(result)
            } else {
              setAiError(result.error || 'Failed to generate suggestions.')
            }
          } catch {
            setAiError('A connection error occurred. Please check your network.')
          } finally {
            setAiLoading(false)
          }
        }

        const handleUseSuggestion = (text: string) => {
          handleFieldChange(['p_final'], text)
          setSuggestions(null)
        }

        const isDraftValid = displayText.trim() !== '' && !displayText.includes('[who]')

        return (
          <div key={field.id} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">{field.label}</label>
              <div className="p-4 bg-muted border border-border text-foreground font-serif italic text-base rounded-md leading-relaxed min-h-[3rem] flex items-center">
                {displayText || <span className="text-muted-foreground text-sm font-sans not-italic">Fill in the positioning variables above (who, outcome, approach) to build your draft...</span>}
              </div>
            </div>

            {isDraftField && !readOnly && (
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Strategic AI Assistant
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Refine your draft positioning statement using Claude. Requires at least one completed proof point.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!isDraftValid || aiLoading}
                    onClick={handleAiRefinement}
                    className={cn(
                      "px-4 py-2 text-xs font-semibold rounded border transition-colors shadow-sm",
                      isDraftValid && !aiLoading
                        ? getStageAccentColor()
                        : "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
                    )}
                  >
                    {aiLoading ? 'Refining Statement...' : 'Analyze & Suggest Revisions'}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  *Your draft and proof points are sent to an AI model to generate suggestions. Nothing else from your workbook is sent.
                </p>

                {aiError && (
                  <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded">
                    {aiError}
                  </div>
                )}

                {suggestions && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 animate-fade-in">
                    {/* Specific */}
                    <div className="p-4 border border-border rounded bg-muted/20 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stage-position bg-stage-position/10 px-2 py-0.5 rounded">
                          Specific Angle
                        </span>
                        <p className="text-xs text-foreground font-serif italic mt-2.5 leading-relaxed">
                          &ldquo;{suggestions.specific}&rdquo;
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUseSuggestion(suggestions.specific)}
                        className="w-full text-center py-1.5 bg-stage-position text-white text-[11px] font-semibold rounded shadow-sm hover:opacity-90"
                      >
                        Use this revision
                      </button>
                    </div>

                    {/* Broader */}
                    <div className="p-4 border border-border rounded bg-muted/20 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stage-clarify bg-stage-clarify/10 px-2 py-0.5 rounded">
                          Broader Angle
                        </span>
                        <p className="text-xs text-foreground font-serif italic mt-2.5 leading-relaxed">
                          &ldquo;{suggestions.broader}&rdquo;
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUseSuggestion(suggestions.broader)}
                        className="w-full text-center py-1.5 bg-stage-clarify text-white text-[11px] font-semibold rounded shadow-sm hover:opacity-90"
                      >
                        Use this revision
                      </button>
                    </div>

                    {/* Bolder */}
                    <div className="p-4 border border-border rounded bg-muted/20 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-stage-execute bg-stage-execute/10 px-2 py-0.5 rounded">
                          Bolder Angle
                        </span>
                        <p className="text-xs text-foreground font-serif italic mt-2.5 leading-relaxed">
                          &ldquo;{suggestions.bolder}&rdquo;
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUseSuggestion(suggestions.bolder)}
                        className="w-full text-center py-1.5 bg-stage-execute text-white text-[11px] font-semibold rounded shadow-sm hover:opacity-90"
                      >
                        Use this revision
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      }

      case 'group': {
        const subfields = field.fields || []
        const runwayVal = parseFloat(data.b_runway_months || '')
        const hasLowRunway = !isNaN(runwayVal) && runwayVal > 0 && runwayVal < 2
        const isPhase2Or3 = field.id === 'phase_2' || field.id === 'phase_3'

        return (
          <div 
            key={field.id} 
            className={cn(
              "bg-card border rounded-lg p-5 space-y-4 shadow-sm transition-all duration-300",
              isPhase2Or3 && hasLowRunway ? "border-dashed border-muted-foreground/30 opacity-70 bg-muted/10" : "border-border"
            )}
          >
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-md font-semibold tracking-tight text-foreground">
                {field.label}
              </h3>
              {isPhase2Or3 && hasLowRunway && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                  Optional &bull; Low Runway
                </span>
              )}
            </div>
            {field.prompt && <p className="text-sm text-muted-foreground">{field.prompt}</p>}
            <div className="space-y-4">
              {subfields.map((sub) => renderField(sub, [...path, sub.id]))}
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="space-y-8">
      {section.fields.map((field) => renderField(field, [field.id]))}
    </div>
  )
}
