import { useNavigate, Link } from 'react-router'
import { IoMenuOutline, IoLogOutOutline, IoHomeOutline } from 'react-icons/io5'
import { useAuth } from '../context/AuthContext'

export default function Header({ title, onMenuClick }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-accent-500/10 bg-white/80 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-[12px] text-secondary hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 lg:hidden"
        >
          <IoMenuOutline size={22} />
        </button>
        <h1 className="text-lg font-semibold text-main md:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-[12px] border border-accent-500/10 px-3 py-2 text-sm font-medium text-secondary transition-colors hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 md:px-4"
        >
          <IoHomeOutline size={18} />
          <span className="hidden sm:inline">View Site</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-[12px] border border-accent-500/10 px-3 py-2 text-sm font-medium text-secondary transition-colors hover:border-accent-500/30 hover:text-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 md:px-4"
        >
          <IoLogOutOutline size={18} />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  )
}
