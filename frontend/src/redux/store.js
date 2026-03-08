import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import issuesReducer from './slices/issuesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issuesReducer,
  },
})
