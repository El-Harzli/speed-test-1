import { getIconByKey } from './curatedIcons'

export default function AmenityMultiSelect({ amenities, selectedIds, onToggle, emptyMessage }) {
  if (amenities.length === 0) {
    return <p className="text-sm text-trenary">{emptyMessage ?? 'No amenities available yet.'}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {amenities.map((amenity) => {
        const isSelected = selectedIds.includes(amenity.id)
        const Icon = getIconByKey(amenity.icon)

        return (
          <button
            key={amenity.id}
            type="button"
            onClick={() => onToggle(amenity.id)}
            aria-pressed={isSelected}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
              isSelected
                ? 'bg-accent-500 text-white'
                : 'border border-accent-500/10 text-secondary hover:border-accent-500/30 hover:text-accent-500'
            }`}
          >
            <Icon size={16} />
            {amenity.name}
          </button>
        )
      })}
    </div>
  )
}
