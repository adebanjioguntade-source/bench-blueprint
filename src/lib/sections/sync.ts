import { createClient } from '@/lib/supabase/server'

export async function syncOutputs(userId: string, sectionId: string, data: any) {
  const supabase = await createClient()
  const updates: any = {
    updated_at: new Date().toISOString()
  }

  if (sectionId === '00') {
    updates.diagnostic_total = typeof data.d_total === 'number' ? data.d_total : null
    updates.diagnostic_zone = data.d_zone || null
    updates.priority_areas = data.d_priorities || null
  } else if (sectionId === '01') {
    updates.bench_thesis = data.r_thesis || null
    updates.reset_sentence = data.r_reset_sentence || null
  } else if (sectionId === '02') {
    updates.north_star = data.n_north_star || null
  } else if (sectionId === '03') {
    updates.top_3_areas = data.a_top3 || null
  } else if (sectionId === '05') {
    updates.positioning_final = data.p_final || null
  } else if (sectionId === '10') {
    updates.first_action = data.b_tomorrow || null
  } else if (sectionId === '15') {
    updates.letter_written_at = data.v_letter_date || null
  }

  // If there is data to update (more than just updated_at)
  if (Object.keys(updates).length > 1) {
    const { error } = await supabase
      .from('user_outputs')
      .upsert({ user_id: userId, ...updates })

    if (error) {
      console.error(`[syncOutputs] Error syncing outputs for user ${userId}, section ${sectionId}:`, error)
      return { success: false, error }
    }
  }

  return { success: true }
}
