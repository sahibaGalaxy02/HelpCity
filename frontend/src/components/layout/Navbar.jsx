import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useState } from 'react'
import { logout } from '../../redux/slices/authSlice'
import { FiMapPin, FiPlus, FiUser, FiLogOut, FiSettings, FiMenu, FiX, FiShield } from 'react-icons/fi'

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <FiMapPin className="text-white text-sm" />
            </div>
            <span>Help<span className="text-brand-600">City</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              Issues Feed
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  My Reports
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isActive('/admin') ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}>
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
                <Link to="/report" className="btn-primary text-sm py-2 px-4">
                  <FiPlus size={16} /> Report Issue
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-700 text-sm font-semibold">
                        {user?.name ? user.name[0].toUpperCase() : user?.phone?.slice(-2)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                        <FiUser size={14} /> My Dashboard
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                        <FiLogOut size={14} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">Login</Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          <Link to="/" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Issues Feed</Link>
          {isAuthenticated && (
            <>
              <Link to="/report" className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50" onClick={() => setMenuOpen(false)}>+ Report Issue</Link>
              <Link to="/dashboard" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>My Reports</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">Logout</button>
            </>
          )}
          {!isAuthenticated && (
            <Link to="/login" className="block px-3 py-2 rounded-lg text-sm font-medium text-brand-600" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}

      {/* Close dropdown on outside click */}
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </nav>
  )
}
