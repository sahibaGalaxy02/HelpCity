import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { adminAPI } from '../services/api'
import { CATEGORIES, STATUSES, DEPARTMENTS, getCategoryIcon, getCategoryStyle, getStatusStyle, formatDateTime } from '../utils/helpers'
import { FiFilter, FiSearch, FiTrash2, FiEdit3, FiCheck, FiX, FiUsers, FiAlertCircle, FiRefreshCw, FiExternalLink } from 'react-icons/fi'

export default function AdminDashboard() {
  const { user } = useSelector(s => s.auth)
  const [issues, setIssues] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState(null)
  const [filters, setFilters] = useState({ category: 'All', status: 'All', sort: 'newest', page: 1, search: '' })
  const [editingIssue, setEditingIssue] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', department: '', adminNotes: '' })
  const [tab, setTab] = useState('issues') // 'issues' | 'stats'

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        ...filters,
        category: filters.category !== 'All' ? filters.category : undefined,
        status: filters.status !== 'All' ? filters.status : undefined,
      }
      const { data } = await adminAPI.getIssues(params)
      setIssues(data.issues)
      setPagination(data.pagination)
      setStats(data.stats)
    } catch (err) {
      toast.error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusUpdate = async () => {
    if (!editingIssue) return
    try {
      await adminAPI.updateStatus(editingIssue._id, editForm)
      toast.success('Issue updated successfully')
      setEditingIssue(null)
      fetchData()
    } catch {
      toast.error('Failed to update issue')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this issue? This cannot be undone.')) return
    try {
      await adminAPI.deleteIssue(id)
      toast.success('Issue deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete issue')
    }
  }

  const openEdit = (issue) => {
    setEditingIssue(issue)
    setEditForm({
      status: issue.status,
      department: issue.department || '',
      adminNotes: issue.adminNotes || '',
    })
  }

  const filterChange = (key, val) => {
    setFilters(f => ({ ...f, [key]: val, page: 1 }))
  }

  const statusColors = {
    Pending: 'text-amber-600',
    'In Progress': 'text-blue-600',
    Resolved: 'text-green-600',
    Rejected: 'text-red-600',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage civic issue reports across the city</p>
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm py-2">
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Issues', value: stats.total, icon: '📋', color: 'bg-gray-50' },
            { label: 'Pending', value: stats.byStatus?.Pending || 0, icon: '🕐', color: 'bg-amber-50' },
            { label: 'In Progress', value: stats.byStatus?.['In Progress'] || 0, icon: '🔧', color: 'bg-blue-50' },
            { label: 'Resolved', value: stats.byStatus?.Resolved || 0, icon: '✅', color: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-4 border border-gray-100`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-display font-bold text-2xl text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search issues..."
              value={filters.search}
              onChange={e => filterChange('search', e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          {/* Category */}
          <select
            value={filters.category}
            onChange={e => filterChange('category', e.target.value)}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>

          {/* Status */}
          <select
            value={filters.status}
            onChange={e => filterChange('status', e.target.value)}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>

          {/* Sort */}
          <select
            value={filters.sort}
            onChange={e => filterChange('sort', e.target.value)}
            className="input-field w-auto py-2 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Upvoted</option>
          </select>
        </div>
      </div>

      {/* Issues table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm mt-3">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center">
            <FiAlertCircle className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500">No issues found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Issue</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Reporter</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {issues.map(issue => (
                    <tr key={issue._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {issue.imageUrl ? (
                            <img src={issue.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                              {getCategoryIcon(issue.category)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{issue.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{issue.location?.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`category-badge ${getCategoryStyle(issue.category)}`}>
                          {getCategoryIcon(issue.category)} {issue.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`status-badge ${getStatusStyle(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-sm text-gray-700">{issue.createdBy?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{issue.createdBy?.phone}</p>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                        {formatDateTime(issue.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link to={`/issues/${issue._id}`} target="_blank" className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="View">
                            <FiExternalLink size={14} />
                          </Link>
                          <button onClick={() => openEdit(issue)} className="p-1.5 text-brand-500 hover:text-brand-700 rounded-lg hover:bg-brand-50 transition-colors" title="Edit">
                            <FiEdit3 size={14} />
                          </button>
                          <button onClick={() => handleDelete(issue._id)} className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Showing {((filters.page - 1) * 20) + 1}–{Math.min(filters.page * 20, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => filterChange('page', Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => filterChange('page', Math.min(pagination.pages, filters.page + 1))}
                    disabled={filters.page === pagination.pages}
                    className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingIssue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg text-gray-900">Update Issue</h3>
              <button onClick={() => setEditingIssue(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="mb-3 p-3 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{editingIssue.title}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="input-field"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign Department</label>
                <select
                  value={editForm.department}
                  onChange={e => setEditForm(f => ({ ...f, department: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select department...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Notes</label>
                <textarea
                  value={editForm.adminNotes}
                  onChange={e => setEditForm(f => ({ ...f, adminNotes: e.target.value }))}
                  placeholder="Add notes visible to the reporter..."
                  className="input-field resize-none h-24 text-sm"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingIssue(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} className="btn-primary flex-1">
                <FiCheck size={16} /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
