'use server'

import { createClient } from '@/lib/supabase/server'
import { syncOutputs } from '@/lib/sections/sync'

export async function saveSectionEntry(
  sectionId: string,
  data: any,
  status: 'not_started' | 'in_progress' | 'complete'
) {
  const supabase = await createClient()

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const completedAt = status === 'complete' ? new Date().toISOString() : null

  // Upsert the section entry
  const { error: upsertError } = await supabase
    .from('section_entries')
    .upsert(
      {
        user_id: user.id,
        section_id: sectionId,
        data,
        status,
        updated_at: new Date().toISOString(),
        ...(completedAt ? { completed_at: completedAt } : {})
      },
      {
        onConflict: 'user_id,section_id'
      }
    )

  if (upsertError) {
    console.error(`[saveSectionEntry] Upsert error:`, upsertError)
    return { success: false, error: upsertError.message }
  }

  // Update profile last active timestamp
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ last_worked_at: new Date().toISOString() })
    .eq('id', user.id)

  if (profileError) {
    console.error(`[saveSectionEntry] Profile last active update error:`, profileError)
  }

  // Sync to user_outputs
  const syncResult = await syncOutputs(user.id, sectionId, data)

  return { 
    success: syncResult.success, 
    error: syncResult.error ? 'Failed to sync outputs' : null 
  }
}
