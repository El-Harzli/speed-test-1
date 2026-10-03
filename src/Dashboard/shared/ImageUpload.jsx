import { useEffect, useRef, useState } from 'react'
import { IoCameraOutline, IoImageOutline, IoCloseCircle, IoLocateOutline } from 'react-icons/io5'
import FocalPointEditor from './FocalPointEditor'

// Same blob-URL-revocation logic as AvatarUpload.jsx (that correctness
// matters — see the earlier bug where premature revocation broke uploaded
// images after save), just with a landscape rather than circular preview,
// for content like neighborhood photos rather than headshots.
function isLocalUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

// `focal` / `onFocalChange` are optional — only pass them where the photo
// actually gets cropped into a card downstream (currently: the
// neighborhood photo). Without them, the "Position" button just doesn't
// render, same as before this was added.
export default function ImageUpload({ value, onChange, focal, onFocalChange, preserveOnUnmountRef }) {
  const fileInputRef = useRef(null)
  const valueRef = useRef(value)
  valueRef.current = value
  const [isPositioning, setIsPositioning] = useState(false)

  useEffect(() => {
    return () => {
      if (preserveOnUnmountRef?.current) return
      if (isLocalUrl(valueRef.current)) URL.revokeObjectURL(valueRef.current)
    }
  }, [])

  function handleFile(file) {
    if (!file) return
    if (isLocalUrl(value)) URL.revokeObjectURL(value)
    onChange(URL.createObjectURL(file), file)
    // A new photo means the old focal point almost certainly doesn't apply
    // anymore — reset to center rather than carrying it over silently.
    onFocalChange?.(0.5, 0.5)
  }

  function handleRemove() {
    if (isLocalUrl(value)) URL.revokeObjectURL(value)
    onChange('', null)
    onFocalChange?.(0.5, 0.5)
  }

  const objectPosition = focal ? `${focal.x * 100}% ${focal.y * 100}%` : undefined

  return (
    <div className="flex flex-col gap-3">
      <div className="h-36 w-full overflow-hidden rounded-[16px] border border-accent-500/10 bg-primary-600">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" style={{ objectPosition }} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-trenary">
            <IoImageOutline size={28} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-[12px] border border-accent-500/10 px-3.5 py-2 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoCameraOutline size={16} />
          {value ? 'Change photo' : 'Add photo'}
        </button>
        {value && onFocalChange && (
          <button
            type="button"
            onClick={() => setIsPositioning(true)}
            className="flex items-center gap-1.5 rounded-[12px] border border-accent-500/10 px-3.5 py-2 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <IoLocateOutline size={16} />
            Position
          </button>
        )}
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove photo"
            className="flex items-center gap-1.5 rounded-[12px] px-3.5 py-2 text-sm font-medium text-trenary hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <IoCloseCircle size={16} />
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-trenary">JPG or PNG. Landscape photos look best.</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(event) => {
          if (event.target.files?.[0]) handleFile(event.target.files[0])
          event.target.value = ''
        }}
        className="hidden"
      />

      {onFocalChange && (
        <FocalPointEditor
          isOpen={isPositioning}
          imageUrl={value}
          initialFocal={focal}
          onCancel={() => setIsPositioning(false)}
          onSave={(nextFocal) => {
            onFocalChange(nextFocal.x, nextFocal.y)
            setIsPositioning(false)
          }}
        />
      )}
    </div>
  )
}
