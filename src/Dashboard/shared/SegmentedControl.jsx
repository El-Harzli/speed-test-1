export default function SegmentedControl({ options, value, onChange, fullWidth = false }) {
  return (
    <div className={`inline-flex rounded-[12px] border border-accent-500/10 bg-white p-1 ${fullWidth ? 'w-full' : ''}`}>
      {options.map((option) => {
        const isActive = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`rounded-[10px] px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
              fullWidth ? 'flex-1' : ''
            } ${isActive ? 'bg-accent-500 text-white' : 'text-secondary hover:text-accent-500'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}