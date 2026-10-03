import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { updateWithConcurrencyCheck } from '../../lib/updateWithConcurrencyCheck'
import { fetchAllWithRetry } from '../../lib/fetchAllWithRetry'
import { useToast } from '../shared/ToastContext'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [amenities, setAmenities] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [categoryAmenities, setCategoryAmenities] = useState([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const [categoriesRes, amenitiesRes, subcategoriesRes, linksRes] = await fetchAllWithRetry([
        () => supabase.from('categories').select('*').order('sort_order', { ascending: true }),
        () => supabase.from('amenities').select('*').order('name', { ascending: true }),
        () => supabase.from('subcategories').select('*').order('sort_order', { ascending: true }),
        () => supabase.from('category_amenities').select('*'),
      ])

      if (!active) return

      const firstError = categoriesRes.error || amenitiesRes.error || subcategoriesRes.error || linksRes.error
      if (firstError) {
        console.error(firstError)
        showToast('Could not load categories & amenities.', 'error')
        setLoading(false)
        return
      }

      setCategories(categoriesRes.data)
      setAmenities(amenitiesRes.data)
      setSubcategories(subcategoriesRes.data)
      setCategoryAmenities(
        linksRes.data.map((link) => ({ categoryId: link.category_id, amenityId: link.amenity_id })),
      )
      setLoading(false)
    }

    load()
    return () => {
      active = false
    }
  }, [])

  // ---- categories ----------------------------------------------------

  async function addCategory({ name, icon, rooms_filter_enabled }) {
    const sort_order = categories.length
      ? Math.max(...categories.map((category) => category.sort_order)) + 1
      : 1
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, icon, rooms_filter_enabled, sort_order })
      .select()
      .single()
    if (error) throw error
    setCategories((current) => [...current, data])
    return data.id
  }

  async function updateCategory(id, patch, expectedUpdatedAt) {
    const category = await updateWithConcurrencyCheck('categories', id, patch, expectedUpdatedAt, 'category')
    setCategories((current) => current.map((existing) => (existing.id === id ? category : existing)))
    return category
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    // The DB cascades subcategories & category_amenities on delete — mirror that locally.
    setCategories((current) => current.filter((category) => category.id !== id))
    setSubcategories((current) => current.filter((subcategory) => subcategory.category_id !== id))
    setCategoryAmenities((current) => current.filter((link) => link.categoryId !== id))
  }

  // ---- amenities -------------------------------------------------------

  async function addAmenity({ name, icon }) {
    const { data, error } = await supabase.from('amenities').insert({ name, icon }).select().single()
    if (error) throw error
    setAmenities((current) => [...current, data])
    return data.id
  }

  async function updateAmenity(id, patch, expectedUpdatedAt) {
    const amenity = await updateWithConcurrencyCheck('amenities', id, patch, expectedUpdatedAt, 'amenity')
    setAmenities((current) => current.map((existing) => (existing.id === id ? amenity : existing)))
    return amenity
  }

  async function deleteAmenity(id) {
    const { error } = await supabase.from('amenities').delete().eq('id', id)
    if (error) throw error
    setAmenities((current) => current.filter((amenity) => amenity.id !== id))
    setCategoryAmenities((current) => current.filter((link) => link.amenityId !== id))
  }

  // ---- category <-> amenity links --------------------------------------

  function getAmenityIdsForCategory(categoryId) {
    return categoryAmenities.filter((link) => link.categoryId === categoryId).map((link) => link.amenityId)
  }

  async function setCategoryAmenityIds(categoryId, amenityIds) {
    const { error } = await supabase.rpc('set_category_amenities', {
      p_category_id: categoryId,
      p_amenity_ids: amenityIds,
    })
    if (error) {
      if (error.code === 'P0002') {
        const notFoundError = new Error(
          'This category no longer exists — it may have been deleted by another admin.',
        )
        notFoundError.code = 'NOT_FOUND'
        throw notFoundError
      }
      throw error
    }

    setCategoryAmenities((current) => [
      ...current.filter((link) => link.categoryId !== categoryId),
      ...amenityIds.map((amenityId) => ({ categoryId, amenityId })),
    ])
  }

  // ---- subcategories -----------------------------------------------------

  function getSubcategoriesForCategory(categoryId) {
    return subcategories
      .filter((subcategory) => subcategory.category_id === categoryId)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  async function addSubcategory({ category_id, name }) {
    const siblingOrders = subcategories
      .filter((subcategory) => subcategory.category_id === category_id)
      .map((subcategory) => subcategory.sort_order)
    const sort_order = siblingOrders.length ? Math.max(...siblingOrders) + 1 : 1

    const { data, error } = await supabase
      .from('subcategories')
      .insert({ category_id, name, sort_order })
      .select()
      .single()
    if (error) throw error
    setSubcategories((current) => [...current, data])
    return data.id
  }

  async function updateSubcategory(id, patch, expectedUpdatedAt) {
    const subcategory = await updateWithConcurrencyCheck(
      'subcategories',
      id,
      patch,
      expectedUpdatedAt,
      'subcategory',
    )
    setSubcategories((current) =>
      current.map((existing) => (existing.id === id ? subcategory : existing)),
    )
    return subcategory
  }

  async function deleteSubcategory(id) {
    const { error } = await supabase.from('subcategories').delete().eq('id', id)
    if (error) throw error
    setSubcategories((current) => current.filter((subcategory) => subcategory.id !== id))
  }

  const value = useMemo(
    () => ({
      categories,
      amenities,
      subcategories,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addAmenity,
      updateAmenity,
      deleteAmenity,
      getAmenityIdsForCategory,
      setCategoryAmenityIds,
      getSubcategoriesForCategory,
      addSubcategory,
      updateSubcategory,
      deleteSubcategory,
    }),
    [categories, amenities, subcategories, categoryAmenities, loading],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}
