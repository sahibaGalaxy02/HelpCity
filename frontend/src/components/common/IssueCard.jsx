import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiMapPin, FiThumbsUp, FiClock, FiTrash2 } from 'react-icons/fi'
import { toggleUpvote, deleteIssue } from '../../redux/slices/issuesSlice'
import { toast } from 'react-hot-toast'
import { getCategoryStyle, getStatusStyle, getCategoryIcon } from '../../utils/helpers'

export default function IssueCard({ issue, showDelete = false }) {
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector(s => s.auth)

  const handleUpvote = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to upvote')
      return
    }
    dispatch(toggleUpvote(issue._id))
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    if (!confirm('Delete this issue? This cannot be undone.')) return
    dispatch(deleteIssue(issue._id))
    toast.success('Issue deleted')
  }

  const upvoteCount = issue.upvoteCount ?? issue.upvotes?.length ?? 0
  const isUpvoted = issue.upvotes?.includes(user?._id)

  return (
    <Link to={`/issues/${issue._id}`} className="card group block overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover animate-fade-in">
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-100">
        {issue.imageUrl ? (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 via-white to-orange-50 text-4xl">
            {getCategoryIcon(issue.category)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/25 via-transparent to-transparent opacity-70" />
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`status-badge ${getStatusStyle(issue.status)}`}>
            {issue.status}
          </span>
        </div>
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`category-badge ${getCategoryStyle(issue.category)}`}>
            {getCategoryIcon(issue.category)} {issue.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight text-slate-900 transition-colors group-hover:text-brand-700">
          {issue.title}
        </h3>
        <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-500">{issue.description}</p>

        {/* Location */}
        {issue.location?.address && (
          <div className="mb-3 flex items-center gap-1 text-xs text-slate-400">
            <FiMapPin size={11} />
            <span className="truncate">{issue.location.address}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all ${
                isUpvoted
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <FiThumbsUp size={12} />
              <span>{upvoteCount}</span>
            </button>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <FiClock size={11} />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
          </div>

          {/* Reporter */}
          <div className="max-w-[100px] truncate text-xs text-slate-400">
            {issue.createdBy?.name || 'Citizen'}
          </div>
        </div>
      </div>

      {/* Delete button for own issues */}
      {showDelete && (
        <div className="px-4 pb-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-red-500 transition-colors hover:text-red-700"
          >
            <FiTrash2 size={12} /> Delete
          </button>
        </div>
      )}
    </Link>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
