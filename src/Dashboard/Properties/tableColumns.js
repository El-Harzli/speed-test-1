const STORAGE_KEY = 'admin-properties-visible-columns-v1'

// "Property" (the title/image/location cell) and "Actions" are structural,
// not data you'd ever want to hide — everything else is optional and can
// be toggled from the table settings menu.
export const OPTIONAL_COLUMNS = [
  { key: 'category', label: 'Category' },
  { key: 'neighborhood', label: 'Neighborhood' },
  { key: 'type', label: 'Type' },
  { key: 'price', label: 'Price' },
  { key: 'beds', label: 'Beds' },
  { key: 'baths', label: 'Baths' },
  { key: 'area', label: 'Area' },
  { key: 'agent', label: 'Agent' },
  { key: 'status', label: 'Status' },
  { key: 'featured', label: 'Featured' },
]

const DEFAULT_VISIBLE_KEYS = ['category', 'neighborhood', 'type', 'price', 'agent', 'status']

export function loadColumnVisibility() {
  if (typeof window === 'undefined') return new Set(DEFAULT_VISIBLE_KEYS)
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set(DEFAULT_VISIBLE_KEYS)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? new Set(parsed) : new Set(DEFAULT_VISIBLE_KEYS)
  } catch {
    return new Set(DEFAULT_VISIBLE_KEYS)
  }
}

export function saveColumnVisibility(visibleKeys) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...visibleKeys]))
  } catch {
    // Worst case the preference just doesn't persist — not worth failing over.
  }
}
