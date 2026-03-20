import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { logout } from '../../redux/slices/authSlice'
import { FiMapPin, FiPlus, FiUser, FiLogOut, FiMenu, FiX, FiShield } from 'react-icons/fi'

export default function Navbar() {
  const { isAuthenticated, user } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 sm:px-6">
      <div className="glass-panel mx-auto max-w-7xl rounded-[1.6rem] border border-white/55 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-display font-bold text-xl text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-sky-500 to-orange-400 text-white shadow-[0_14px_28px_rgba(14,165,233,0.28)]">
              <FiMapPin className="text-base" />
            </div>
            <div className="leading-tight">
              <span>Help<span className="text-brand-600">City</span></span>
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Civic response</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-white/70 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
            <Link to="/" className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/') ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
              Issues Feed
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive('/dashboard') ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
                  My Reports
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${isActive('/admin') ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <FiShield size={14} /> Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/report" className="btn-primary text-sm py-2.5 px-5">
                  <FiPlus size={16} /> Report Issue
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/80 px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-sky-100">
                      <span className="text-brand-700 text-sm font-semibold">
                        {user?.name ? user.name[0].toUpperCase() : user?.phone?.slice(-2)}
                      </span>
                    </div>
                    <div className="text-left leading-tight">
                      <span className="block text-sm font-semibold text-slate-800">{user?.name || 'User'}</span>
                      <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-400">{user?.role || 'citizen'}</span>
                    </div>
                  </button>
                  {dropdownOpen && (
                    <div className="glass-panel absolute right-0 mt-3 w-52 rounded-2xl border border-white/60 py-2 z-50">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setDropdownOpen(false)}>
                        <FiUser size={14} /> My Dashboard
                      </Link>
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2.5 px-5">Login</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden rounded-2xl border border-white/50 bg-white/80 p-2.5 shadow-sm" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="glass-panel mx-auto mt-3 max-w-7xl rounded-[1.5rem] border border-white/60 px-4 py-4 space-y-2 md:hidden">
          <Link to="/" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>Issues Feed</Link>
          {isAuthenticated && (
            <>
              <Link to="/report" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>+ Report Issue</Link>
              <Link to="/dashboard" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>My Reports</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Logout</button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}

      {/* Close dropdown on outside click */}
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </nav>
  )
}
