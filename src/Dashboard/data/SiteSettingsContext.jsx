import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { fetchAllWithRetry } from '../../lib/fetchAllWithRetry'
import { useToast } from '../shared/ToastContext'

const SiteSettingsContext = createContext(null)

// Postgres `numeric` columns are serialized as strings by PostgREST — coerce
// them back to numbers here.
function normalizeSettings(settings) {
  return {
    ...settings,
    price_min: Number(settings.price_min),
    price_max: Number(settings.price_max),
    office_lat: Number(settings.office_lat),
    office_lng: Number(settings.office_lng),
  }
}
export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [{ data, error }] = await fetchAllWithRetry([
        () => supabase.from('site_settings').select('*').eq('id', 1).single(),
      ])
      if (!active) return
      if (error) {
        console.error(error)
        showToast('Could not load settings.', 'error')
      } else {
        setSettings(normalizeSettings(data))
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  // Same reasoning as PropertiesContext's updateProperty: site_settings is
  // a single row every admin edits from the same form, and the save sends
  // every field each time — without this check, whoever saves second
  // silently overwrites whatever the first admin just changed with their
  // own stale copy of it. `expectedUpdatedAt` is the value the form loaded
  // with; the trigger on this table already keeps updated_at current, so
  // a mismatch means someone else saved in between.
  async function updateSettings(patch, expectedUpdatedAt) {
    let query = supabase.from('site_settings').update(patch).eq('id', 1)
    if (expectedUpdatedAt) {
      query = query.eq('updated_at', expectedUpdatedAt)
    }
    const { data, error } = await query.select()
    if (error) throw error

    if (data.length === 0) {
      // This row is a fixed singleton with no delete path anywhere in the
      // admin, so unlike properties there's no "someone deleted it" case
      // to distinguish — zero rows here only ever means the timestamp
      // didn't match.
      const conflictError = new Error('Settings were updated by someone else. Reload before saving again.')
      conflictError.code = 'CONFLICT'
      throw conflictError
    }

    const settings = normalizeSettings(data[0])
    setSettings(settings)
    return settings
  }

  const value = useMemo(() => ({ settings, loading, updateSettings }), [settings, loading])

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider')
  }
  return context
}
