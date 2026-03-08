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
    <Link to={`/issues/${issue._id}`} className="card hover:shadow-card-hover transition-all duration-200 group block animate-fade-in">
      {/* Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        {issue.imageUrl ? (
          <img
            src={issue.imageUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-gray-100 to-gray-200">
            {getCategoryIcon(issue.category)}
          </div>
        )}
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
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2 group-hover:text-brand-700 transition-colors">
          {issue.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{issue.description}</p>

        {/* Location */}
        {issue.location?.address && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <FiMapPin size={11} />
            <span className="truncate">{issue.location.address}</span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all ${
                isUpvoted
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <FiThumbsUp size={12} />
              <span>{upvoteCount}</span>
            </button>

            {/* Time */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FiClock size={11} />
              <span>{formatDate(issue.createdAt)}</span>
            </div>
          </div>

          {/* Reporter */}
          <div className="text-xs text-gray-400 truncate max-w-[100px]">
            {issue.createdBy?.name || 'Citizen'}
          </div>
        </div>
      </div>

      {/* Delete button for own issues */}
      {showDelete && (
        <div className="px-4 pb-3">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
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
