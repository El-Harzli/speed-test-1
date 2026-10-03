import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, Reorder, useDragControls } from 'framer-motion'
import {
  IoCloudUploadOutline,
  IoCloseCircle,
  IoImageOutline,
  IoLocateOutline,
  IoReorderThreeOutline,
} from 'react-icons/io5'
import FocalPointEditor from '../shared/FocalPointEditor'

// Only locally-generated object URLs need revoking — remote URLs (from
// editing an existing property, or real Storage URLs) must never be
// passed to revokeObjectURL.
function isLocalUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

// A native HTML5 `draggable` grid (what this used before) only fires drag
// events on mouse input — touch devices never dispatch them at all, which
// is why reordering silently fell back to iOS's own long-press image menu
// instead. It also meant the hover-only Remove button stayed invisible
// but still clickable on touch, since there's no hover state to reveal
// it — an accidental tap in that corner would delete a photo with no
// visible target. Framer Motion's Reorder fixes both: it's pointer-based
// (works identically for mouse and touch), and only the small grab handle
// starts a drag (`dragListener={false}` + a dedicated handle), so tapping
// the photo itself does nothing and Position/Remove are their own
// always-visible buttons. This is the same fix already applied to
// Featured.jsx — see the comment there.
//
// One consequence: Reorder only reorders reliably along a single axis, so
// this is a horizontally-scrolling strip rather than a wrapping grid —
// a wrapping multi-row grid doesn't have a well-defined "the item is
// between these two" order to fall back to, e.g. what does dragging into
// row 2 mean for the item's new position?
function GalleryTile({ image, isCover, onPosition, onRemove, onDragEnd }) {
  const dragControls = useDragControls()
  const objectPosition = `${(image.focal_x ?? 0.5) * 100}% ${(image.focal_y ?? 0.5) * 100}%`

  return (
    <Reorder.Item
      value={image.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={onDragEnd}
      className="relative h-28 w-28 shrink-0 select-none overflow-hidden rounded-[16px] border border-accent-500/10 bg-primary-600"
    >
      <img src={image.url} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />

      {isCover && (
        <span className="absolute left-1.5 top-1.5 rounded-full bg-accent-500 px-2 py-0.5 text-[10px] font-medium text-white">
          Cover
        </span>
      )}

      <span
        onPointerDown={(event) => dragControls.start(event)}
        aria-hidden="true"
        className="absolute bottom-1.5 left-1.5 flex h-6 w-6 touch-none cursor-grab items-center justify-center rounded-full bg-black/55 text-white active:cursor-grabbing"
      >
        <IoReorderThreeOutline size={14} />
      </span>

      <button
        type="button"
        onClick={onPosition}
        aria-label="Set photo position"
        className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <IoLocateOutline size={14} />
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <IoCloseCircle size={16} />
      </button>
    </Reorder.Item>
  )
}

export default function ImageGallery({ images, onChange, preserveOnUnmountRef }) {
  const fileInputRef = useRef(null)
  const [positioningId, setPositioningId] = useState(null)
  const imagesRef = useRef(images)
  imagesRef.current = images

  // The order shown live during a drag — synced from `images` whenever it
  // changes from outside a drag (add/remove/position). Reorder.Group
  // drives this live via onReorder; the actual sort_order commit happens
  // once, on drop — same pattern as Featured.jsx's orderedIds.
  const [orderedIds, setOrderedIds] = useState(() => images.map((image) => image.id))
  useEffect(() => {
    setOrderedIds(images.map((image) => image.id))
  }, [images])

  const imagesById = useMemo(() => new Map(images.map((image) => [image.id, image])), [images])
  const displayedImages = orderedIds.map((id) => imagesById.get(id)).filter(Boolean)

  useEffect(() => {
    return () => {
      if (preserveOnUnmountRef?.current) return
      imagesRef.current.forEach((image) => {
        if (isLocalUrl(image?.url)) URL.revokeObjectURL(image.url)
      })
    }
  }, [])

  function handleFiles(fileList) {
    const files = Array.from(fileList)
    const newImages = files.map((file, index) => ({
      id: `local-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      url: URL.createObjectURL(file),
      file,
      sort_order: images.length + index,
      // Default to dead-center until the admin explicitly repositions it —
      // matches plain `object-fit: cover` behavior, so nothing looks
      // different for photos nobody's bothered to adjust.
      focal_x: 0.5,
      focal_y: 0.5,
    }))
    onChange([...images, ...newImages])
  }

  function handleRemove(id) {
    const removed = images.find((image) => image.id === id)
    if (isLocalUrl(removed?.url)) URL.revokeObjectURL(removed?.url)
    const next = images.filter((image) => image.id !== id).map((image, index) => ({ ...image, sort_order: index }))
    onChange(next)
  }

  function handleFocalSave(id, focal) {
    onChange(images.map((image) => (image.id === id ? { ...image, focal_x: focal.x, focal_y: focal.y } : image)))
    setPositioningId(null)
  }

  function handleDragEnd() {
    onChange(orderedIds.map((id, index) => ({ ...imagesById.get(id), sort_order: index })))
  }

  const positioningImage = images.find((image) => image.id === positioningId) ?? null

  return (
    <div>
      <motion.div layoutScroll className="flex gap-3 overflow-x-auto pb-2">
        {images.length > 0 && (
          <Reorder.Group axis="x" values={orderedIds} onReorder={setOrderedIds} className="flex gap-3">
            {displayedImages.map((image, index) => (
              <GalleryTile
                key={image.id}
                image={image}
                isCover={index === 0}
                onPosition={() => setPositioningId(image.id)}
                onRemove={() => handleRemove(image.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Reorder.Group>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1.5 rounded-[16px] border border-dashed border-accent-500/20 text-secondary transition-colors hover:border-accent-500/40 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoCloudUploadOutline size={20} />
          <span className="text-xs font-medium">Add photos</span>
        </button>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          if (event.target.files?.length) handleFiles(event.target.files)
          event.target.value = ''
        }}
        className="hidden"
      />

      <p className="mt-3 flex items-center gap-1.5 text-sm text-trenary">
        <IoImageOutline size={16} />
        {images.length === 0
          ? 'No photos yet — the first photo you add becomes the cover image.'
          : 'Drag the handle to reorder. The first photo is the cover image.'}
      </p>

      <FocalPointEditor
        isOpen={positioningImage !== null}
        imageUrl={positioningImage?.url}
        initialFocal={
          positioningImage ? { x: positioningImage.focal_x ?? 0.5, y: positioningImage.focal_y ?? 0.5 } : undefined
        }
        onCancel={() => setPositioningId(null)}
        onSave={(focal) => handleFocalSave(positioningId, focal)}
      />
    </div>
  )
}
