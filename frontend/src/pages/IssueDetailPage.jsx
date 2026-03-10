import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchIssue } from '../redux/slices/issuesSlice'
import { toggleUpvote, deleteIssue } from '../redux/slices/issuesSlice'
import { toast } from 'react-hot-toast'
import { FiMapPin, FiThumbsUp, FiClock, FiUser, FiArrowLeft, FiTrash2, FiTag } from 'react-icons/fi'
import { getCategoryStyle, getStatusStyle, getCategoryIcon, getStatusIcon, formatDateTime } from '../utils/helpers'

export default function IssueDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { currentIssue: issue, loading } = useSelector(s => s.issues)
  const { user, isAuthenticated } = useSelector(s => s.auth)

  useEffect(() => {
    dispatch(fetchIssue(id))
  }, [id, dispatch])

  const handleUpvote = () => {
    if (!isAuthenticated) { toast.error('Please login to upvote'); return }
    dispatch(toggleUpvote(id))
  }

  const handleDelete = async () => {
    if (!confirm('Delete this issue?')) return
    await dispatch(deleteIssue(id))
    toast.success('Issue deleted')
    navigate('/')
  }

  const isOwner = user && issue?.createdBy?._id === user._id
  const isAdmin = user?.role === 'admin'
  const isUpvoted = issue?.upvotes?.includes(user?._id)
  const upvoteCount = issue?.upvoteCount ?? issue?.upvotes?.length ?? 0

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card animate-pulse">
          <div className="aspect-video bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (!issue) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h2 className="font-semibold text-gray-800 text-lg mb-2">Issue not found</h2>
      <Link to="/" className="btn-primary mt-4 inline-flex">← Back to Feed</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Image */}
          {issue.imageUrl && (
            <div className="card overflow-hidden">
              <img src={issue.imageUrl} alt={issue.title} className="w-full aspect-video object-cover" />
            </div>
          )}

          {/* Content card */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`category-badge ${getCategoryStyle(issue.category)}`}>
                  {getCategoryIcon(issue.category)} {issue.category}
                </span>
                <span className={`status-badge ${getStatusStyle(issue.status)}`}>
                  {getStatusIcon(issue.status)} {issue.status}
                </span>
              </div>
              {(isOwner || isAdmin) && (
                <button onClick={handleDelete} className="text-red-500 hover:text-red-700 transition-colors p-1">
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>

            <h1 className="font-display font-bold text-xl text-gray-900 mb-3">{issue.title}</h1>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{issue.description}</p>

            {/* Admin notes */}
            {issue.adminNotes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">📋 Admin Note</p>
                <p className="text-sm text-blue-600">{issue.adminNotes}</p>
              </div>
            )}

            {/* Department */}
            {issue.department && (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <FiTag size={13} />
                <span>Assigned to: <strong className="text-gray-700">{issue.department}</strong></span>
              </div>
            )}
          </div>

          {/* Location */}
          {issue.location && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FiMapPin size={14} /> Location
              </h3>
              {issue.location.address && (
                <p className="text-sm text-gray-600 mb-3">{issue.location.address}</p>
              )}
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  title="Issue location"
                  src={`https://maps.google.com/maps?q=${issue.location.lat},${issue.location.lng}&z=15&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                {issue.location.lat?.toFixed(6)}, {issue.location.lng?.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Upvote */}
          <div className="card p-5 text-center">
            <p className="text-xs font-medium text-gray-500 mb-3">Community Support</p>
            <button
              onClick={handleUpvote}
              className={`w-full flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                isUpvoted
                  ? 'bg-brand-50 text-brand-600 border-2 border-brand-200'
                  : 'bg-gray-50 text-gray-500 border-2 border-gray-100 hover:border-gray-200'
              }`}
            >
              <FiThumbsUp size={24} className={isUpvoted ? 'fill-brand-200' : ''} />
              <span className="font-display font-bold text-3xl">{upvoteCount}</span>
              <span className="text-xs">{isUpvoted ? 'You upvoted' : 'Upvote this issue'}</span>
            </button>
          </div>

          {/* Reporter info */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Reported By</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                <FiUser className="text-brand-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {issue.createdBy?.name || 'Anonymous Citizen'}
                </p>
                <p className="text-xs text-gray-400">Citizen Reporter</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <FiClock size={11} />
              <span>{formatDateTime(issue.createdAt)}</span>
            </div>
          </div>

          {/* Status timeline */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Status</h3>
            {['Pending', 'In Progress', 'Resolved'].map((s, i) => {
              const statuses = ['Pending', 'In Progress', 'Resolved']
              const currentIdx = statuses.indexOf(issue.status)
              const isActive = issue.status === s
              const isDone = currentIdx > i
              const isRejected = issue.status === 'Rejected'

              return (
                <div key={s} className="flex items-start gap-3 mb-3 last:mb-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs ${
                    isRejected && s === 'Pending' ? 'bg-red-100 text-red-500' :
                    isActive ? 'bg-brand-600 text-white' :
                    isDone ? 'bg-brand-100 text-brand-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone || (isActive && !isRejected) ? '✓' : i + 1}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                      {isRejected && s === 'Pending' ? 'Rejected' : s}
                    </p>
                    {isActive && (
                      <p className="text-xs text-gray-400">{formatDateTime(issue.updatedAt)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Admin panel for this issue */}
          {isAdmin && (
            <div className="card p-5 border-amber-200 bg-amber-50">
              <p className="text-xs font-semibold text-amber-700 mb-2">🔐 Admin: Manage in Dashboard</p>
              <Link to="/admin" className="btn-secondary w-full text-xs py-2">
                Open Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
