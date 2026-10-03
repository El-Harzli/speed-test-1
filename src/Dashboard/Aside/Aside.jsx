import { NavLink } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IoGridOutline,
  IoBusinessOutline,
  IoPeopleOutline,
  IoPricetagsOutline,
  IoSparklesOutline,
  IoSettingsOutline,
  IoStarOutline,
  IoLocationOutline,
  IoClose,
} from 'react-icons/io5'
import useBodyScrollLock from '../shared/useBodyScrollLock'

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: IoGridOutline, end: true },
  { to: '/admin/properties', label: 'Properties', icon: IoBusinessOutline },
  { to: '/admin/featured', label: 'Featured', icon: IoStarOutline },
  { to: '/admin/neighborhoods', label: 'Neighborhoods', icon: IoLocationOutline },
  { to: '/admin/agents', label: 'Agents', icon: IoPeopleOutline },
  { to: '/admin/categories', label: 'Categories', icon: IoPricetagsOutline },
  { to: '/admin/conveniences', label: 'Conveniences', icon: IoSparklesOutline },
  { to: '/admin/settings', label: 'Settings', icon: IoSettingsOutline },
]

function NavList({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1.5">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-[12px] px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-500 text-white'
                : 'text-secondary hover:bg-primary-600 hover:text-accent-500'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function Aside({ isOpen, onClose }) {
  // Only the mobile off-canvas drawer sits behind a backdrop the user
  // could otherwise scroll through — the desktop sidebar is static in
  // the normal document flow, so it never needs the lock.
  useBodyScrollLock(isOpen)

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-accent-500/10 bg-white px-4 py-6">
        <div className="mb-8 px-2">
          <span className="text-lg font-semibold text-main">Agency Admin</span>
        </div>
        <NavList />
      </aside>

      {/* Mobile / tablet: off-canvas drawer, same slide-in + backdrop pattern as the public filter panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 touch-none bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white px-4 py-6 lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="mb-8 flex items-center justify-between px-2">
                <span className="text-lg font-semibold text-main">Agency Admin</span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-secondary hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  <IoClose size={22} />
                </button>
              </div>
              <NavList onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}