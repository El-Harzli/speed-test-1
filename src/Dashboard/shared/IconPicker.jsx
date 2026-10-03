import { CURATED_ICONS } from './curatedIcons'

export default function IconPicker({ value, onChange }) {
  return (
    <div className="rounded-[16px] border border-accent-500/10 p-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {CURATED_ICONS.map(({ key, label, Icon }) => {
          const isSelected = value === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              aria-pressed={isSelected}
              aria-label={label}
              title={label}
              className={`flex h-11 w-11 items-center justify-center rounded-[12px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                isSelected
                  ? 'bg-accent-500 text-white'
                  : 'border border-accent-500/10 text-secondary hover:border-accent-500/30 hover:text-accent-500'
              }`}
            >
              <Icon size={20} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
