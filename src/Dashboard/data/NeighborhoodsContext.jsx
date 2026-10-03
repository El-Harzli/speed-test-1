import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { fetchAllWithRetry } from '../../lib/fetchAllWithRetry'
import { updateWithConcurrencyCheck } from '../../lib/updateWithConcurrencyCheck'
import { useToast } from '../shared/ToastContext'

const NeighborhoodsContext = createContext(null)

// Postgres `numeric` columns are serialized as strings by PostgREST to
// avoid float precision loss — coerce them back to numbers, same pattern
// as PropertiesContext.
function normalizeNeighborhood(neighborhood) {
  return {
    ...neighborhood,
    focal_x: Number(neighborhood.focal_x ?? 0.5),
    focal_y: Number(neighborhood.focal_y ?? 0.5),
  }
}

export function NeighborhoodsProvider({ children }) {
  const [neighborhoods, setNeighborhoods] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [{ data, error }] = await fetchAllWithRetry([
        () => supabase.from('neighborhoods').select('*').order('sort_order', { ascending: true }),
      ])
      if (!active) return
      if (error) {
        console.error(error)
        showToast('Could not load neighborhoods.', 'error')
      } else {
        setNeighborhoods(data.map(normalizeNeighborhood))
      }
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  async function addNeighborhood({ name, description, image_url, focal_x, focal_y }) {
    // New entries go to the end of the current order by default — the
    // admin can still drag it wherever it should actually sit.
    const nextOrder = neighborhoods.length
    const { data, error } = await supabase
      .from('neighborhoods')
      .insert({
        name,
        description: description || null,
        image_url: image_url || null,
        focal_x: focal_x ?? 0.5,
        focal_y: focal_y ?? 0.5,
        sort_order: nextOrder,
      })
      .select()
      .single()
    if (error) throw error
    const neighborhood = normalizeNeighborhood(data)
    setNeighborhoods((current) => [...current, neighborhood])
    return neighborhood.id
  }

  async function updateNeighborhood(id, patch, expectedUpdatedAt) {
    const data = await updateWithConcurrencyCheck('neighborhoods', id, patch, expectedUpdatedAt, 'neighborhood')
    const neighborhood = normalizeNeighborhood(data)
    setNeighborhoods((current) => current.map((existing) => (existing.id === id ? neighborhood : existing)))
    return neighborhood
  }

  async function deleteNeighborhood(id) {
    const { error } = await supabase.from('neighborhoods').delete().eq('id', id)
    if (error) throw error
    setNeighborhoods((current) => current.filter((neighborhood) => neighborhood.id !== id))
  }

  // Persists a full reorder in one go — same pattern as the Featured
  // Properties page's updateFeaturedForListingType.
  async function reorderNeighborhoods(orderedIds) {
    const results = await Promise.all(
      orderedIds.map((id, index) => supabase.from('neighborhoods').update({ sort_order: index }).eq('id', id)),
    )
    const firstError = results.find((result) => result.error)?.error
    if (firstError) throw firstError
    setNeighborhoods((current) =>
      current
        .map((neighborhood) => {
          const index = orderedIds.indexOf(neighborhood.id)
          return index === -1 ? neighborhood : { ...neighborhood, sort_order: index }
        })
        .sort((a, b) => a.sort_order - b.sort_order),
    )
  }

  const value = useMemo(
    () => ({
      neighborhoods,
      loading,
      addNeighborhood,
      updateNeighborhood,
      deleteNeighborhood,
      reorderNeighborhoods,
    }),
    [neighborhoods, loading],
  )

  return <NeighborhoodsContext.Provider value={value}>{children}</NeighborhoodsContext.Provider>
}

export function useNeighborhoods() {
  const context = useContext(NeighborhoodsContext)
  if (!context) {
    throw new Error('useNeighborhoods must be used within a NeighborhoodsProvider')
  }
  return context
}
