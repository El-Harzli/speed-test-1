import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { fetchAllWithRetry } from '../../lib/fetchAllWithRetry'
import { useToast } from '../shared/ToastContext'

const PropertiesContext = createContext(null)

const PROPERTY_IMAGES_BUCKET = 'property-images'
// Same format Supabase's own getPublicUrl(path) produces — built from the
// known env var directly rather than calling getPublicUrl('') to derive it,
// so this doesn't depend on how that edge case (an empty path) happens to
// behave.
const PROPERTY_IMAGES_PREFIX = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${PROPERTY_IMAGES_BUCKET}/`

// Deleting a property only removes its property_images *rows* (via
// ON DELETE CASCADE) — the actual files sitting in Storage are a separate
// thing entirely and nothing else ever cleans those up. This maps a list of
// stored image URLs down to just the ones that are actually in our own
// bucket (skipping anything external, like this project's seeded demo
// photos which point at Pexels) and removes them.
async function removePropertyImageFiles(imageUrls) {
  const paths = imageUrls
    .filter((url) => typeof url === 'string' && url.startsWith(PROPERTY_IMAGES_PREFIX))
    .map((url) => url.slice(PROPERTY_IMAGES_PREFIX.length))

  if (paths.length === 0) return
  const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove(paths)
  if (error) throw error
}

function sortImages(images) {
  return images.slice().sort((a, b) => a.sort_order - b.sort_order)
}

// Postgres `numeric` columns are serialized as strings by PostgREST to
// avoid float precision loss — coerce them back to numbers so the rest of
// the app can keep treating them as numbers.
function normalizeImage(image) {
  return {
    ...image,
    focal_x: Number(image.focal_x ?? 0.5),
    focal_y: Number(image.focal_y ?? 0.5),
  }
}

// Postgres `numeric` columns (price, area, lat, lng) are serialized as
// strings by PostgREST to avoid float precision loss — coerce them back to
// numbers here so the rest of the app (price formatting, map coordinates,
// form pre-fill math) can keep treating them as numbers.
function normalizeProperty(property) {
  return {
    ...property,
    price: Number(property.price),
    area: Number(property.area),
    lat: property.lat === null ? null : Number(property.lat),
    lng: property.lng === null ? null : Number(property.lng),
  }
}

export function PropertiesProvider({ children }) {
  const [properties, setProperties] = useState([])
  const [propertyAmenities, setPropertyAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [propertiesRes, imagesRes, amenityLinksRes] = await fetchAllWithRetry([
        () => supabase.from('properties').select('*').order('created_at', { ascending: false }),
        () => supabase.from('property_images').select('*'),
        () => supabase.from('property_amenities').select('*'),
      ])

      if (!active) return

      const firstError = propertiesRes.error || imagesRes.error || amenityLinksRes.error
      if (firstError) {
        console.error(firstError)
        showToast('Could not load properties.', 'error')
        setLoading(false)
        return
      }

      const imagesByProperty = {}
      for (const image of imagesRes.data) {
        if (!imagesByProperty[image.property_id]) imagesByProperty[image.property_id] = []
        imagesByProperty[image.property_id].push(normalizeImage(image))
      }

      setProperties(
        propertiesRes.data.map((property) => ({
          ...normalizeProperty(property),
          images: sortImages(imagesByProperty[property.id] ?? []),
        })),
      )
      setPropertyAmenities(
        amenityLinksRes.data.map((link) => ({ propertyId: link.property_id, amenityId: link.amenity_id })),
      )
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  // ---- properties --------------------------------------------------------

  async function addProperty(fields) {
    const { data, error } = await supabase.from('properties').insert(fields).select().single()
    if (error) throw error
    const property = normalizeProperty(data)
    setProperties((current) => [{ ...property, images: [] }, ...current])
    return property.id
  }

  // `expectedUpdatedAt` is the value the caller loaded the property with —
  // when provided, the update only applies if the row hasn't changed since
  // then (properties.updated_at auto-refreshes via a DB trigger on every
  // update, so this is the same value Postgres itself will have moved on).
  // Without this, two admins editing the same property is a silent lost
  // update: whoever saves second overwrites the first admin's change with
  // their own now-stale copy of every other field, with no error at all.
  async function updateProperty(id, patch, expectedUpdatedAt) {
    let query = supabase.from('properties').update(patch).eq('id', id)
    if (expectedUpdatedAt) {
      query = query.eq('updated_at', expectedUpdatedAt)
    }
    const { data, error } = await query.select()
    if (error) throw error

    if (data.length === 0) {
      // Zero rows matched — either this property was deleted, or it still
      // exists but updated_at no longer matches (someone else saved a
      // change since we loaded it). A plain .update() can't tell these
      // apart on its own, so a second lookup by id alone resolves which.
      const { data: stillExists } = await supabase.from('properties').select('id').eq('id', id).maybeSingle()
      if (!stillExists) {
        const notFoundError = new Error(
          'This property no longer exists — it may have been deleted by another admin.',
        )
        notFoundError.code = 'NOT_FOUND'
        throw notFoundError
      }
      const conflictError = new Error(
        'This property was updated by someone else. Reload before saving again.',
      )
      conflictError.code = 'CONFLICT'
      throw conflictError
    }

    const property = normalizeProperty(data[0])
    setProperties((current) =>
      current.map((existing) => (existing.id === id ? { ...property, images: existing.images } : existing)),
    )
    return property
  }

  async function deleteProperty(id) {
    // Read the images before deleting — once the row is gone, ON DELETE
    // CASCADE removes the property_images rows too, and this is the last
    // moment we'd know which Storage files belonged to this property.
    const property = properties.find((existing) => existing.id === id)
    const imageUrls = property?.images?.map((image) => image.url) ?? []

    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    setProperties((current) => current.filter((existing) => existing.id !== id))
    setPropertyAmenities((current) => current.filter((link) => link.propertyId !== id))

    // Best-effort, deliberately not awaited: the property is already gone
    // from the DB and the admin's screen either way, so a Storage hiccup
    // here shouldn't surface as a failed delete. Only ever targets files
    // actually in our own 'property-images' bucket — external URLs (like
    // this project's seeded demo photos, which point at Pexels) are left
    // alone, since removePropertyImageFiles filters to our own bucket's
    // URL prefix before calling Storage at all.
    removePropertyImageFiles(imageUrls).catch((storageError) => {
      console.error('Failed to remove property images from storage:', storageError)
    })
  }

  // ---- images --------------------------------------------------------------

  async function setPropertyImages(propertyId, images) {
    const { data, error } = await supabase.rpc('set_property_images', {
      p_property_id: propertyId,
      p_images: images.map((image) => ({
        url: image.url,
        focal_x: image.focal_x ?? 0.5,
        focal_y: image.focal_y ?? 0.5,
      })),
    })
    if (error) {
      // P0002 is the function's own "property not found" signal (raised
      // when the row was deleted between this admin's earlier updateProperty
      // call and this one) — give it a message worth showing in a toast
      // rather than the raw Postgres text.
      if (error.code === 'P0002') {
        const notFoundError = new Error(
          'This property no longer exists — it may have been deleted by another admin.',
        )
        notFoundError.code = 'NOT_FOUND'
        throw notFoundError
      }
      throw error
    }

    const inserted = (data ?? []).map(normalizeImage)
    setProperties((current) =>
      current.map((property) =>
        property.id === propertyId ? { ...property, images: sortImages(inserted) } : property,
      ),
    )
  }

  // ---- property <-> amenity links --------------------------------------------

  function getAmenityIdsForProperty(propertyId) {
    return propertyAmenities.filter((link) => link.propertyId === propertyId).map((link) => link.amenityId)
  }

  async function setPropertyAmenityIds(propertyId, amenityIds) {
    const { error } = await supabase.rpc('set_property_amenities', {
      p_property_id: propertyId,
      p_amenity_ids: amenityIds,
    })
    if (error) {
      if (error.code === 'P0002') {
        const notFoundError = new Error(
          'This property no longer exists — it may have been deleted by another admin.',
        )
        notFoundError.code = 'NOT_FOUND'
        throw notFoundError
      }
      throw error
    }

    setPropertyAmenities((current) => [
      ...current.filter((link) => link.propertyId !== propertyId),
      ...amenityIds.map((amenityId) => ({ propertyId, amenityId })),
    ])
  }

  // ---- derived counts (used to block deletes while in use) --------------------

  function getPropertyCountForCategory(categoryId) {
    return properties.filter((property) => property.category_id === categoryId).length
  }

  function getPropertyCountForNeighborhood(neighborhoodId) {
    return properties.filter((property) => property.neighborhood_id === neighborhoodId).length
  }

  function getPropertyCountForSubcategory(subcategoryId) {
    return properties.filter((property) => property.subcategory_id === subcategoryId).length
  }

  function getPropertyCountForAmenity(amenityId) {
    return new Set(
      propertyAmenities.filter((link) => link.amenityId === amenityId).map((link) => link.propertyId),
    ).size
  }

  async function unassignSubcategoryFromProperties(subcategoryId) {
    const { error } = await supabase
      .from('properties')
      .update({ subcategory_id: null })
      .eq('subcategory_id', subcategoryId)
    if (error) throw error
    setProperties((current) =>
      current.map((property) =>
        property.subcategory_id === subcategoryId ? { ...property, subcategory_id: null } : property,
      ),
    )
  }

  // ---- featured on homepage ------------------------------------------------

  // `orderedIds` is the complete, final ordered list of ids that should be
  // featured for this listing type — the Featured admin page always sends
  // its whole current list (after any add/remove/drag), not a diff, which
  // keeps this the single source of truth rather than trying to reconcile
  // partial changes.
  async function updateFeaturedForListingType(listingType, orderedIds) {
    const currentlyFeaturedIds = properties
      .filter((property) => property.listing_type === listingType && property.featured_order !== null)
      .map((property) => property.id)
    const toClear = currentlyFeaturedIds.filter((id) => !orderedIds.includes(id))

    const results = await Promise.all([
      ...orderedIds.map((id, index) =>
        supabase.from('properties').update({ featured_order: index }).eq('id', id),
      ),
      ...toClear.map((id) => supabase.from('properties').update({ featured_order: null }).eq('id', id)),
    ])
    const firstError = results.find((result) => result.error)?.error
    if (firstError) throw firstError

    setProperties((current) =>
      current.map((property) => {
        const index = orderedIds.indexOf(property.id)
        if (index !== -1) return { ...property, featured_order: index }
        if (toClear.includes(property.id)) return { ...property, featured_order: null }
        return property
      }),
    )
  }

  const value = useMemo(
    () => ({
      properties,
      loading,
      addProperty,
      updateProperty,
      deleteProperty,
      setPropertyImages,
      getAmenityIdsForProperty,
      setPropertyAmenityIds,
      getPropertyCountForCategory,
      getPropertyCountForNeighborhood,
      getPropertyCountForSubcategory,
      getPropertyCountForAmenity,
      unassignSubcategoryFromProperties,
      updateFeaturedForListingType,
    }),
    [properties, propertyAmenities, loading],
  )

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>
}

export function useProperties() {
  const context = useContext(PropertiesContext)
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider')
  }
  return context
}
