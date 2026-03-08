import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { issuesAPI } from '../../services/api'

export const fetchIssues = createAsyncThunk(
  'issues/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await issuesAPI.getAll(params)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch issues')
    }
  }
)

export const fetchIssue = createAsyncThunk(
  'issues/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await issuesAPI.getOne(id)
      return data.issue
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch issue')
    }
  }
)

export const createIssue = createAsyncThunk(
  'issues/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await issuesAPI.create(formData)
      return data.issue
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create issue')
    }
  }
)

export const deleteIssue = createAsyncThunk(
  'issues/delete',
  async (id, { rejectWithValue }) => {
    try {
      await issuesAPI.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete issue')
    }
  }
)

export const toggleUpvote = createAsyncThunk(
  'issues/upvote',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await issuesAPI.upvote(id)
      return { id, ...data }
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upvote')
    }
  }
)

export const fetchMyIssues = createAsyncThunk(
  'issues/fetchMy',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await issuesAPI.getMy(params)
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch your issues')
    }
  }
)

const issuesSlice = createSlice({
  name: 'issues',
  initialState: {
    items: [],
    myIssues: [],
    currentIssue: null,
    pagination: null,
    loading: false,
    error: null,
    filters: {
      category: 'All',
      status: 'All',
      sort: 'newest',
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.issues
        state.pagination = action.payload.pagination
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchIssue.pending, (state) => { state.loading = true })
      .addCase(fetchIssue.fulfilled, (state, action) => {
        state.loading = false
        state.currentIssue = action.payload
      })
      .addCase(fetchIssue.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(deleteIssue.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload)
        state.myIssues = state.myIssues.filter(i => i._id !== action.payload)
      })
      .addCase(toggleUpvote.fulfilled, (state, action) => {
        const { id, upvoted, upvoteCount } = action.payload
        const issue = state.items.find(i => i._id === id)
        if (issue) {
          issue.upvoteCount = upvoteCount
        }
        if (state.currentIssue?._id === id) {
          state.currentIssue.upvoteCount = upvoteCount
        }
      })
      .addCase(fetchMyIssues.fulfilled, (state, action) => {
        state.myIssues = action.payload.issues
      })
  },
})

export const { setFilters, clearCurrentIssue, clearError } = issuesSlice.actions
export default issuesSlice.reducer
