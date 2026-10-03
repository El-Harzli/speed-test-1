import { useState } from 'react'
import IconPicker from '../shared/IconPicker'

export default function AmenityForm({ initialAmenity, onCancel, onSubmit }) {
  const [name, setName] = useState(initialAmenity?.name ?? '')
  const [icon, setIcon] = useState(initialAmenity?.icon ?? 'IoSparklesOutline')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim()) {
      setError('Give this amenity a name.')
      return
    }

    onSubmit({ name: name.trim(), icon })
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <div>
          <label htmlFor="amenity-name" className="mb-1.5 block text-sm font-medium text-secondary">
            Name
          </label>
          <input
            id="amenity-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (error) setError('')
            }}
            placeholder="e.g. Swimming pool"
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          {error && <p className="mt-1.5 text-sm text-accent-500">{error}</p>}
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Icon</span>
          <IconPicker value={icon} onChange={setIcon} />
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