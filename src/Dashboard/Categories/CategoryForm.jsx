import { useState } from 'react'
import IconPicker from '../shared/IconPicker'
import Toggle from '../shared/Toggle'
import AmenityMultiSelect from '../shared/AmenityMultiSelect'
import SubcategoryEditor from './SubcategoryEditor'

export default function CategoryForm({ initialCategory, initialAmenityIds, amenities, onCancel, onSubmit }) {
  const [name, setName] = useState(initialCategory?.name ?? '')
  const [icon, setIcon] = useState(initialCategory?.icon ?? 'IoHomeOutline')
  const [roomsFilterEnabled, setRoomsFilterEnabled] = useState(initialCategory?.rooms_filter_enabled ?? true)
  const [amenityIds, setAmenityIds] = useState(initialAmenityIds)
  const [error, setError] = useState('')

  function toggleAmenity(id) {
    setAmenityIds((current) => (current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Give this category a name.')
      return
    }

    onSubmit({ name: name.trim(), icon, rooms_filter_enabled: roomsFilterEnabled, amenityIds })
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <div>
          <label htmlFor="category-name" className="mb-1.5 block text-sm font-medium text-secondary">
            Name
          </label>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (error) setError('')
            }}
            placeholder="e.g. Villa"
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          {error && <p className="mt-1.5 text-sm text-accent-500">{error}</p>}
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        {initialCategory ? (
          <SubcategoryEditor categoryId={initialCategory?.id} />
        ) : (
          <div className="rounded-[16px] border border-dashed border-accent-500/20 px-4 py-3.5">
            <p className="text-sm font-medium text-main">Sub-types</p>
            <p className="mt-1 text-sm text-trenary">Save this category first, then reopen it here to add sub-types like Studio or Penthouse.</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-[16px] border border-accent-500/10 px-4 py-3.5">
          <div className="pr-4">
            <p className="text-sm font-medium text-main">Rooms filter</p>
            <p className="text-sm text-trenary">Show a &quot;rooms&quot; filter for this category on the public site.</p>
          </div>
          <Toggle checked={roomsFilterEnabled} onChange={setRoomsFilterEnabled} label="Rooms filter" />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Applicable amenities</span>
          <p className="mb-3 text-sm text-trenary">
            Only amenities selected here will be offered as filters for this category on the public site.
          </p>
          <AmenityMultiSelect
            amenities={amenities}
            selectedIds={amenityIds}
            onToggle={toggleAmenity}
            emptyMessage="Add amenities in Conveniences first, then come back to assign them here."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-accent-500/10 bg-white px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[12px] border border-accent-500/10 px-4 py-2.5 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          Save
        </button>
      </div>
    </form>
  )
}