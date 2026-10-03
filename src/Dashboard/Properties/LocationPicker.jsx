import { useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { IoLocationOutline, IoSearchOutline } from 'react-icons/io5'

// Centre Ville, Tangier — same fallback used as the seed data's own
// reference point, so a brand-new property opens on a map that's already
// showing the agency's home turf instead of the middle of the ocean.
const TANGIER_CENTER = [35.7595, -5.834]
const DEFAULT_ZOOM = 13
const PIN_ZOOM = 16

// A custom divIcon instead of Leaflet's default marker: no bundler asset-path
// headaches (the classic Leaflet+Vite broken-marker-icon issue), and it's
// drawn in the app's own accent color instead of Leaflet's stock blue pin.
const PIN_SVG = `
  <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35))">
    <path d="M16 0C7.163 0 0 7.163 0 16c0 11.5 16 26 16 26s16-14.5 16-26C32 7.163 24.837 0 16 0z" fill="var(--color-accent-500)" />
    <circle cx="16" cy="16" r="6.5" fill="#ffffff" />
  </svg>
`
const pinIcon = L.divIcon({
  html: PIN_SVG,
  className: '',
  iconSize: [32, 42],
  iconAnchor: [16, 42],
})

function ClickHandler({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

export default function LocationPicker({ lat, lng, onChange }) {
  const mapRef = useRef(null)
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const parsedLat = lat !== '' && lat !== null && lat !== undefined ? Number(lat) : null
  const parsedLng = lng !== '' && lng !== null && lng !== undefined ? Number(lng) : null
  const hasPin = parsedLat !== null && parsedLng !== null && !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng)

  function setPoint(nextLat, nextLng, options) {
    const roundedLat = Number(nextLat.toFixed(6))
    const roundedLng = Number(nextLng.toFixed(6))
    onChange(String(roundedLat), String(roundedLng))
    if (options?.recenter) mapRef.current?.flyTo([roundedLat, roundedLng], PIN_ZOOM, { duration: 0.6 })
  }

  function handleManualBlur() {
    if (hasPin) mapRef.current?.flyTo([parsedLat, parsedLng], PIN_ZOOM, { duration: 0.6 })
  }

  async function runSearch() {
    if (!search.trim() || searching) return

    setSearching(true)
    setSearchError('')
    try {
      const query = encodeURIComponent(`${search.trim()}, Tangier, Morocco`)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`)
      const results = await response.json()
      const firstResult = results?.[0]
      if (!firstResult) {
        setSearchError('No match found — try a more specific name, or place the pin manually.')
        return
      }
      setPoint(Number(firstResult.lat), Number(firstResult.lon), { recenter: true })
    } catch {
      setSearchError("Couldn't reach the search service — place the pin manually instead.")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <IoSearchOutline size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-trenary" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              // This input lives inside PropertyForm's own outer <form>.
              // Left alone, Enter here would implicitly submit that outer
              // form (the normal "Enter submits the nearest form" browser
              // behavior) instead of just running this search.
              if (event.key === 'Enter') {
                event.preventDefault()
                runSearch()
              }
            }}
            placeholder="Search an address to jump there…"
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 py-3 pl-10 pr-4 text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
        <button
          type="button"
          onClick={runSearch}
          disabled={searching}
          className="shrink-0 rounded-[12px] border border-accent-500/10 px-4 text-sm font-medium text-secondary hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50"
        >
          {searching ? 'Searching…' : 'Search'}
        </button>
      </div>
      {searchError && <p className="mb-3 text-sm text-error-500">{searchError}</p>}

      <div className="relative isolate h-[240px] overflow-hidden rounded-[16px] border border-accent-500/10 sm:h-[320px] lg:h-[380px]">
        <MapContainer
          ref={mapRef}
          center={hasPin ? [parsedLat, parsedLng] : TANGIER_CENTER}
          zoom={hasPin ? PIN_ZOOM : DEFAULT_ZOOM}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={(clickedLat, clickedLng) => setPoint(clickedLat, clickedLng)} />
          {hasPin && (
            <Marker
              position={[parsedLat, parsedLng]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const position = event.target.getLatLng()
                  setPoint(position.lat, position.lng)
                },
              }}
            />
          )}
        </MapContainer>

        {!hasPin && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
            <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-center text-xs font-medium text-secondary shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <IoLocationOutline size={14} />
              Click the map to place the property
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="lat-input" className="mb-1.5 block text-xs font-medium text-trenary">
            Latitude
          </label>
          <input
            id="lat-input"
            type="number"
            step="0.000001"
            value={lat}
            onChange={(event) => onChange(event.target.value, lng)}
            onBlur={handleManualBlur}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-2.5 text-sm text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
        <div>
          <label htmlFor="lng-input" className="mb-1.5 block text-xs font-medium text-trenary">
            Longitude
          </label>
          <input
            id="lng-input"
            type="number"
            step="0.000001"
            value={lng}
            onChange={(event) => onChange(lat, event.target.value)}
            onBlur={handleManualBlur}
            className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 px-4 py-2.5 text-sm text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>
      </div>
    </div>
  )
}