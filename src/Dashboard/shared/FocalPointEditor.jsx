import { useEffect, useRef, useState } from 'react'
import { IoLocateOutline } from 'react-icons/io5'
import Modal from './Modal'

// Lets the admin choose which part of a photo stays visible when it gets
// center-cropped into a fixed-aspect card (property listing cards,
// neighborhood tiles, etc). Those cards all render with `object-fit:
// cover` and read this point back via `object-position` — one saved
// point works correctly at *every* card aspect ratio (mobile square vs
// desktop wide, say) because `object-position` is resolved by the browser
// per-container at render time, not baked into a fixed crop rectangle.
// That's also why there are two live preview swatches below: to make that
// "same point, different shapes" behavior visible immediately, rather than
// asking the admin to just trust it.
export default function FocalPointEditor({ isOpen, imageUrl, initialFocal, onCancel, onSave }) {
  const [focal, setFocal] = useState(initialFocal ?? { x: 0.5, y: 0.5 })
  const containerRef = useRef(null)

  // Re-sync whenever the editor opens — covers both "opened for a
  // different image" and "reopened for the same image after a cancel".
  useEffect(() => {
    if (isOpen) setFocal(initialFocal ?? { x: 0.5, y: 0.5 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, imageUrl])

  function updateFromPointer(event) {
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    setFocal({ x, y })
  }

  function handlePointerDown(event) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event)
  }

  function handlePointerMove(event) {
    if (event.buttons !== 1) return
    updateFromPointer(event)
  }

  const objectPosition = `${focal.x * 100}% ${focal.y * 100}%`

  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Set photo position">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <p className="text-sm text-trenary">
          Click or drag on the photo to mark the part that should always stay visible when it&rsquo;s cropped
          into a card.
        </p>

        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          className="relative aspect-[4/3] w-full touch-none overflow-hidden rounded-[16px] border border-accent-500/10 bg-primary-600"
        >
          <img src={imageUrl} alt="" draggable={false} className="pointer-events-none h-full w-full select-none object-contain" />
          <div
            className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent-500 shadow-[0_0_0_1.5px_rgba(0,0,0,0.45)]"
            style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
          />
        </div>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-secondary">
            <IoLocateOutline size={14} />
            Preview at different card shapes
          </p>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-[12px] border border-accent-500/10 bg-primary-600">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
              </div>
              <p className="text-center text-[11px] text-trenary">Wide card (desktop)</p>
            </div>
            <div className="flex-1 space-y-1.5">
              <div className="aspect-square w-full overflow-hidden rounded-[12px] border border-accent-500/10 bg-primary-600">
                <img src={imageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
              </div>
              <p className="text-center text-[11px] text-trenary">Square card (mobile)</p>
            </div>
          </div>
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
          type="button"
          onClick={() => onSave(focal)}
          className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          Save position
        </button>
      </div>
    </Modal>
  )
}
