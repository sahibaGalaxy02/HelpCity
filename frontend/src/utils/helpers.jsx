import React from 'react'
import { MdOutlineRoad } from 'react-icons/md'
import { FaTrash, FaBolt, FaTint } from 'react-icons/fa'
import { FiAlertCircle, FiGrid } from 'react-icons/fi'

export const getCategoryStyle = (category) => {
  const map = {
    Road: 'cat-road',
    Garbage: 'cat-garbage',
    Water: 'cat-water',
    Electricity: 'cat-electricity',
    Other: 'cat-other',
  }
  return map[category] || 'cat-other'
}

export const getStatusStyle = (status) => {
  const map = {
    Pending: 'status-pending',
    'In Progress': 'status-in-progress',
    Resolved: 'status-resolved',
    Rejected: 'status-rejected',
  }
  return map[status] || 'status-pending'
}

export const getCategoryIcon = (category, size = 13) => {
  const map = {
    Road: <MdOutlineRoad size={size} />,
    Garbage: <FaTrash size={size - 2} />,
    Water: <FaTint size={size - 2} />,
    Electricity: <FaBolt size={size - 2} />,
    Other: <FiAlertCircle size={size} />,
  }
  return map[category] || <FiAlertCircle size={size} />
}

export const getCategoryIconAll = (size = 14) => <FiGrid size={size} />

export const getStatusIcon = (status) => {
  const map = {
    Pending: '🕐',
    'In Progress': '🔧',
    Resolved: '✅',
    Rejected: '❌',
  }
  return map[status] || '🕐'
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const CATEGORIES = ['Road', 'Garbage', 'Water', 'Electricity', 'Other']
export const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected']
export const DEPARTMENTS = [
  'Roads & Infrastructure',
  'Sanitation & Waste',
  'Water Supply',
  'Electricity Board',
  'Municipal Corporation',
  'Public Works',
  'Other',
]