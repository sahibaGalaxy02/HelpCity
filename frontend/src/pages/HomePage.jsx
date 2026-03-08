import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchIssues, setFilters } from '../redux/slices/issuesSlice'
import IssueCard from '../components/common/IssueCard'
import { CATEGORIES, STATUSES, getCategoryIcon } from '../utils/helpers'
import { FiPlus, FiFilter, FiSearch, FiAlertCircle } from 'react-icons/fi'

export default function HomePage() {
  const dispatch = useDispatch()
  const { items, loading, error, pagination, filters } = useSelector(s => s.issues)
  const { isAuthenticated } = useSelector(s => s.auth)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchIssues({
      category: filters.category !== 'All' ? filters.category : undefined,
      status: filters.status !== 'All' ? filters.status : undefined,
      sort: filters.sort,
      page,
      limit: 12,
    }))
  }, [dispatch, filters, page])

  const handleFilter = (key, val) => {
    dispatch(setFilters({ [key]: val }))
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900">
              Civic Issues in Your City
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {pagination?.total || 0} issues reported by citizens
            </p>
          </div>
          {isAuthenticated ? (
            <Link to="/report" className="btn-primary w-fit">
              <FiPlus size={16} /> Report Issue
            </Link>
          ) : (
            <Link to="/login" className="btn-primary w-fit">
              Login to Report
            </Link>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'All Issues', value: pagination?.total || 0, icon: '📋', key: 'All', type: 'category' },
          ...CATEGORIES.map(cat => ({ label: cat, value: '', icon: getCategoryIcon(cat), key: cat, type: 'category' })),
        ].map(item => (
          <button
            key={item.key}
            onClick={() => handleFilter('category', item.key)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              filters.category === item.key
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <FiFilter size={14} />
          <span>Filter:</span>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 flex-wrap">
          {['All', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => handleFilter('status', s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.status === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-400">Sort:</span>
          <select
            value={filters.sort}
            onChange={e => handleFilter('sort', e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-brand-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* Issues grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <FiAlertCircle className="mx-auto text-4xl text-red-400 mb-3" />
          <p className="text-gray-600 font-medium">Failed to load issues</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏙️</div>
          <h3 className="font-semibold text-gray-800 text-lg mb-2">No issues found</h3>
          <p className="text-gray-400 text-sm mb-6">
            {filters.category !== 'All' || filters.status !== 'All'
              ? 'Try removing some filters'
              : 'Be the first to report a civic issue!'}
          </p>
          {isAuthenticated && (
            <Link to="/report" className="btn-primary">
              <FiPlus size={16} /> Report First Issue
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(issue => (
              <IssueCard key={issue._id} issue={issue} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="flex items-center px-4 text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
