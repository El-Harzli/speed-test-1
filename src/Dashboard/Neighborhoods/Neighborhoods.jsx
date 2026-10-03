import { useEffect, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import {
  IoAddOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoLocationOutline,
  IoReorderThreeOutline,
  IoImageOutline,
} from 'react-icons/io5'
import { useNeighborhoods } from '../data/NeighborhoodsContext'
import { useProperties } from '../data/PropertiesContext'
import { useToast } from '../shared/ToastContext'
import { uploadFile } from '../shared/uploadFile'
import { generateId } from '../shared/generateId'
import Modal from '../shared/Modal'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import PageSpinner from '../shared/PageSpinner'
import NeighborhoodForm from './NeighborhoodForm'

function NeighborhoodRow({ neighborhood, onEdit, onDelete, onDragEnd }) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={neighborhood.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      className="flex items-center gap-3 rounded-[16px] border border-accent-500/10 bg-white p-3 select-none"
    >
      <span
        onPointerDown={(event) => dragControls.start(event)}
        className="cursor-grab touch-none text-secondary/50 active:cursor-grabbing"
        aria-hidden="true"
      >
        <IoReorderThreeOutline size={20} />
      </span>
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-primary-600">
        {neighborhood.image_url ? (
          <img src={neighborhood.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-secondary/40">
            <IoImageOutline size={18} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-main">{neighborhood.name}</p>
        {neighborhood.description && (
          <p className="truncate text-xs text-trenary">{neighborhood.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={() => onEdit(neighborhood)}
          aria-label={`Edit ${neighborhood.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoPencilOutline size={16} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(neighborhood)}
          aria-label={`Delete ${neighborhood.name}`}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoTrashOutline size={16} />
        </button>
      </div>
    </Reorder.Item>
  )
}

export default function Neighborhoods() {
  const { neighborhoods, loading, addNeighborhood, updateNeighborhood, deleteNeighborhood, reorderNeighborhoods } =
    useNeighborhoods()
  const { getPropertyCountForNeighborhood } = useProperties()
  const { showToast } = useToast()

  const [formState, setFormState] = useState(null) // null | { mode: 'create' } | { mode: 'edit', neighborhood }
  const [pendingDelete, setPendingDelete] = useState(null)
  const pendingDeleteUsageCount = pendingDelete ? getPropertyCountForNeighborhood(pendingDelete.id) : 0
  const isDeleteBlocked = pendingDeleteUsageCount > 0

  // The displayed order while dragging — kept in sync with `neighborhoods`
  // (from Supabase via context) whenever it changes from outside a drag,
  // e.g. after an add/delete. Same pattern as the Featured Properties
  // admin page.
  const [orderedIds, setOrderedIds] = useState([])
  useEffect(() => {
    setOrderedIds(neighborhoods.map((n) => n.id))
  }, [neighborhoods])

  function openCreate() {
    setFormState({ mode: 'create' })
  }

  function openEdit(neighborhood) {
    setFormState({ mode: 'edit', neighborhood })
  }

  function closeForm() {
    setFormState(null)
  }

  async function handleSubmit({ name, description, image_url, imageFile, focal_x, focal_y }) {
    try {
      let finalImageUrl = image_url
      if (imageFile) {
        const path = `${generateId()}-${imageFile.name}`
        finalImageUrl = await uploadFile('neighborhood-images', path, imageFile)
      }

      if (formState?.mode === 'create') {
        await addNeighborhood({ name, description, image_url: finalImageUrl, focal_x, focal_y })
        showToast('Neighborhood added.')
      } else {
        await updateNeighborhood(
          formState?.neighborhood?.id,
          {
            name,
            description,
            image_url: finalImageUrl,
            focal_x,
            focal_y,
          },
          formState?.neighborhood?.updated_at,
        )
        showToast('Neighborhood updated.')
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
      const detail = error?.message || error?.error_description || 'Unknown error'
      showToast(`Something went wrong saving this neighborhood: ${detail}`, 'error')
    }
  }

  async function handleDelete() {
    try {
      await deleteNeighborhood(pendingDelete?.id)
      showToast('Neighborhood deleted.')
      setPendingDelete(null)
    } catch (error) {
      console.error(error)
      showToast('Could not delete this neighborhood.', 'error')
    }
  }

  async function handleReorderCommit() {
    try {
      await reorderNeighborhoods(orderedIds)
      showToast('Updated the order.')
    } catch (error) {
      console.error(error)
      showToast('Could not save the new order.', 'error')
    }
  }

  const neighborhoodsById = new Map(neighborhoods.map((n) => [n.id, n]))
  const displayedNeighborhoods = orderedIds.map((id) => neighborhoodsById.get(id)).filter(Boolean)

  if (loading) {
    return <PageSpinner />
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-main md:text-2xl">Neighborhoods</h2>
          <p className="mt-1 text-sm text-trenary">
            Districts shown on the homepage teaser and the public /neighborhoods page. Drag to reorder —
            the first 3 appear on the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex h-11 shrink-0 items-center gap-2 rounded-[12px] bg-accent-500 px-4 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoAddOutline size={18} />
          <span className="hidden sm:inline">Add neighborhood</span>
        </button>
      </div>

      {displayedNeighborhoods.length === 0 ? (
        <EmptyState
          icon={IoLocationOutline}
          title="No neighborhoods yet"
          description="Add districts like Malabata or California to showcase on the homepage and their own page."
          action={
            <button
              type="button"
              onClick={openCreate}
              className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Add neighborhood
            </button>
          }
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={orderedIds}
          onReorder={setOrderedIds}
          className="flex flex-col gap-2"
        >
          {displayedNeighborhoods.map((neighborhood) => (
            <NeighborhoodRow
              key={neighborhood.id}
              neighborhood={neighborhood}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onDragEnd={handleReorderCommit}
            />
          ))}
        </Reorder.Group>
      )}

      <Modal
        isOpen={formState !== null}
        onClose={closeForm}
        title={formState?.mode === 'edit' ? 'Edit neighborhood' : 'Add neighborhood'}
      >
        {formState && (
          <NeighborhoodForm
            key={formState.mode === 'edit' ? formState.neighborhood.id : 'create'}
            initialNeighborhood={formState.mode === 'edit' ? formState.neighborhood : null}
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
            ? `${pendingDeleteUsageCount} propert${pendingDeleteUsageCount === 1 ? 'y is' : 'ies are'} assigned to this neighborhood. Reassign ${pendingDeleteUsageCount === 1 ? 'it' : 'them'} to a different neighborhood from the Properties page, then come back to delete this one.`
            : "Removes it from the homepage and the /neighborhoods page. This can't be undone."
        }
        confirmLabel="Delete"
        blocked={isDeleteBlocked}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
