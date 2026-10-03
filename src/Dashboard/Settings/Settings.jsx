import { useState } from 'react'
import { useSiteSettings } from '../data/SiteSettingsContext'
import { useToast } from '../shared/ToastContext'
import PageSpinner from '../shared/PageSpinner'

export default function Settings() {
  const { settings, loading, updateSettings } = useSiteSettings()
  const { showToast } = useToast()

  if (loading || !settings) {
    return <PageSpinner />
  }

  return <SettingsForm initialSettings={settings} updateSettings={updateSettings} showToast={showToast} />
}

function SettingsForm({ initialSettings, updateSettings, showToast }) {
  const [priceMin, setPriceMin] = useState(initialSettings.price_min.toString())
  const [priceMax, setPriceMax] = useState(initialSettings.price_max.toString())
  const [whatsappNumber, setWhatsappNumber] = useState(initialSettings.whatsapp_number)
  const [whatsappTemplate, setWhatsappTemplate] = useState(initialSettings.whatsapp_message_template)
  const [phoneNumber, setPhoneNumber] = useState(initialSettings.phone_number)
  const [phoneDisplay, setPhoneDisplay] = useState(initialSettings.phone_display)
  const [agencyName, setAgencyName] = useState(initialSettings.agency_name)
  const [email, setEmail] = useState(initialSettings.email)
  const [instagramUrl, setInstagramUrl] = useState(initialSettings.instagram_url)
  const [instagramHandle, setInstagramHandle] = useState(initialSettings.instagram_handle)
  const [linkedinUrl, setLinkedinUrl] = useState(initialSettings.linkedin_url)
  const [address, setAddress] = useState(initialSettings.address)
  const [officeLat, setOfficeLat] = useState(initialSettings.office_lat.toString())
  const [officeLng, setOfficeLng] = useState(initialSettings.office_lng.toString())
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    const minValue = Number(priceMin)
    const maxValue = Number(priceMax)
    if (priceMin === '' || Number.isNaN(minValue) || minValue < 0) nextErrors.priceMin = 'Enter a valid minimum.'
    if (priceMax === '' || Number.isNaN(maxValue) || maxValue < 0) nextErrors.priceMax = 'Enter a valid maximum.'
    if (!nextErrors.priceMin && !nextErrors.priceMax && minValue >= maxValue) {
      nextErrors.priceMax = 'Maximum must be greater than minimum.'
    }
    if (!whatsappNumber.trim()) nextErrors.whatsappNumber = 'Add a WhatsApp number.'
    if (!whatsappTemplate.trim()) nextErrors.whatsappTemplate = 'Add a message template.'
    if (phoneNumber.replace(/\D/g, '').length < 6) nextErrors.phoneNumber = 'Enter a valid phone number.'
    if (!phoneDisplay.trim()) nextErrors.phoneDisplay = 'Add a display format for the number.'
    if (!agencyName.trim()) nextErrors.agencyName = 'Add the agency name.'
    if (!email.trim() || !email.includes('@')) nextErrors.email = 'Enter a valid email address.'
    if (!instagramUrl.trim()) nextErrors.instagramUrl = 'Add an Instagram link.'
    if (!instagramHandle.trim()) nextErrors.instagramHandle = 'Add the displayed handle.'
    if (!address.trim()) nextErrors.address = 'Add an address.'
    const latValue = Number(officeLat)
    const lngValue = Number(officeLng)
    if (officeLat === '' || Number.isNaN(latValue) || latValue < -90 || latValue > 90) {
      nextErrors.officeLat = 'Enter a valid latitude (-90 to 90).'
    }
    if (officeLng === '' || Number.isNaN(lngValue) || lngValue < -180 || lngValue > 180) {
      nextErrors.officeLng = 'Enter a valid longitude (-180 to 180).'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await updateSettings({
        price_min: minValue,
        price_max: maxValue,
        whatsapp_number: whatsappNumber.trim(),
        whatsapp_message_template: whatsappTemplate.trim(),
        phone_number: phoneNumber.replace(/\D/g, ''),
        phone_display: phoneDisplay.trim(),
        agency_name: agencyName.trim(),
        email: email.trim(),
        instagram_url: instagramUrl.trim(),
        instagram_handle: instagramHandle.trim(),
        linkedin_url: linkedinUrl.trim(),
        address: address.trim(),
        office_lat: latValue,
        office_lng: lngValue,
      }, initialSettings.updated_at)
      showToast('Settings saved.')
    } catch (error) {
      console.error(error)
      if (error?.code === 'CONFLICT') {
        // Keep their typed values on screen rather than discarding them —
        // the conflict might be on a field they never touched, so it's
        // their call whether to reload and reapply or just save again.
        showToast(error.message, 'error')
      } else {
        showToast('Could not save settings.', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-main md:text-2xl">Settings</h2>
        <p className="mt-1 text-sm text-trenary">Site-wide configuration for the public browsing site.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-main">Price filter range</h3>
            <p className="mt-1 text-sm text-trenary">The min/max bounds for the price slider on the public site.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label htmlFor="price-min-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Minimum (MAD)
              </label>
              <input
                id="price-min-input"
                type="number"
                min="0"
                value={priceMin}
                onChange={(event) => {
                  setPriceMin(event.target.value)
                  if (errors.priceMin) setErrors((current) => ({ ...current, priceMin: undefined }))
                }}
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 ${
                  errors.priceMin
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.priceMin && <p className="mt-1.5 text-sm text-error-500">{errors.priceMin}</p>}
            </div>
            <div>
              <label htmlFor="price-max-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Maximum (MAD)
              </label>
              <input
                id="price-max-input"
                type="number"
                min="0"
                value={priceMax}
                onChange={(event) => {
                  setPriceMax(event.target.value)
                  if (errors.priceMax) setErrors((current) => ({ ...current, priceMax: undefined }))
                }}
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 ${
                  errors.priceMax
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.priceMax && <p className="mt-1.5 text-sm text-error-500">{errors.priceMax}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-main">Agency identity</h3>
            <p className="mt-1 text-sm text-trenary">
              Shown in the footer&apos;s brand mark, copyright line, and browser tab title.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label htmlFor="agency-name-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Agency name
              </label>
              <input
                id="agency-name-input"
                type="text"
                value={agencyName}
                onChange={(event) => {
                  setAgencyName(event.target.value)
                  if (errors.agencyName) setErrors((current) => ({ ...current, agencyName: undefined }))
                }}
                placeholder="e.g. BSI Properties"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.agencyName
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.agencyName && <p className="mt-1.5 text-sm text-error-500">{errors.agencyName}</p>}
              <p className="mt-1.5 text-xs text-trenary">
                In the footer, the first word is styled bold and the rest in accent italic — works best as two
                words, e.g. &quot;BSI Properties&quot;.
              </p>
            </div>
            <div>
              <label htmlFor="agency-email-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Contact email
              </label>
              <input
                id="agency-email-input"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
                }}
                placeholder="hello@example.com"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.email
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.email && <p className="mt-1.5 text-sm text-error-500">{errors.email}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-main">Social links</h3>
            <p className="mt-1 text-sm text-trenary">Shown in the footer.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label htmlFor="instagram-url-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Instagram URL
              </label>
              <input
                id="instagram-url-input"
                type="url"
                value={instagramUrl}
                onChange={(event) => {
                  setInstagramUrl(event.target.value)
                  if (errors.instagramUrl) setErrors((current) => ({ ...current, instagramUrl: undefined }))
                }}
                placeholder="https://instagram.com/youraccount"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.instagramUrl
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.instagramUrl && <p className="mt-1.5 text-sm text-error-500">{errors.instagramUrl}</p>}
            </div>
            <div>
              <label htmlFor="instagram-handle-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Displayed handle
              </label>
              <input
                id="instagram-handle-input"
                type="text"
                value={instagramHandle}
                onChange={(event) => {
                  setInstagramHandle(event.target.value)
                  if (errors.instagramHandle) setErrors((current) => ({ ...current, instagramHandle: undefined }))
                }}
                placeholder="@youraccount"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.instagramHandle
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.instagramHandle && <p className="mt-1.5 text-sm text-error-500">{errors.instagramHandle}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="linkedin-url-input" className="mb-1.5 block text-sm font-medium text-secondary">
                LinkedIn URL <span className="font-normal text-trenary">(optional)</span>
              </label>
              <input
                id="linkedin-url-input"
                type="url"
                value={linkedinUrl}
                onChange={(event) => setLinkedinUrl(event.target.value)}
                placeholder="https://linkedin.com/company/youragency"
                className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              />
              <p className="mt-1.5 text-xs text-trenary">
                Leave blank to hide the LinkedIn icon in the footer entirely, rather than showing a dead link.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-main">Office location</h3>
            <p className="mt-1 text-sm text-trenary">Shown in the footer and on the map on the Contact page.</p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <label htmlFor="address-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Address
              </label>
              <input
                id="address-input"
                type="text"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value)
                  if (errors.address) setErrors((current) => ({ ...current, address: undefined }))
                }}
                placeholder="e.g. 12 Avenue Mohammed VI, Tangier, Morocco"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.address
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.address && <p className="mt-1.5 text-sm text-error-500">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="office-lat-input" className="mb-1.5 block text-sm font-medium text-secondary">
                  Latitude
                </label>
                <input
                  id="office-lat-input"
                  type="number"
                  step="any"
                  value={officeLat}
                  onChange={(event) => {
                    setOfficeLat(event.target.value)
                    if (errors.officeLat) setErrors((current) => ({ ...current, officeLat: undefined }))
                  }}
                  className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 ${
                    errors.officeLat
                      ? 'border-error-500/50 focus-visible:ring-error-500'
                      : 'border-accent-500/10 focus-visible:ring-accent-500'
                  }`}
                />
                {errors.officeLat && <p className="mt-1.5 text-sm text-error-500">{errors.officeLat}</p>}
              </div>
              <div>
                <label htmlFor="office-lng-input" className="mb-1.5 block text-sm font-medium text-secondary">
                  Longitude
                </label>
                <input
                  id="office-lng-input"
                  type="number"
                  step="any"
                  value={officeLng}
                  onChange={(event) => {
                    setOfficeLng(event.target.value)
                    if (errors.officeLng) setErrors((current) => ({ ...current, officeLng: undefined }))
                  }}
                  className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 ${
                    errors.officeLng
                      ? 'border-error-500/50 focus-visible:ring-error-500'
                      : 'border-accent-500/10 focus-visible:ring-accent-500'
                  }`}
                />
                {errors.officeLng && <p className="mt-1.5 text-sm text-error-500">{errors.officeLng}</p>}
              </div>
            </div>
            <p className="text-xs text-trenary">
              Right-click the spot on Google Maps and copy the coordinates it shows — that pastes in as
              &quot;lat, lng&quot;, which you can split across the two fields above.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-main">Agency phone number</h3>
            <p className="mt-1 text-sm text-trenary">
              Used for the Call/WhatsApp links in the header, footer, homepage, and Contact page. Property detail
              pages are the one exception — those always show the assigned agent&apos;s own number instead.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label htmlFor="phone-number-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Number (for call/WhatsApp links)
              </label>
              <input
                id="phone-number-input"
                type="tel"
                value={phoneNumber}
                onChange={(event) => {
                  setPhoneNumber(event.target.value)
                  if (errors.phoneNumber) setErrors((current) => ({ ...current, phoneNumber: undefined }))
                }}
                placeholder="e.g. 212661234567"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.phoneNumber
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.phoneNumber && <p className="mt-1.5 text-sm text-error-500">{errors.phoneNumber}</p>}
              <p className="mt-1.5 text-xs text-trenary">
                Country code + number, no spaces or symbols — this is what actually opens the call/chat.
              </p>
            </div>
            <div>
              <label htmlFor="phone-display-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Displayed as
              </label>
              <input
                id="phone-display-input"
                type="text"
                value={phoneDisplay}
                onChange={(event) => {
                  setPhoneDisplay(event.target.value)
                  if (errors.phoneDisplay) setErrors((current) => ({ ...current, phoneDisplay: undefined }))
                }}
                placeholder="e.g. +212 (0) 661 23 45 67"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.phoneDisplay
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.phoneDisplay && <p className="mt-1.5 text-sm text-error-500">{errors.phoneDisplay}</p>}
              <p className="mt-1.5 text-xs text-trenary">However you'd like it shown to visitors — spacing, brackets, etc.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-main">WhatsApp contact</h3>
            <p className="mt-1 text-sm text-trenary">Used by the &quot;Contact on WhatsApp&quot; button on every listing.</p>
          </div>
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <label htmlFor="whatsapp-number-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Business number
              </label>
              <input
                id="whatsapp-number-input"
                type="tel"
                value={whatsappNumber}
                onChange={(event) => {
                  setWhatsappNumber(event.target.value)
                  if (errors.whatsappNumber) setErrors((current) => ({ ...current, whatsappNumber: undefined }))
                }}
                placeholder="e.g. +212661234567"
                className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
                  errors.whatsappNumber
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.whatsappNumber && <p className="mt-1.5 text-sm text-error-500">{errors.whatsappNumber}</p>}
            </div>
            <div>
              <label htmlFor="whatsapp-template-input" className="mb-1.5 block text-sm font-medium text-secondary">
                Pre-filled message
              </label>
              <textarea
                id="whatsapp-template-input"
                value={whatsappTemplate}
                onChange={(event) => {
                  setWhatsappTemplate(event.target.value)
                  if (errors.whatsappTemplate) setErrors((current) => ({ ...current, whatsappTemplate: undefined }))
                }}
                rows={3}
                className={`w-full resize-none rounded-[12px] border bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 ${
                  errors.whatsappTemplate
                    ? 'border-error-500/50 focus-visible:ring-error-500'
                    : 'border-accent-500/10 focus-visible:ring-accent-500'
                }`}
              />
              {errors.whatsappTemplate && <p className="mt-1.5 text-sm text-error-500">{errors.whatsappTemplate}</p>}
              <p className="mt-1.5 text-xs text-trenary">
                Use <code className="rounded bg-primary-600 px-1 py-0.5">{'{property_title}'}</code> — it gets swapped in
                automatically per listing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-[12px] bg-accent-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
