import { useState } from 'react'
import { IoAddOutline, IoPencilOutline, IoTrashOutline, IoPricetagsOutline } from 'react-icons/io5'
import { useCatalog } from '../data/CatalogContext'
import { useProperties } from '../data/PropertiesContext'
import { useToast } from '../shared/ToastContext'
import { getIconByKey } from '../shared/curatedIcons'
import Modal from '../shared/Modal'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import PageSpinner from '../shared/PageSpinner'
import CategoryForm from './CategoryForm'

export default function Categories() {
  const {
    categories,
    amenities,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    getAmenityIdsForCategory,
    setCategoryAmenityIds,
    getSubcategoriesForCategory,
  } = useCatalog()
  const { properties, getPropertyCountForCategory } = useProperties()
  const { showToast } = useToast()

  const [formState, setFormState] = useState(null) // null | { mode: 'create' } | { mode: 'edit', category }
  const [pendingDelete, setPendingDelete] = useState(null)

  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)
  const pendingDeleteUsageCount = pendingDelete ? getPropertyCountForCategory(pendingDelete?.id) : 0
  const pendingDeleteSubcategoryCount = pendingDelete ? getSubcategoriesForCategory(pendingDelete?.id).length : 0
  const isDeleteBlocked = pendingDeleteUsageCount > 0

  function openCreate() {
    setFormState({ mode: 'create' })
  }

  function openEdit(category) {
    setFormState({ mode: 'edit', category })
  }

  function closeForm() {
    setFormState(null)
  }

  async function handleSubmit({ name, icon, rooms_filter_enabled, amenityIds }) {
    try {
      if (formState?.mode === 'create') {
        const id = await addCategory({ name, icon, rooms_filter_enabled })
        await setCategoryAmenityIds(id, amenityIds)
        showToast('Category added.')
      } else {
        await updateCategory(
          formState?.category?.id,
          { name, icon, rooms_filter_enabled },
          formState?.category?.updated_at,
        )
        await setCategoryAmenityIds(formState?.category?.id, amenityIds)
        showToast('Category updated.')
      }
      closeForm()
    } catch (error) {
      console.error(error)
      if (error?.code === 'NOT_FOUND') {
        showToast(error.message, 'error')
        closeForm()
        return
      }
      if (error?.code === 'CONFLICT') {
        // Leave the form open — their edits might still be worth keeping,
        // it's their call whether to reload and reapply or save again.
        showToast(error.message, 'error')
        return
      }
      showToast('Something went wrong saving this category.', 'error')
    }
  }

  async function handleDelete() {
    if (isDeleteBlocked) return
    try {
      await deleteCategory(pendingDelete?.id)
      showToast('Category deleted.')
      setPendingDelete(null)
    } catch (error) {
      console.error(error)
      showToast('Could not delete this category.', 'error')
    }
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-main md:text-2xl">Categories</h2>
          <p className="mt-1 text-sm text-trenary">
            Property types shown on the public site, each with the amenities that apply to it.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 shrink-0 items-center gap-2 rounded-[12px] bg-accent-500 px-4 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoAddOutline size={18} />
          <span className="hidden sm:inline">Add category</span>
        </button>
      </div>

      {sortedCategories.length === 0 ? (
        <EmptyState
          icon={IoPricetagsOutline}
          title="No categories yet"
          description="Add your first property type — Villa, Apartment, Commercial — to start organizing listings."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Add category
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedCategories.map((category) => {
            const Icon = getIconByKey(category.icon)
            const amenityCount = getAmenityIdsForCategory(category.id).length
            const subcategoryCount = getSubcategoriesForCategory(category.id).length
            const listingCount = properties.filter((property) => property.category_id === category.id).length

            return (
              <div
                key={category.id}
                className="rounded-[16px] border border-accent-500/10 bg-white p-5 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-primary-600 text-accent-500">
                    <Icon size={20} />
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(category)}
                      aria-label={`Edit ${category.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <IoPencilOutline size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(category)}
                      aria-label={`Delete ${category.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <IoTrashOutline size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="mt-4 text-base font-semibold text-main">{category.name}</h3>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {category.rooms_filter_enabled && (
                    <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-medium text-main">
                      Rooms filter
                    </span>
                  )}
                  <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-secondary">
                    {amenityCount} amenit{amenityCount === 1 ? 'y' : 'ies'}
                  </span>
                  {subcategoryCount > 0 && (
                    <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-secondary">
                      {subcategoryCount} sub-type{subcategoryCount === 1 ? '' : 's'}
                    </span>
                  )}
                  {listingCount > 0 && (
                    <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-medium text-secondary">
                      {listingCount} listing{listingCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={formState !== null} onClose={closeForm} title={formState?.mode === 'edit' ? 'Edit category' : 'Add category'}>
        {formState && (
          <CategoryForm
            key={formState.mode === 'edit' ? formState.category.id : 'create'}
            initialCategory={formState.mode === 'edit' ? formState.category : null}
            initialAmenityIds={formState.mode === 'edit' ? getAmenityIdsForCategory(formState.category.id) : []}
            amenities={amenities}
            onCancel={closeForm}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={isDeleteBlocked ? `Can't delete "${pendingDelete?.name}"` : `Delete "${pendingDelete?.name}"?`}
        description={
          isDeleteBlocked
            ? `${pendingDeleteUsageCount} propert${pendingDeleteUsageCount === 1 ? 'y uses' : 'ies use'} this category. Reassign ${pendingDeleteUsageCount === 1 ? 'it' : 'them'} to a different category from the Properties page, then come back to delete this one.`
            : pendingDeleteSubcategoryCount > 0
              ? `This removes the category, its amenity list, and its ${pendingDeleteSubcategoryCount} sub-type${pendingDeleteSubcategoryCount === 1 ? '' : 's'}. This can't be undone.`
              : "This removes the category and its amenity list. This can't be undone."
        }
        confirmLabel="Delete"
        blocked={isDeleteBlocked}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
