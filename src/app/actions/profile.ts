'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateEntrySection(sectionId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ entry_section: sectionId })
    .eq('id', user.id)

  if (error) {
    console.error('[updateEntrySection] Error updating entry section:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
