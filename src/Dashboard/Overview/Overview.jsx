import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  IoBusinessOutline,
  IoKeyOutline,
  IoCashOutline,
  IoCheckmarkCircleOutline,
  IoAddOutline,
  IoArrowForward,
  IoImageOutline,
  IoStar,
} from 'react-icons/io5'
import { useProperties } from '../data/PropertiesContext'
import { useCatalog } from '../data/CatalogContext'
import EmptyState from '../shared/EmptyState'
import PageSpinner from '../shared/PageSpinner'

function formatPrice(value, listingType) {
  const formatted = new Intl.NumberFormat('en-US').format(value ?? 0)
  return listingType === 'rent' ? `${formatted} MAD/mo` : `${formatted} MAD`
}

function StatCard({ icon: Icon, label, value, tone = 'accent', progress }) {
  const toneClasses = {
    accent: 'bg-accent-500/10 text-accent-500',
    gold: 'bg-gold-500/20 text-main',
    neutral: 'bg-primary-600 text-secondary',
  }

  return (
    <div className="rounded-[16px] border border-accent-500/10 bg-white p-4 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-5">
      <div className="flex items-center gap-2.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] sm:h-11 sm:w-11 ${toneClasses[tone]}`}>
          <Icon size={17} />
        </div>
        <p className="text-xl font-semibold text-main sm:text-2xl">{value}</p>
      </div>
      <p className="mt-2 truncate text-xs text-trenary sm:text-sm">{label}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-primary-600">
          <div className="h-full rounded-full bg-accent-500" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}

export default function Overview() {
  const navigate = useNavigate()
  const { properties, loading: propertiesLoading } = useProperties()
  const { categories, loading: categoriesLoading } = useCatalog()

  const stats = useMemo(() => {
    const total = properties.length
    const forRent = properties.filter((property) => property.listing_type === 'rent').length
    const forSale = properties.filter((property) => property.listing_type === 'sale').length
    const published = properties.filter((property) => property.status === 'published').length
    const draft = total - published
    return { total, forRent, forSale, published, draft }
  }, [properties])

  const recentProperties = useMemo(() => [...properties].slice(-5).reverse(), [properties])

  const categoryBreakdown = useMemo(() => {
    return categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        count: properties.filter((property) => property.category_id === category.id).length,
      }))
      .filter((category) => category.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [categories, properties])

  const publishedPct = stats.total ? Math.round((stats.published / stats.total) * 100) : 0

  if (propertiesLoading || categoriesLoading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-main md:text-2xl">Dashboard</h2>
        <p className="mt-1 text-sm text-trenary">A quick look at what&rsquo;s live and what still needs attention.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={IoBusinessOutline} label="Total properties" value={stats.total} tone="accent" />
        <StatCard icon={IoKeyOutline} label="For rent" value={stats.forRent} tone="gold" />
        <StatCard icon={IoCashOutline} label="For sale" value={stats.forSale} tone="neutral" />
        <StatCard
          icon={IoCheckmarkCircleOutline}
          label="Published"
          value={
            <>
              {stats.published}
              <span className="text-sm font-normal text-trenary">/{stats.total}</span>
            </>
          }
          tone="accent"
          progress={publishedPct}
        />
      </div>

      <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between border-b border-accent-500/10 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-main">Recently added</h3>
          {recentProperties.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/admin/properties')}
              className="flex items-center gap-1 text-sm font-medium text-accent-500 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              View all
              <IoArrowForward size={14} />
            </button>
          )}
        </div>

        {recentProperties.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState
              icon={IoBusinessOutline}
              title="No properties yet"
              description="Add your first listing to see it show up here."
              action={
                <button
                  type="button"
                  onClick={() => navigate('/admin/properties/new')}
                  className="flex items-center gap-2 rounded-[12px] bg-accent-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-600"
                >
                  <IoAddOutline size={18} />
                  Add property
                </button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-accent-500/10">
            {recentProperties.map((property) => {
              const category = categories.find((c) => c.id === property.category_id)
              const cover = property.images[0]

              return (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => navigate(`/admin/properties/${property.id}/edit`)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-primary-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-inset sm:px-6"
                >
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[10px] bg-primary-600">
                    {cover ? (
                      <img src={cover.url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-trenary">
                        <IoImageOutline size={16} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-main">{property.title}</p>
                      {property.popular && <IoStar size={12} className="shrink-0 text-gold-500" />}
                    </div>
                    <p className="truncate text-xs text-trenary">
                      {category?.name ?? 'Uncategorized'} · {property.location}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-main">{formatPrice(property.price, property.listing_type)}</p>
                    <span
                      className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        property.status === 'published'
                          ? 'bg-accent-500/10 text-accent-500'
                          : 'border border-accent-500/10 text-trenary'
                      }`}
                    >
                      {property.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-[24px] border border-accent-500/10 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        <div className="border-b border-accent-500/10 px-5 py-4 sm:px-6">
          <h3 className="text-base font-semibold text-main">Listings by category</h3>
        </div>

        <div className="p-5 sm:p-6">
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-trenary">No properties yet.</p>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((category) => {
                const pct = stats.total ? Math.round((category.count / stats.total) * 100) : 0
                return (
                  <div key={category.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-medium text-main">{category.name}</span>
                      <span className="shrink-0 text-trenary">
                        {category.count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-primary-600">
                      <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}