import { IoChevronDownOutline } from 'react-icons/io5'

export default function Select({ id, value, onChange, options, placeholder, invalid = false }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full appearance-none rounded-[12px] border bg-primary-500 px-4 py-3 pr-10 text-main focus-visible:outline-none focus-visible:ring-2 ${
          invalid ? 'border-error-500/50 focus-visible:ring-error-500' : 'border-accent-500/10 focus-visible:ring-accent-500'
        }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IoChevronDownOutline
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-trenary"
      />
    </div>
  )
}