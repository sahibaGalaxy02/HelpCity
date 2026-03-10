import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '../../services/api'

// Load persisted auth state safely to avoid app crash on bad localStorage data
const storedToken = localStorage.getItem('helpcity_token')
const storedUserRaw = localStorage.getItem('helpcity_user')

const parseStoredUser = () => {
  if (!storedUserRaw) return null
  try {
    return JSON.parse(storedUserRaw)
  } catch {
    localStorage.removeItem('helpcity_user')
    return null
  }
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ idToken, name }, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.login(idToken, name)
      localStorage.setItem('helpcity_token', data.token)
      localStorage.setItem('helpcity_user', JSON.stringify(data.user))
      return data
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Login failed')
    }
  }
)

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.getMe()
      localStorage.setItem('helpcity_user', JSON.stringify(data.user))
      return data.user
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get profile')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await authAPI.updateProfile(profileData)
      localStorage.setItem('helpcity_user', JSON.stringify(data.user))
      return data.user
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Update failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: parseStoredUser(),
    token: storedToken || null,
    isAuthenticated: !!storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('helpcity_token')
      localStorage.removeItem('helpcity_user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
