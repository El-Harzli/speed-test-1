import { useRef, useState } from 'react'
import ImageUpload from '../shared/ImageUpload'

export default function NeighborhoodForm({ initialNeighborhood, onCancel, onSubmit }) {
  const [name, setName] = useState(initialNeighborhood?.name ?? '')
  const [description, setDescription] = useState(initialNeighborhood?.description ?? '')
  const [imageUrl, setImageUrl] = useState(initialNeighborhood?.image_url ?? '')
  const [imageFile, setImageFile] = useState(null)
  const [focal, setFocal] = useState({
    x: initialNeighborhood?.focal_x ?? 0.5,
    y: initialNeighborhood?.focal_y ?? 0.5,
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const preserveImageRef = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Give this district a name.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    preserveImageRef.current = true
    setIsSubmitting(true)
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      image_url: imageUrl,
      imageFile,
      focal_x: focal.x,
      focal_y: focal.y,
    })
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Photo</span>
          <ImageUpload
            value={imageUrl}
            onChange={(url, file) => {
              setImageUrl(url)
              setImageFile(file ?? null)
            }}
            focal={focal}
            onFocalChange={(x, y) => setFocal({ x, y })}
            preserveOnUnmountRef={preserveImageRef}
          />
        </div>

        <div>
          <label htmlFor="neighborhood-name" className="mb-1.5 block text-sm font-medium text-secondary">
            Name
          </label>
          <input
            id="neighborhood-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (errors.name) setErrors((current) => ({ ...current, name: undefined }))
            }}
            placeholder="e.g. Malabata"
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          {errors.name && <p className="mt-1.5 text-sm text-accent-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="neighborhood-description" className="mb-1.5 block text-sm font-medium text-secondary">
            Description
          </label>
          <textarea
            id="neighborhood-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Modern luxury with breathtaking Mediterranean views."
            rows={3}
            className="w-full resize-none rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          <p className="mt-1.5 text-xs text-trenary">
            Shown on the homepage teaser and the district's card — keep it to one short line.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-accent-500/10 bg-white px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-[12px] border border-accent-500/10 px-4 py-2.5 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
