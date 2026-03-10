import { Link } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🏙️</div>
        <h1 className="font-display font-bold text-4xl text-gray-900 mb-3">404</h1>
        <h2 className="font-semibold text-xl text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary">
          <FiHome size={16} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
