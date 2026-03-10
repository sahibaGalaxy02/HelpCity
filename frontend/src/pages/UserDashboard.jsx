import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchMyIssues } from '../redux/slices/issuesSlice'
import IssueCard from '../components/common/IssueCard'
import { FiPlus, FiUser, FiPhone, FiCalendar, FiAlertCircle } from 'react-icons/fi'
import { formatDate, getStatusStyle } from '../utils/helpers'

export default function UserDashboard() {
  const dispatch = useDispatch()
  const { myIssues, loading } = useSelector(s => s.issues)
  const { user } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(fetchMyIssues())
  }, [dispatch])

  const statusCounts = myIssues.reduce((acc, issue) => {
    acc[issue.status] = (acc[issue.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-2xl text-gray-900 mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-3">
                <span className="font-bold text-brand-700 text-2xl">
                  {user?.name ? user.name[0].toUpperCase() : '👤'}
                </span>
              </div>
              <h2 className="font-semibold text-gray-900">{user?.name || 'Citizen'}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{user?.phone}</p>
              <span className="mt-2 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full capitalize">
                {user?.role}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiCalendar size={12} />
                <span>Joined {formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiAlertCircle size={12} />
                <span>{myIssues.length} issues reported</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Issues</h3>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`status-badge ${getStatusStyle(status)} text-xs`}>{status}</span>
                  <span className="font-semibold text-gray-700 text-sm">{count}</span>
                </div>
              ))}
              {Object.keys(statusCounts).length === 0 && (
                <p className="text-xs text-gray-400">No issues yet</p>
              )}
            </div>
          </div>

          <Link to="/report" className="btn-primary w-full text-sm">
            <FiPlus size={16} /> Report New Issue
          </Link>
        </div>

        {/* Issues list */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">My Reported Issues ({myIssues.length})</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : myIssues.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="font-semibold text-gray-700 mb-2">No issues reported yet</h3>
              <p className="text-gray-400 text-sm mb-5">Start contributing to your city by reporting civic issues</p>
              <Link to="/report" className="btn-primary">
                <FiPlus size={16} /> Report Your First Issue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myIssues.map(issue => (
                <IssueCard key={issue._id} issue={issue} showDelete />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
