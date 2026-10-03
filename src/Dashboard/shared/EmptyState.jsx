export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-accent-500/20 px-6 py-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-accent-500">
          <Icon size={22} />
        </div>
      )}
      <h3 className="text-base font-semibold text-main">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-trenary">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
