import { useState } from 'react'
import { IoOptionsOutline } from 'react-icons/io5'
import Modal from '../shared/Modal'
import { OPTIONAL_COLUMNS } from './tableColumns'

// Uses the shared Modal (a proper bottom sheet on mobile, a centered
// dialog on larger screens) instead of a custom absolutely-positioned
// dropdown — the dropdown anchored to the trigger button, which broke as
// soon as the button wasn't at the edge of a wide row anymore (e.g. its
// own row on mobile), overlapping content underneath instead of behaving
// like a real menu.
export default function ColumnSettingsMenu({ visibleColumns, onChange }) {
  const [open, setOpen] = useState(false)

  function toggle(key) {
    const next = new Set(visibleColumns)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange(next)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Table settings"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] border border-accent-500/10 text-secondary transition-colors hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
      >
        <IoOptionsOutline size={18} />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Visible columns">
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          {OPTIONAL_COLUMNS.map((column) => (
            <label
              key={column.key}
              className="flex cursor-pointer items-center gap-3 rounded-[12px] px-3 py-3 text-sm text-main hover:bg-primary-600/40"
            >
              <input
                type="checkbox"
                checked={visibleColumns.has(column.key)}
                onChange={() => toggle(column.key)}
                className="h-4 w-4 rounded accent-accent-500"
              />
              {column.label}
            </label>
          ))}
        </div>
      </Modal>
    </>
  )
}
