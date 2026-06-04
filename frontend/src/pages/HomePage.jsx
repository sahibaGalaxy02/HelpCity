import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiAlertCircle, FiFilter, FiPlus, FiGrid } from 'react-icons/fi'
import IssueCard from '../components/common/IssueCard'
import { fetchIssues, setFilters } from '../redux/slices/issuesSlice'
import { CATEGORIES, STATUSES, getCategoryIcon, getCategoryIconAll } from '../utils/helpers'
import '../App.css'

export default function HomePage() {
  const dispatch = useDispatch()
  const { items, loading, error, pagination, filters } = useSelector((state) => state.issues)
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [page, setPage] = useState(1)

  useEffect(() => {
    dispatch(fetchIssues({
      category: filters.category !== 'All' ? filters.category : undefined,
      status: filters.status !== 'All' ? filters.status : undefined,
      sort: filters.sort,
      page,
      limit: 12,
    }))
  }, [dispatch, filters, page])

  const handleFilter = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    setPage(1)
  }

  const categoryTabs = [
    { label: 'All Issues', key: 'All', icon: getCategoryIconAll(14) },
    ...CATEGORIES.map((cat) => ({ label: cat, key: cat, icon: getCategoryIcon(cat, 14) })),
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Improve Your City Together</h1>
          <p className="hero-subtitle">
            Report civic problems like garbage, potholes, water leaks and
            electricity issues. Help authorities fix them faster.
          </p>
          <Link to={isAuthenticated ? '/report' : '/login'} className="btn-primary hero-btn">
            <FiPlus size={16} /> {isAuthenticated ? 'Report an Issue' : 'Login to Report'}
          </Link>
        </div>
      </section>

      <div className="container">
        <div className="header-row">
          <div>
            <h2>Civic Issues in Your City</h2>
            <p className="subtitle">{pagination?.total || 0} issues reported by citizens</p>
          </div>
          <Link to={isAuthenticated ? '/report' : '/login'} className="btn-primary">
            {isAuthenticated ? 'Report Issue' : 'Login to Report'}
          </Link>
        </div>

        {/* Category tabs with icons */}
        <div className="category-grid">
          {categoryTabs.map((item) => (
            <button
              key={item.key}
              onClick={() => handleFilter('category', item.key)}
              className={`category-btn ${filters.category === item.key ? 'active' : ''}`}
            >
              <span className="category-btn-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-label">
            <FiFilter size={14} />
            <span>Filter:</span>
          </div>
          <div className="filter-chips">
            {['All', ...STATUSES].map((status) => (
              <button
                key={status}
                onClick={() => handleFilter('status', status)}
                className={`filter-chip ${filters.status === status ? 'active' : ''}`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="sort-wrap">
            <span className="sort-label">Sort:</span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilter('sort', e.target.value)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Upvoted</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="issues-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          <div className="empty-state">
            <FiAlertCircle className="error-icon" />
            <h3>Failed to load issues</h3>
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FiGrid size={40} className="text-gray-300" />
            </div>
            <h3>No issues found</h3>
            <p>
              {filters.category !== 'All' || filters.status !== 'All'
                ? 'Try removing some filters'
                : 'Be the first citizen to report a civic problem in your city.'}
            </p>
            {isAuthenticated && (
              <Link to="/report" className="btn-primary">
                Report First Issue
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="issues-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((issue) => (
                <IssueCard key={issue._id} issue={issue} />
              ))}
            </div>
            {pagination && pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-primary pagination-btn"
                >
                  Prev
                </button>
                <span className="pagination-text">Page {page} of {pagination.pages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="btn-primary pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}