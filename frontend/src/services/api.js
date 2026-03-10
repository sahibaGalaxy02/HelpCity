import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('helpcity_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('helpcity_token')
      localStorage.removeItem('helpcity_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  login: (idToken, name) => api.post('/auth/login', { idToken, name }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
}

// Issues
export const issuesAPI = {
  getAll: (params) => api.get('/issues', { params }),
  getOne: (id) => api.get(`/issues/${id}`),
  create: (formData) => api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/issues/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/issues/${id}`),
  upvote: (id) => api.post(`/issues/${id}/upvote`),
  getMy: (params) => api.get('/issues/my', { params }),
}

// Admin
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getIssues: (params) => api.get('/admin/issues', { params }),
  updateStatus: (id, data) => api.put(`/admin/status/${id}`, data),
  deleteIssue: (id) => api.delete(`/admin/issues/${id}`),
  getUsers: (params) => api.get('/admin/users', { params }),
}

export default api
