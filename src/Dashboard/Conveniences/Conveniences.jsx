import { useState } from 'react'
import { IoAddOutline, IoPencilOutline, IoTrashOutline, IoSparklesOutline } from 'react-icons/io5'
import { useCatalog } from '../data/CatalogContext'
import { useProperties } from '../data/PropertiesContext'
import { useToast } from '../shared/ToastContext'
import { getIconByKey } from '../shared/curatedIcons'
import Modal from '../shared/Modal'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import PageSpinner from '../shared/PageSpinner'
import AmenityForm from './AmenityForm'

export default function Conveniences() {
  const { amenities, loading, addAmenity, updateAmenity, deleteAmenity } = useCatalog()
  const { getPropertyCountForAmenity } = useProperties()
  const { showToast } = useToast()

  const [formState, setFormState] = useState(null) // null | { mode: 'create' } | { mode: 'edit', amenity }
  const [pendingDelete, setPendingDelete] = useState(null)

  const pendingDeleteUsageCount = pendingDelete ? getPropertyCountForAmenity(pendingDelete?.id) : 0
  const isDeleteBlocked = pendingDeleteUsageCount > 0

  function openCreate() {
    setFormState({ mode: 'create' })
  }

  function openEdit(amenity) {
    setFormState({ mode: 'edit', amenity })
  }

  function closeForm() {
    setFormState(null)
  }

  async function handleSubmit({ name, icon }) {
    try {
      if (formState?.mode === 'create') {
        await addAmenity({ name, icon })
        showToast('Amenity added.')
      } else {
        await updateAmenity(formState?.amenity?.id, { name, icon }, formState?.amenity?.updated_at)
        showToast('Amenity updated.')
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
        showToast(error.message, 'error')
        return
      }
      showToast('Something went wrong saving this amenity.', 'error')
    }
  }

  async function handleDelete() {
    if (isDeleteBlocked) return
    try {
      await deleteAmenity(pendingDelete?.id)
      showToast('Amenity deleted.')
      setPendingDelete(null)
    } catch (error) {
      console.error(error)
      showToast('Could not delete this amenity.', 'error')
    }
  }

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-main md:text-2xl">Conveniences</h2>
          <p className="mt-1 text-sm text-trenary">The amenities available to assign to categories and properties.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 shrink-0 items-center gap-2 rounded-[12px] bg-accent-500 px-4 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoAddOutline size={18} />
          <span className="hidden sm:inline">Add amenity</span>
        </button>
      </div>

      {amenities.length === 0 ? (
        <EmptyState
          icon={IoSparklesOutline}
          title="No amenities yet"
          description="Add amenities like Swimming pool or Garage, then assign them to categories."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Add amenity
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity) => {
            const Icon = getIconByKey(amenity.icon)
            return (
              <div
                key={amenity.id}
                className="flex items-center gap-3 rounded-[16px] border border-accent-500/10 bg-white p-4 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-primary-600 text-accent-500">
                  <Icon size={20} />
                </div>
                <p className="flex-1 truncate text-sm font-medium text-main">{amenity.name}</p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(amenity)}
                    aria-label={`Edit ${amenity.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <IoPencilOutline size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(amenity)}
                    aria-label={`Delete ${amenity.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <IoTrashOutline size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={formState !== null} onClose={closeForm} title={formState?.mode === 'edit' ? 'Edit amenity' : 'Add amenity'}>
        {formState && (
          <AmenityForm
            key={formState.mode === 'edit' ? formState.amenity.id : 'create'}
            initialAmenity={formState.mode === 'edit' ? formState.amenity : null}
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
            ? `${pendingDeleteUsageCount} propert${pendingDeleteUsageCount === 1 ? 'y uses' : 'ies use'} this amenity. Remove it from ${pendingDeleteUsageCount === 1 ? 'that listing' : 'those listings'} from the Properties page, then come back to delete it.`
            : "Removes it from every category it's currently assigned to. This can't be undone."
        }
        confirmLabel="Delete"
        blocked={isDeleteBlocked}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}