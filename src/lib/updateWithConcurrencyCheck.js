import { supabase } from './supabaseClient'

// Shared by every admin `update*` function that needs optimistic
// concurrency control — same pattern originally built for
// PropertiesContext's updateProperty and SiteSettingsContext's
// updateSettings, pulled out here now that categories/subcategories/
// amenities/agents/neighborhoods all got their own updated_at column and
// trigger too, rather than hand-copying the same ~15 lines five more
// times.
//
// Conditions the update on `expectedUpdatedAt` (the value the caller
// loaded the row with) when provided. If zero rows come back, that means
// either the row no longer exists, or it does but updated_at no longer
// matches — someone else saved a change since this admin loaded it. A
// plain .update() can't distinguish those on its own, so a follow-up
// lookup by id alone resolves which it was.
export async function updateWithConcurrencyCheck(table, id, patch, expectedUpdatedAt, entityLabel) {
  let query = supabase.from(table).update(patch).eq('id', id)
  if (expectedUpdatedAt) {
    query = query.eq('updated_at', expectedUpdatedAt)
  }
  const { data, error } = await query.select()
  if (error) throw error

  if (data.length === 0) {
    const { data: stillExists } = await supabase.from(table).select('id').eq('id', id).maybeSingle()
    if (!stillExists) {
      const notFoundError = new Error(
        `This ${entityLabel} no longer exists — it may have been deleted by another admin.`,
      )
      notFoundError.code = 'NOT_FOUND'
      throw notFoundError
    }
    const conflictError = new Error(`This ${entityLabel} was updated by someone else. Reload before saving again.`)
    conflictError.code = 'CONFLICT'
    throw conflictError
  }

  return data[0]
}
