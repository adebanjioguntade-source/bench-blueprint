'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function exportUserData() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    // 1. Fetch profile details
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 2. Fetch section answers
    const { data: entries } = await supabase
      .from('section_entries')
      .select('section_id, data, status, completed_at, updated_at')
      .eq('user_id', user.id)

    // 3. Fetch carried outputs
    const { data: outputs } = await supabase
      .from('user_outputs')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const archive = {
      email: user.email,
      exported_at: new Date().toISOString(),
      profile: profile || null,
      section_entries: entries || [],
      user_outputs: outputs || null
    }

    return { success: true, data: archive }
  } catch (err: any) {
    console.error('[exportUserData] Export failed:', err)
    return { success: false, error: err.message || 'Data retrieval failed.' }
  }
}

export async function deleteUserAccount() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  try {
    const serviceClient = createServiceClient()

    // Hard delete user from auth.users (will cascade delete profiles, entries, outputs due to foreign keys)
    const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('[deleteUserAccount] Delete error:', deleteError)
      return { success: false, error: deleteError.message }
    }

    // Sign out to clear cookies/session
    await supabase.auth.signOut()

    return { success: true }
  } catch (err: any) {
    console.error('[deleteUserAccount] Unexpected error:', err)
    return { success: false, error: err.message || 'Account deletion failed.' }
  }
}
