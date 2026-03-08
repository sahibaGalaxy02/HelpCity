import { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from './redux/slices/authSlice'

import Layout from './components/layout/Layout'
const LoginPage = lazy(() => import('./pages/LoginPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage'))
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage'))
const UserDashboard = lazy(() => import('./pages/UserDashboard'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMe())
    }
  }, [isAuthenticated, dispatch])

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <Routes>
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="issues/:id" element={<IssueDetailPage />} />
          <Route path="report" element={
            <ProtectedRoute><ReportIssuePage /></ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute><UserDashboard /></ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
