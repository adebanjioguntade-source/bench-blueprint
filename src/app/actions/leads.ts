'use server'

import { createServiceClient } from '@/lib/supabase/service'

export async function createDiagnosticLead(
  email: string,
  total: number,
  zone: string,
  priorityAreas: string[]
) {
  try {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return { success: false, error: 'Invalid email address.' }
    }

    const supabase = createServiceClient()

    // Query if an unclaimed lead already exists for this email
    const { data: existingLead, error: selectError } = await supabase
      .from('diagnostic_leads')
      .select('id')
      .eq('email', trimmedEmail)
      .is('claimed_by', null)
      .maybeSingle()

    if (selectError) {
      console.error('[createDiagnosticLead] Select error:', selectError)
    }

    if (existingLead) {
      // Overwrite the existing unclaimed lead details
      const { error: updateError } = await supabase
        .from('diagnostic_leads')
        .update({
          total,
          zone,
          priority_areas: priorityAreas,
          created_at: new Date().toISOString()
        })
        .eq('id', existingLead.id)

      if (updateError) {
        console.error('[createDiagnosticLead] Update error:', updateError)
        return { success: false, error: 'Failed to update lead information.' }
      }
    } else {
      // Create a new diagnostic lead
      const { error: insertError } = await supabase
        .from('diagnostic_leads')
        .insert({
          email: trimmedEmail,
          total,
          zone,
          priority_areas: priorityAreas
        })

      if (insertError) {
        console.error('[createDiagnosticLead] Insert error:', insertError)
        return { success: false, error: 'Failed to save lead information.' }
      }
    }

    return { success: true }
  } catch (err: any) {
    console.error('[createDiagnosticLead] Unexpected error:', err)
    return { success: false, error: err.message || 'An unexpected error occurred.' }
  }
}
