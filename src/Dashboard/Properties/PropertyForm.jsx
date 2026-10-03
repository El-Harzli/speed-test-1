import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Select from '../shared/Select'
import SegmentedControl from '../shared/SegmentedControl'
import Toggle from '../shared/Toggle'
import AmenityMultiSelect from '../shared/AmenityMultiSelect'
import ImageGallery from './ImageGallery'
import LocationPicker from './LocationPicker'

const FIELD_ORDER = [
  { key: 'title', id: 'title-input' },
  { key: 'category', id: 'category-select' },
  { key: 'neighborhood', id: 'neighborhood-select' },
  { key: 'agent', id: 'agent-select' },
  { key: 'price', id: 'price-input' },
  { key: 'location', id: 'location-input' },
]

export default function PropertyForm({
  formId,
  initialProperty,
  initialAmenityIds,
  categories,
  amenities,
  agents,
  neighborhoods,
  getAmenityIdsForCategory,
  getSubcategoriesForCategory,
  onSubmit,
}) {
  const [title, setTitle] = useState(initialProperty?.title ?? '')
  const [description, setDescription] = useState(initialProperty?.description ?? '')
  const [listingType, setListingType] = useState(initialProperty?.listing_type ?? 'sale')
  const [status, setStatus] = useState(initialProperty?.status ?? 'draft')
  const [categoryId, setCategoryId] = useState(initialProperty?.category_id ?? '')
  const [subcategoryId, setSubcategoryId] = useState(initialProperty?.subcategory_id ?? '')
  const [neighborhoodId, setNeighborhoodId] = useState(initialProperty?.neighborhood_id ?? '')
  const [agentId, setAgentId] = useState(initialProperty?.agent_id ?? '')
  const [price, setPrice] = useState(initialProperty?.price?.toString() ?? '')
  const [beds, setBeds] = useState(initialProperty?.beds?.toString() ?? '')
  const [baths, setBaths] = useState(initialProperty?.baths?.toString() ?? '')
  const [area, setArea] = useState(initialProperty?.area?.toString() ?? '')
  const [garage, setGarage] = useState(initialProperty?.garage?.toString() ?? '')
  const [yearBuilt, setYearBuilt] = useState(initialProperty?.year_built?.toString() ?? '')
  const [location, setLocation] = useState(initialProperty?.location ?? '')
  const [lat, setLat] = useState(initialProperty?.lat?.toString() ?? '')
  const [lng, setLng] = useState(initialProperty?.lng?.toString() ?? '')
  const [popular, setPopular] = useState(initialProperty?.popular ?? false)
  const [images, setImages] = useState(initialProperty?.images ?? [])
  const [amenityIds, setAmenityIds] = useState(initialAmenityIds ?? [])
  const [errors, setErrors] = useState({})
  const preserveImagesRef = useRef(false)

  const applicableAmenityIds = categoryId ? getAmenityIdsForCategory(categoryId) : []
  const applicableAmenities = amenities.filter((amenity) => applicableAmenityIds.includes(amenity.id))
  const amenitiesEmptyMessage = !categoryId
    ? 'Choose a category above to see its applicable amenities.'
    : 'This category has no amenities assigned yet — add some from the Categories page.'

  const applicableSubcategories = categoryId ? getSubcategoriesForCategory(categoryId) : []
  const selectedCategory = categories.find((category) => category.id === categoryId)

  function handleCategoryChange(newCategoryId) {
    setCategoryId(newCategoryId)
    const applicable = getAmenityIdsForCategory(newCategoryId)
    setAmenityIds((current) => current.filter((id) => applicable.includes(id)))
    const applicableSubcategoryIds = getSubcategoriesForCategory(newCategoryId).map((subcategory) => subcategory.id)
    setSubcategoryId((current) => (applicableSubcategoryIds.includes(current) ? current : ''))
    if (errors.category) setErrors((current) => ({ ...current, category: undefined }))
  }

  function toggleAmenity(id) {
    setAmenityIds((current) => (current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id]))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const nextErrors = {}
    if (!title.trim()) nextErrors.title = 'Give this property a title.'
    if (!categoryId) nextErrors.category = 'Choose a category.'
    if (!neighborhoodId) nextErrors.neighborhood = 'Choose a neighborhood.'
    if (!agentId) nextErrors.agent = 'Assign an agent.'
    if (!location.trim()) nextErrors.location = 'Add a location.'
    const priceValue = Number(price)
    if (!price || Number.isNaN(priceValue) || priceValue <= 0) nextErrors.price = 'Enter a valid price.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstInvalidField = FIELD_ORDER.find((field) => nextErrors[field.key])
      const fieldElement = firstInvalidField ? document.getElementById(firstInvalidField.id) : null
      fieldElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      fieldElement?.focus({ preventScroll: true })
      return
    }

    preserveImagesRef.current = true

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      listing_type: listingType,
      status,
      category_id: categoryId,
      subcategory_id: subcategoryId || null,
      neighborhood_id: neighborhoodId,
      agent_id: agentId,
      price: priceValue,
      beds: Number(beds) || 0,
      baths: Number(baths) || 0,
      area: Number(area) || 0,
      garage: Number(garage) || 0,
      year_built: yearBuilt ? Number(yearBuilt) : null,
      location: location.trim(),
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      popular,
      images,
      amenityIds,
    })
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title-input" className="mb-1.5 block text-sm font-medium text-secondary">
          Title
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
          }}
          placeholder="e.g. Maple Hollow Residence"
          className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
            errors.title ? 'border-error-500/50 focus-visible:ring-error-500' : 'border-accent-500/10 focus-visible:ring-accent-500'
          }`}
        />
        {errors.title && <p className="mt-1.5 text-sm text-error-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description-input" className="mb-1.5 block text-sm font-medium text-secondary">
          Description
        </label>
        <textarea
          id="description-input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="A short, appealing description for the listing"
          className="w-full resize-none rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Listing type</span>
          <SegmentedControl
            fullWidth
            options={[
              { value: 'sale', label: 'Sale' },
              { value: 'rent', label: 'Rent' },
            ]}
            value={listingType}
            onChange={setListingType}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-secondary">Status</span>
          <SegmentedControl
            fullWidth
            options={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
            value={status}
            onChange={setStatus}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category-select" className="mb-1.5 block text-sm font-medium text-secondary">
            Category
          </label>
          <Select
            id="category-select"
            value={categoryId}
            onChange={handleCategoryChange}
            placeholder="Choose a category"
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            invalid={Boolean(errors.category)}
          />
          {errors.category && <p className="mt-1.5 text-sm text-error-500">{errors.category}</p>}
        </div>
        <div>
          <label htmlFor="neighborhood-select" className="mb-1.5 block text-sm font-medium text-secondary">
            Neighborhood
          </label>
          <Select
            id="neighborhood-select"
            value={neighborhoodId}
            onChange={(value) => {
              setNeighborhoodId(value)
              if (errors.neighborhood) setErrors((current) => ({ ...current, neighborhood: undefined }))
            }}
            placeholder="Choose a neighborhood"
            options={neighborhoods.map((neighborhood) => ({ value: neighborhood.id, label: neighborhood.name }))}
            invalid={Boolean(errors.neighborhood)}
          />
          {errors.neighborhood && <p className="mt-1.5 text-sm text-error-500">{errors.neighborhood}</p>}
          {neighborhoods.length === 0 && (
            <p className="mt-1.5 text-sm text-trenary">
              No neighborhoods yet — add one from the Neighborhoods page first.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="agent-select" className="mb-1.5 block text-sm font-medium text-secondary">
            Agent
          </label>
          <Select
            id="agent-select"
            value={agentId}
            onChange={(value) => {
              setAgentId(value)
              if (errors.agent) setErrors((current) => ({ ...current, agent: undefined }))
            }}
            placeholder="Assign an agent"
            options={agents.map((agent) => ({ value: agent.id, label: agent.name }))}
            invalid={Boolean(errors.agent)}
          />
          {errors.agent && <p className="mt-1.5 text-sm text-error-500">{errors.agent}</p>}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {applicableSubcategories.length > 0 && (
          <motion.div
            key="subcategory-field"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-[16px] bg-primary-600/60 p-4">
              <label htmlFor="subcategory-select" className="mb-1 block text-sm font-medium text-secondary">
                Sub-type <span className="font-normal text-trenary">(optional)</span>
              </label>
              <p className="mb-2.5 text-xs text-trenary">
                {selectedCategory?.name ? `Specific to ${selectedCategory.name}.` : ''}
              </p>
              <Select
                id="subcategory-select"
                value={subcategoryId}
                onChange={setSubcategoryId}
                placeholder="None"
                options={applicableSubcategories.map((subcategory) => ({ value: subcategory.id, label: subcategory.name }))}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="price-input" className="mb-1.5 block text-sm font-medium text-secondary">
            Price (MAD)
          </label>
          <input
            id="price-input"
            type="number"
            min="0"
            value={price}
            onChange={(event) => {
              setPrice(event.target.value)
              if (errors.price) setErrors((current) => ({ ...current, price: undefined }))
            }}
            className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 ${
              errors.price ? 'border-error-500/50 focus-visible:ring-error-500' : 'border-accent-500/10 focus-visible:ring-accent-500'
            }`}
          />
          {errors.price && <p className="mt-1.5 text-sm text-error-500">{errors.price}</p>}
        </div>
        <div>
          <label htmlFor="beds-input" className="mb-1.5 block text-sm font-medium text-secondary">
            Beds
          </label>
          <input
            id="beds-input"
            type="number"
            min="0"
            value={beds}
            onChange={(event) => setBeds(event.target.value)}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
        <div>
          <label htmlFor="baths-input" className="mb-1.5 block text-sm font-medium text-secondary">
            Baths
          </label>
          <input
            id="baths-input"
            type="number"
            min="0"
            value={baths}
            onChange={(event) => setBaths(event.target.value)}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="area-input" className="mb-1.5 block text-sm font-medium text-secondary">
            Area (m²)
          </label>
          <input
            id="area-input"
            type="number"
            min="0"
            value={area}
            onChange={(event) => setArea(event.target.value)}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
        <div>
          <label htmlFor="garage-input" className="mb-1.5 block text-sm font-medium text-secondary">
            Garage
          </label>
          <input
            id="garage-input"
            type="number"
            min="0"
            value={garage}
            onChange={(event) => setGarage(event.target.value)}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
        <div>
          <label htmlFor="year-built-input" className="mb-1.5 block text-sm font-medium text-secondary">
            Year built
          </label>
          <input
            id="year-built-input"
            type="number"
            min="1900"
            max="2100"
            value={yearBuilt}
            onChange={(event) => setYearBuilt(event.target.value)}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-3 text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location-input" className="mb-1.5 block text-sm font-medium text-secondary">
          Location
        </label>
        <input
          id="location-input"
          type="text"
          value={location}
          onChange={(event) => {
            setLocation(event.target.value)
            if (errors.location) setErrors((current) => ({ ...current, location: undefined }))
          }}
          placeholder="e.g. Malabata, Tangier"
          className={`w-full rounded-[12px] border bg-primary-500 px-4 py-3 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 ${
            errors.location ? 'border-error-500/50 focus-visible:ring-error-500' : 'border-accent-500/10 focus-visible:ring-accent-500'
          }`}
        />
        {errors.location && <p className="mt-1.5 text-sm text-error-500">{errors.location}</p>}
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-secondary">Exact position</span>
        <p className="mb-3 text-sm text-trenary">Search an address or click the map to place the pin — drag to fine-tune.</p>
        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={(nextLat, nextLng) => {
            setLat(nextLat)
            setLng(nextLng)
          }}
        />
      </div>

      <div className="flex items-center justify-between rounded-[16px] border border-accent-500/10 px-4 py-3.5">
        <div className="pr-4">
          <p className="text-sm font-medium text-main">Popular</p>
          <p className="text-sm text-trenary">Shows a &quot;Popular&quot; badge and affects default sort on the public site.</p>
        </div>
        <Toggle checked={popular} onChange={setPopular} label="Popular" />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-secondary">Amenities</span>
        <p className="mb-3 text-sm text-trenary">Only amenities applicable to the selected category are shown.</p>
        <AmenityMultiSelect
          amenities={applicableAmenities}
          selectedIds={amenityIds}
          onToggle={toggleAmenity}
          emptyMessage={amenitiesEmptyMessage}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-secondary">Photos</span>
        <ImageGallery images={images} onChange={setImages} preserveOnUnmountRef={preserveImagesRef} />
      </div>
    </form>
  )
}