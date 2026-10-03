import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  IoAddOutline,
  IoSearchOutline,
  IoPencilOutline,
  IoTrashOutline,
  IoImageOutline,
  IoBusinessOutline,
  IoStar,
  IoChevronUp,
  IoChevronDown,
  IoSwapVerticalOutline,
} from 'react-icons/io5'
import { useCatalog } from '../data/CatalogContext'
import { useProperties } from '../data/PropertiesContext'
import { useAgents } from '../data/AgentsContext'
import { useNeighborhoods } from '../data/NeighborhoodsContext'
import { useToast } from '../shared/ToastContext'
import SegmentedControl from '../shared/SegmentedControl'
import Select from '../shared/Select'
import ConfirmDialog from '../shared/ConfirmDialog'
import EmptyState from '../shared/EmptyState'
import PageSpinner from '../shared/PageSpinner'
import ColumnSettingsMenu from './ColumnSettingsMenu'
import { loadColumnVisibility, saveColumnVisibility } from './tableColumns'

function formatPrice(value, listingType) {
  const formatted = new Intl.NumberFormat('en-US').format(value ?? 0)
  return listingType === 'rent' ? `${formatted} MAD/mo` : `${formatted} MAD`
}

function getSortValue(row, key) {
  switch (key) {
    case 'title':
      return row.property.title?.toLowerCase() ?? ''
    case 'category':
      return row.category?.name?.toLowerCase() ?? ''
    case 'neighborhood':
      return row.neighborhood?.name?.toLowerCase() ?? ''
    case 'type':
      return row.property.listing_type ?? ''
    case 'price':
      return Number(row.property.price) || 0
    case 'beds':
      return Number(row.property.beds) || 0
    case 'baths':
      return Number(row.property.baths) || 0
    case 'area':
      return Number(row.property.area) || 0
    case 'agent':
      return row.agent?.name?.toLowerCase() ?? ''
    case 'status':
      return row.property.status ?? ''
    case 'featured':
      // Unfeatured (null) always sorts after every featured property,
      // regardless of direction — "not featured" isn't a low or high
      // value, it's the absence of one.
      return row.property.featured_order ?? Number.POSITIVE_INFINITY
    case 'created_at':
    default:
      return row.property.created_at ?? ''
  }
}

function SortableHeader({ label, sortKey, activeSort, activeDir, onSort, align, className = '' }) {
  const isActive = activeSort === sortKey
  return (
    <th className={`px-5 py-3 ${align === 'right' ? 'text-right' : ''} ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition-colors hover:text-accent-500 cursor-pointer ${
          isActive ? 'text-accent-500' : ''
        }`}
      >
        {label}
        {isActive ? (
          activeDir === 'asc' ? <IoChevronUp size={12} /> : <IoChevronDown size={12} />
        ) : (
          <IoSwapVerticalOutline size={12} className="text-trenary/50" />
        )}
      </button>
    </th>
  )
}

