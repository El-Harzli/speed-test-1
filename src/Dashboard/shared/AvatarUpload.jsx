import { useEffect, useRef } from 'react'
import { IoCameraOutline, IoPersonOutline, IoCloseCircle } from 'react-icons/io5'

// Only locally-generated object URLs need revoking — remote URLs (seed
// agents, or eventually real Storage URLs) must never be passed to
// revokeObjectURL.
function isLocalUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

export default function AvatarUpload({ value, onChange, preserveOnUnmountRef }) {
  const fileInputRef = useRef(null)
  const valueRef = useRef(value)
  valueRef.current = value

  // Revoke a still-held local object URL when the field unmounts — covers
  // cancelling the form or navigating away without saving.
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
  }

  function handleRemove() {
    if (isLocalUrl(value)) URL.revokeObjectURL(value)
    onChange('', null)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border border-accent-500/10 bg-primary-600">
        {value ? (
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-trenary">
            <IoPersonOutline size={28} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-[12px] border border-accent-500/10 px-3.5 py-2 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          >
            <IoCameraOutline size={16} />
            {value ? 'Change photo' : 'Add photo'}
          </button>
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
        <p className="text-xs text-trenary">JPG or PNG. Square photos look best.</p>
      </div>

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
    </div>
  )
}