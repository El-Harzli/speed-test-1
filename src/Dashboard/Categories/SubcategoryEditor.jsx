import { useState } from 'react'
import { IoAddOutline, IoCheckmark, IoClose, IoPencilOutline, IoTrashOutline } from 'react-icons/io5'
import { useCatalog } from '../data/CatalogContext'
import { useProperties } from '../data/PropertiesContext'
import { useToast } from '../shared/ToastContext'
import ConfirmDialog from '../shared/ConfirmDialog'

export default function SubcategoryEditor({ categoryId }) {
  const { getSubcategoriesForCategory, addSubcategory, updateSubcategory, deleteSubcategory } = useCatalog()
  const { getPropertyCountForSubcategory, unassignSubcategoryFromProperties } = useProperties()
  const { showToast } = useToast()

  const subcategories = getSubcategoriesForCategory(categoryId)

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [editingUpdatedAt, setEditingUpdatedAt] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const pendingDeleteUsageCount = pendingDelete ? getPropertyCountForSubcategory(pendingDelete?.id) : 0

  async function handleAdd() {
    const trimmed = newName.trim()
    if (!trimmed) return
    try {
      await addSubcategory({ category_id: categoryId, name: trimmed })
      setNewName('')
      showToast('Sub-type added.')
    } catch (error) {
      console.error(error)
      showToast('Could not add sub-type.', 'error')
    }
  }

  function startEditing(subcategory) {
    setEditingId(subcategory.id)
    setEditingName(subcategory.name)
    setEditingUpdatedAt(subcategory.updated_at)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName('')
    setEditingUpdatedAt(null)
  }

  async function saveEditing() {
    const trimmed = editingName.trim()
    if (!trimmed) return
    try {
      await updateSubcategory(editingId, { name: trimmed }, editingUpdatedAt)
      showToast('Sub-type updated.')
      setEditingId(null)
      setEditingName('')
      setEditingUpdatedAt(null)
    } catch (error) {
      console.error(error)
      if (error?.code === 'NOT_FOUND') {
        // Nothing left to edit — same cleanup as a normal cancel.
        showToast(error.message, 'error')
        cancelEditing()
        return
      }
      if (error?.code === 'CONFLICT') {
        // Leave editing open — their typed name might still be worth
        // keeping, it's their call whether to reload and reapply.
        showToast(error.message, 'error')
        return
      }
      showToast('Could not update sub-type.', 'error')
    }
  }

  async function handleDelete() {
    try {
      await unassignSubcategoryFromProperties(pendingDelete?.id)
      await deleteSubcategory(pendingDelete?.id)
      showToast('Sub-type deleted.')
      setPendingDelete(null)
    } catch (error) {
      console.error(error)
      showToast('Could not delete sub-type.', 'error')
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-secondary">Sub-types</span>
      <p className="mb-3 text-sm text-trenary">
        Optional finer-grained types within this category, e.g. Studio or Penthouse within Apartment.
      </p>

      {subcategories.length === 0 && !newName && (
        <p className="mb-3 text-sm text-trenary">No sub-types yet — add one below if this category needs them.</p>
      )}

      {subcategories.length > 0 && (
        <ul className="mb-3 divide-y divide-accent-500/10 overflow-hidden rounded-[12px] border border-accent-500/10">
          {subcategories.map((subcategory) => (
            <li key={subcategory.id} className="flex items-center gap-2 bg-primary-500 px-3 py-2">
              {editingId === subcategory.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') saveEditing()
                      if (event.key === 'Escape') cancelEditing()
                    }}
                    className="min-w-0 flex-1 rounded-[10px] border border-accent-500/10 bg-white px-3 py-1.5 text-sm text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  />
                  <button
                    type="button"
                    onClick={saveEditing}
                    aria-label="Save sub-type name"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <IoCheckmark size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    aria-label="Cancel editing"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <IoClose size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <p className="flex-1 truncate text-sm text-main">{subcategory.name}</p>
                  <button
                    type="button"
                    onClick={() => startEditing(subcategory)}
                    aria-label={`Rename ${subcategory.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <IoPencilOutline size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(subcategory)}
                    aria-label={`Delete ${subcategory.name}`}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <IoTrashOutline size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleAdd()
          }}
          placeholder="e.g. Studio"
          className="min-w-0 flex-1 rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-2.5 text-sm text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-[12px] bg-accent-500 px-3.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IoAddOutline size={16} />
          Add
        </button>
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={`Delete "${pendingDelete?.name}"?`}
        description={
          pendingDeleteUsageCount > 0
            ? `Used on ${pendingDeleteUsageCount} propert${pendingDeleteUsageCount === 1 ? 'y' : 'ies'} — those will lose this sub-type but keep their category. This can't be undone.`
            : "This can't be undone."
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
