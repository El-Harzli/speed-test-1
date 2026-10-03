import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router'
import { IoArrowBackOutline } from 'react-icons/io5'
import { useCatalog } from '../data/CatalogContext'
import { useProperties } from '../data/PropertiesContext'
import { useAgents } from '../data/AgentsContext'
import { useNeighborhoods } from '../data/NeighborhoodsContext'
import { useToast } from '../shared/ToastContext'
import useBodyScrollLock from '../shared/useBodyScrollLock'
import { uploadFile } from '../shared/uploadFile'
import { generateId } from '../shared/generateId'
import PropertyForm from './PropertyForm'

const FORM_ID = 'property-form'

export default function PropertyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { categories, amenities, getAmenityIdsForCategory, getSubcategoriesForCategory } = useCatalog()
  const {
    properties,
    addProperty,
    updateProperty,
    setPropertyImages,
    getAmenityIdsForProperty,
    setPropertyAmenityIds,
  } = useProperties()
  const { agents } = useAgents()
  const { neighborhoods } = useNeighborhoods()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useBodyScrollLock(true)

  const isEditMode = Boolean(id)
  const existingProperty = isEditMode ? properties.find((property) => property.id === id) : null

  // The properties list keeps its tab/category/status/search/sort state in
  // its own URL — navigating back into real browser history (rather than a
  // bare navigate to a fresh /admin/properties) is what restores it exactly
  // as it was, instead of resetting to "All" every time. `location.key ===
  // "default"` means this page was opened with no history before it in
  // this session (e.g. a direct link), so there's nothing to go back to.
  function goBackToProperties() {
    if (location.key === 'default') {
      navigate('/admin/properties')
    } else {
      navigate(-1)
    }
  }

  function handleCancel() {
    goBackToProperties()
  }

  async function handleSubmit({ amenityIds, images, ...fields }) {
    setIsSubmitting(true)
    try {
      // Any image still holding a local `file` hasn't been uploaded yet —
      // push it to Storage now and swap in the real public URL.
      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const focal = { focal_x: image.focal_x ?? 0.5, focal_y: image.focal_y ?? 0.5 }
          if (!image.file) return { url: image.url, ...focal }
          const path = `${generateId()}-${image.file.name}`
          const url = await uploadFile('property-images', path, image.file)
          return { url, ...focal }
        }),
      )

      if (isEditMode) {
        await updateProperty(existingProperty.id, fields, existingProperty.updated_at)
        await setPropertyImages(existingProperty.id, uploadedImages)
        await setPropertyAmenityIds(existingProperty.id, amenityIds)
        showToast('Property updated.')
      } else {
        const newId = await addProperty(fields)
        await setPropertyImages(newId, uploadedImages)
        await setPropertyAmenityIds(newId, amenityIds)
        showToast('Property added.')
      }
      goBackToProperties()
    } catch (error) {
      console.error(error)
      if (error?.code === 'NOT_FOUND') {
        // Nothing left to save to — the edit form doesn't make sense to
        // stay on, so leave rather than let them retry into the same wall.
        showToast(error.message, 'error')
        setIsSubmitting(false)
        goBackToProperties()
        return
      }
      if (error?.code === 'CONFLICT') {
        // Unlike NOT_FOUND, their edits might still be worth keeping (the
        // conflict could be on a field they didn't even touch) — stay on
        // the form rather than discard what they typed, and let them
        // decide whether to reload and reapply.
        showToast(error.message, 'error')
        setIsSubmitting(false)
        return
      }
      const detail = error?.message || error?.error_description || 'Unknown error'
      showToast(`Something went wrong saving this property: ${detail}`, 'error')
      setIsSubmitting(false)
    }
  }

  if (isEditMode && !existingProperty) {
    return (
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-primary-500 p-6 text-center">
        <p className="text-sm text-trenary">This property doesn&rsquo;t exist or was deleted.</p>
        <button
          type="button"
          onClick={() => navigate('/admin/properties')}
          className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
        >
          Back to properties
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-primary-500">
      <div className="flex items-center gap-3 border-b border-accent-500/10 bg-white px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Back to properties"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoArrowBackOutline size={18} />
        </button>
        <h2 className="truncate text-lg font-semibold text-main sm:text-xl">
          {isEditMode ? 'Edit property' : 'Add property'}
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-5 py-6 sm:px-6">
          <PropertyForm
            formId={FORM_ID}
            key={existingProperty?.id ?? 'create'}
            initialProperty={existingProperty}
            initialAmenityIds={isEditMode ? getAmenityIdsForProperty(existingProperty?.id) : []}
            categories={categories}
            amenities={amenities}
            agents={agents}
            neighborhoods={neighborhoods}
            getAmenityIdsForCategory={getAmenityIdsForCategory}
            getSubcategoriesForCategory={getSubcategoriesForCategory}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-accent-500/10 bg-white px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="rounded-[12px] border border-accent-500/10 px-4 py-2.5 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          form={FORM_ID}
          disabled={isSubmitting}
          className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}
