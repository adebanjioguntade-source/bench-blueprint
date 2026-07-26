'use client'

import React from 'react'
import Link from 'next/link'
import { CarrySource } from '@/lib/sections/types'
import { getCarriedValue } from '@/lib/carry'
import { cn } from '@/lib/utils'

interface BridgePanelProps {
  carries: CarrySource[]
  outputs: any
  currentSectionId: string
  isSticky?: boolean
  stage: 'Clarify' | 'Position' | 'Execute' | 'Review & Reinvent'
}

export default function BridgePanel({
  carries,
  outputs,
  currentSectionId,
  isSticky = false,
  stage
}: BridgePanelProps) {
  if (!carries || carries.length === 0) return null

  // Map stage colors for visual matching
  const getBorderColorClass = () => {
    switch (stage) {
      case 'Clarify':
        return 'border-stage-clarify/35'
      case 'Position':
        return 'border-stage-position/35'
      case 'Execute':
        return 'border-stage-execute/35'
      case 'Review & Reinvent':
        return 'border-stage-review/35'
      default:
        return 'border-border'
    }
  }

  return (
    <div
      className={cn(
        "w-full mb-8 transition-all duration-200 border rounded-lg bg-card/90 shadow-sm p-4 sm:p-5 backdrop-blur-sm",
        getBorderColorClass(),
        isSticky && "sticky top-4 z-20 ring-1 ring-black/5 dark:ring-white/5"
      )}
    >
      <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bridge Context — Carried Forward Values
        </h4>
        {isSticky && (
          <span className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded">
            Pinned Lens
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {carries.map((carry) => {
          const val = getCarriedValue(carry, outputs)
          const hasValue = val !== null

          return (
            <div
              key={carry.key}
              className={cn(
                "p-3 rounded border text-sm flex flex-col justify-between gap-2.5",
                hasValue
                  ? "bg-muted/40 border-border"
                  : "bg-amber-500/5 border-amber-500/20 text-amber-800 dark:text-amber-300"
              )}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground block uppercase">
                  Section {carry.sectionId} &middot; {carry.label}
                </span>

                {hasValue ? (
                  <div className="font-serif italic leading-relaxed text-foreground text-sm">
                    {Array.isArray(val) ? (
                      <ul className="list-disc pl-4 space-y-0.5 mt-1 font-sans not-italic text-xs">
                        {val.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>&ldquo;{val}&rdquo;</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs italic leading-normal">
                    You haven&apos;t written your {carry.label} yet &mdash; Section {carry.sectionId} takes ~15 minutes and everything here depends on it.
                  </p>
                )}
              </div>

              <div className="text-right">
                <Link
                  href={`/workbook/${carry.sectionId}?return=/workbook/${currentSectionId}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {hasValue ? 'Revisit Source' : 'Complete Now'} &rarr;
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
