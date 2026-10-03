import { useRef, useState } from 'react'
import AvatarUpload from '../shared/AvatarUpload'

export default function AgentForm({ initialAgent, onCancel, onSubmit }) {
  const [name, setName] = useState(initialAgent?.name ?? '')
  const [phone, setPhone] = useState(initialAgent?.phone ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialAgent?.avatar_url ?? '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const preserveAvatarRef = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!name.trim()) nextErrors.name = 'Give this agent a name.'
    if (!phone.trim()) nextErrors.phone = 'Add a phone number.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    preserveAvatarRef.current = true
    setIsSubmitting(true)
    await onSubmit({ name: name.trim(), phone: phone.trim(), avatar_url: avatarUrl, avatarFile })
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Photo</span>
          <AvatarUpload
            value={avatarUrl}
            onChange={(url, file) => {
              setAvatarUrl(url)
              setAvatarFile(file ?? null)
            }}
            preserveOnUnmountRef={preserveAvatarRef}
          />
        </div>

        <div>
          <label htmlFor="agent-name" className="mb-1.5 block text-sm font-medium text-secondary">
            Name
          </label>
          <input
            id="agent-name"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (errors.name) setErrors((current) => ({ ...current, name: undefined }))
            }}
            placeholder="e.g. Nizar Tatari"
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          {errors.name && <p className="mt-1.5 text-sm text-accent-500">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="agent-phone" className="mb-1.5 block text-sm font-medium text-secondary">
            Phone
          </label>
          <input
            id="agent-phone"
            type="tel"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value)
              if (errors.phone) setErrors((current) => ({ ...current, phone: undefined }))
            }}
            placeholder="e.g. +212661234567"
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
          {errors.phone && <p className="mt-1.5 text-sm text-accent-500">{errors.phone}</p>}
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