export default function Properties() {
  const navigate = useNavigate()
  const { categories, subcategories } = useCatalog()
  const { properties, loading, deleteProperty } = useProperties()
  const { agents } = useAgents()
  const { neighborhoods } = useNeighborhoods()
  const { showToast } = useToast()

  // Every filter and the sort state live in the URL, not local state — so
  // opening a property to edit it (or cancelling) and coming back restores
  // exactly what was set before, instead of resetting to "All" every time.
  // See PropertyFormPage's goBackToProperties for the other half of this.
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') ?? 'all'
  const categoryFilter = searchParams.get('category') ?? 'all'
  const statusFilter = searchParams.get('status') ?? 'all'
  const search = searchParams.get('q') ?? ''
  const sortKey = searchParams.get('sort') ?? 'created_at'
  const sortDir = searchParams.get('dir') ?? 'desc'

  const [visibleColumns, setVisibleColumns] = useState(loadColumnVisibility)
  const [pendingDelete, setPendingDelete] = useState(null)

  // `replace: true` on every update here so typing in the search box (or
  // clicking through several filters) doesn't flood browser history with
  // one entry per keystroke — the URL still ends up reflecting the current
  // state, it just doesn't fill up the back button with noise.
  function updateParam(key, value) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value === '' || value == null || value === 'all') next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )
  }

  function handleSort(key) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if ((prev.get('sort') ?? 'created_at') === key) {
          next.set('dir', (prev.get('dir') ?? 'desc') === 'asc' ? 'desc' : 'asc')
        } else {
          next.set('sort', key)
          next.set('dir', 'asc')
        }
        return next
      },
      { replace: true },
    )
  }

  function handleColumnVisibilityChange(nextVisible) {
    setVisibleColumns(nextVisible)
    saveColumnVisibility(nextVisible)
  }

  // Joins each property to its category/subcategory/neighborhood/agent
  // once, up front — every row needed this lookup anyway (for display,
  // filtering, and now sorting by a joined field like "Neighborhood"), so
  // this avoids repeating four `.find()` calls per row on every render.
  const enrichedProperties = useMemo(() => {
    return properties.map((property) => ({
      property,
      category: categories.find((c) => c.id === property.category_id),
      subcategory: subcategories.find((s) => s.id === property.subcategory_id),
      neighborhood: neighborhoods.find((n) => n.id === property.neighborhood_id),
      agent: agents.find((a) => a.id === property.agent_id),
    }))
  }, [properties, categories, subcategories, neighborhoods, agents])

  const filteredProperties = useMemo(() => {
    const query = search.trim().toLowerCase()
    return enrichedProperties.filter(({ property }) => {
      if (activeTab !== 'all' && property.listing_type !== activeTab) return false
      if (categoryFilter !== 'all' && property.category_id !== categoryFilter) return false
      if (statusFilter !== 'all' && property.status !== statusFilter) return false
      if (
        query &&
        !property.title.toLowerCase().includes(query) &&
        !property.location.toLowerCase().includes(query)
      ) {
        return false
      }
      return true
    })
  }, [enrichedProperties, activeTab, categoryFilter, statusFilter, search])

  const sortedProperties = useMemo(() => {
    const sorted = [...filteredProperties].sort((a, b) => {
      const va = getSortValue(a, sortKey)
      const vb = getSortValue(b, sortKey)
      if (va < vb) return -1
      if (va > vb) return 1
      return 0
    })
    if (sortDir === 'desc') sorted.reverse()
    return sorted
  }, [filteredProperties, sortKey, sortDir])

  async function handleDeleteConfirm() {
    try {
      await deleteProperty(pendingDelete?.id)
      showToast('Property deleted.')
      setPendingDelete(null)
    } catch (error) {
      console.error(error)
      showToast('Could not delete this property.', 'error')
    }
  }

  if (loading) {
    return <PageSpinner />
  }

  const showCol = (key) => visibleColumns.has(key)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-main md:text-2xl">Properties</h2>
          <p className="mt-1 text-sm text-trenary">Every rent and sale listing, in one place.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/properties/new')}
          className="flex h-11 shrink-0 items-center gap-2 rounded-[12px] bg-accent-500 px-4 text-sm font-medium text-white hover:bg-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
        >
          <IoAddOutline size={18} />
          <span className="hidden sm:inline">Add property</span>
        </button>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          icon={IoBusinessOutline}
          title="No properties yet"
          description="Add your first listing to start building the catalog."
          action={
            <button
              type="button"
              onClick={() => navigate('/admin/properties/new')}
              className="rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Add property
            </button>
          }
        />
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <SegmentedControl
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'rent', label: 'Rent' },
                  { value: 'sale', label: 'Sale' },
                ]}
                value={activeTab}
                onChange={(value) => updateParam('tab', value)}
              />
              <ColumnSettingsMenu visibleColumns={visibleColumns} onChange={handleColumnVisibilityChange} />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <div className="sm:w-44">
                <Select
                  value={categoryFilter}
                  onChange={(value) => updateParam('category', value)}
                  options={[
                    { value: 'all', label: 'All categories' },
                    ...categories.map((category) => ({ value: category.id, label: category.name })),
                  ]}
                />
              </div>
              <div className="sm:w-40">
                <Select
                  value={statusFilter}
                  onChange={(value) => updateParam('status', value)}
                  options={[
                    { value: 'all', label: 'All statuses' },
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' },
                  ]}
                />
              </div>
              <div className="relative col-span-2 sm:col-span-1 sm:w-64">
                <IoSearchOutline
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-trenary"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => updateParam('q', event.target.value)}
                  placeholder="Search title or location"
                  className="w-full rounded-[12px] border border-accent-500/10 bg-primary-500 py-3 pl-10 pr-4 text-sm text-main placeholder:text-trenary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                />
              </div>
            </div>
          </div>

          {sortedProperties.length === 0 ? (
            <EmptyState
              icon={IoSearchOutline}
              title="No properties match your filters"
              description="Try adjusting the tabs, filters, or search above."
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-accent-500/10 bg-primary-600/40 text-xs font-medium uppercase tracking-wide text-trenary">
                    <tr>
                      <SortableHeader
                        label="Property"
                        sortKey="title"
                        activeSort={sortKey}
                        activeDir={sortDir}
                        onSort={handleSort}
                        className="sticky left-0 z-10 border-r border-accent-500/10 bg-primary-600"
                      />
                      {showCol('category') && (
                        <SortableHeader label="Category" sortKey="category" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('neighborhood') && (
                        <SortableHeader label="Neighborhood" sortKey="neighborhood" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('type') && (
                        <SortableHeader label="Type" sortKey="type" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('price') && (
                        <SortableHeader label="Price" sortKey="price" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('beds') && (
                        <SortableHeader label="Beds" sortKey="beds" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('baths') && (
                        <SortableHeader label="Baths" sortKey="baths" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('area') && (
                        <SortableHeader label="Area" sortKey="area" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('agent') && (
                        <SortableHeader label="Agent" sortKey="agent" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('status') && (
                        <SortableHeader label="Status" sortKey="status" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      {showCol('featured') && (
                        <SortableHeader label="Featured" sortKey="featured" activeSort={sortKey} activeDir={sortDir} onSort={handleSort} />
                      )}
                      <th className="sticky right-0 z-10 border-l border-accent-500/10 bg-primary-600 px-5 py-3 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-500/10">
                    {sortedProperties.map(({ property, category, subcategory, neighborhood, agent }) => {
                      const cover = property.images[0]
                      return (
                        <tr key={property.id} className="group transition-colors hover:bg-primary-600/30">
                          <td className="sticky left-0 z-10 min-w-[200px] max-w-[220px] border-r border-accent-500/10 bg-white px-5 py-3 transition-colors group-hover:bg-primary-600/30">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-primary-600">
                                {cover ? (
                                  <img src={cover.url} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-trenary">
                                    <IoImageOutline size={18} />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate font-medium text-main">{property.title}</p>
                                  {property.popular && <IoStar size={14} className="shrink-0 text-gold-500" />}
                                </div>
                                <p className="truncate text-xs text-trenary">{property.location}</p>
                              </div>
                            </div>
                          </td>
                          {showCol('category') && (
                            <td className="px-5 py-3 text-secondary">
                              {category?.name ?? 'Uncategorized'}
                              {subcategory && <span className="text-trenary"> · {subcategory.name}</span>}
                            </td>
                          )}
                          {showCol('neighborhood') && (
                            <td className="px-5 py-3 text-secondary">{neighborhood?.name ?? '—'}</td>
                          )}
                          {showCol('type') && (
                            <td className="px-5 py-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  property.listing_type === 'rent'
                                    ? 'bg-gold-500/20 text-main'
                                    : 'bg-primary-600 text-secondary'
                                }`}
                              >
                                {property.listing_type === 'rent' ? 'Rent' : 'Sale'}
                              </span>
                            </td>
                          )}
                          {showCol('price') && (
                            <td className="whitespace-nowrap px-5 py-3 text-secondary">
                              {formatPrice(property.price, property.listing_type)}
                            </td>
                          )}
                          {showCol('beds') && <td className="px-5 py-3 text-secondary">{property.beds ?? '—'}</td>}
                          {showCol('baths') && <td className="px-5 py-3 text-secondary">{property.baths ?? '—'}</td>}
                          {showCol('area') && (
                            <td className="whitespace-nowrap px-5 py-3 text-secondary">
                              {property.area ? `${property.area} m²` : '—'}
                            </td>
                          )}
                          {showCol('agent') && (
                            <td className="px-5 py-3 text-secondary">{agent?.name ?? 'Unassigned'}</td>
                          )}
                          {showCol('status') && (
                            <td className="px-5 py-3">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  property.status === 'published'
                                    ? 'bg-accent-500/10 text-accent-500'
                                    : 'border border-accent-500/10 text-trenary'
                                }`}
                              >
                                {property.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                            </td>
                          )}
                          {showCol('featured') && (
                            <td className="px-5 py-3">
                              {property.featured_order !== null ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gold-600">
                                  <IoStar size={12} /> Featured
                                </span>
                              ) : (
                                <span className="text-xs text-trenary">—</span>
                              )}
                            </td>
                          )}
                          <td className="sticky right-0 z-10 border-l border-accent-500/10 bg-white px-5 py-3 transition-colors group-hover:bg-primary-600/30">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/properties/${property.id}/edit`)}
                                aria-label={`Edit ${property.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                              >
                                <IoPencilOutline size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setPendingDelete(property)}
                                aria-label={`Delete ${property.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                              >
                                <IoTrashOutline size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: a table just doesn't have room to work with at
                  phone widths — two sticky columns alone (Property +
                  Actions) can eat the entire viewport, leaving nothing
                  usable to scroll through in the middle. Cards read
                  vertically instead, which phones handle far better than
                  horizontal scrolling for anything data-dense — and unlike
                  the old mobile cards, these are built from the same
                  visibleColumns state as the table, so the settings menu
                  actually does something here too. */}
              <div className="flex flex-col gap-3 md:hidden">
                {sortedProperties.map(({ property, category, subcategory, neighborhood, agent }) => {
                  const cover = property.images[0]
                  const fields = [
                    showCol('category') && {
                      label: 'Category',
                      value: subcategory ? `${category?.name ?? 'Uncategorized'} · ${subcategory.name}` : category?.name ?? 'Uncategorized',
                    },
                    showCol('neighborhood') && { label: 'Neighborhood', value: neighborhood?.name ?? '—' },
                    showCol('type') && { label: 'Type', value: property.listing_type === 'rent' ? 'Rent' : 'Sale' },
                    showCol('price') && { label: 'Price', value: formatPrice(property.price, property.listing_type) },
                    showCol('beds') && { label: 'Beds', value: property.beds ?? '—' },
                    showCol('baths') && { label: 'Baths', value: property.baths ?? '—' },
                    showCol('area') && { label: 'Area', value: property.area ? `${property.area} m²` : '—' },
                    showCol('agent') && { label: 'Agent', value: agent?.name ?? 'Unassigned' },
                    showCol('status') && {
                      label: 'Status',
                      value: property.status === 'published' ? 'Published' : 'Draft',
                    },
                    showCol('featured') && {
                      label: 'Featured',
                      value: property.featured_order !== null ? 'Yes' : '—',
                    },
                  ].filter(Boolean)

                  return (
                    <div key={property.id} className="rounded-[16px] border border-accent-500/10 bg-white p-4">
                      <div className="flex gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[12px] bg-primary-600">
                          {cover ? (
                            <img src={cover.url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-trenary">
                              <IoImageOutline size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="truncate font-medium text-main">{property.title}</p>
                            {property.popular && <IoStar size={14} className="shrink-0 text-gold-500" />}
                          </div>
                          <p className="truncate text-xs text-trenary">{property.location}</p>
                        </div>
                      </div>

                      {fields.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-accent-500/10 pt-3 text-sm">
                          {fields.map((field) => (
                            <div key={field.label} className="min-w-0">
                              <p className="text-[11px] uppercase tracking-wide text-trenary">{field.label}</p>
                              <p className="truncate text-main">{field.value}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-3 flex gap-2 border-t border-accent-500/10 pt-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/properties/${property.id}/edit`)}
                          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[12px] text-sm font-medium text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                        >
                          <IoPencilOutline size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDelete(property)}
                          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-[12px] text-sm font-medium text-secondary hover:bg-primary-600 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                        >
                          <IoTrashOutline size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This removes the listing and its photos. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
