import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logout, clearError } from '../authSlice'

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  })
}

describe('authSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('reducers', () => {
    it('should handle logout', () => {
      const store = createMockStore({
        user: { id: 'user1', email: 'test@example.com', role: 'user' },
        token: 'mock-token',
        isAuthenticated: true,
      })

      store.dispatch(logout())

      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should handle clearError', () => {
      const store = createMockStore({
        error: 'Some error message',
      })

      store.dispatch(clearError())

      const state = store.getState().auth
      expect(state.error).toBeNull()
    })
  })

  describe('initial state', () => {
    it('should return the initial state', () => {
      const store = createMockStore()
      const state = store.getState().auth

      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('async thunk states', () => {
    it('should handle pending state', () => {
      const store = createMockStore()
      
      store.dispatch({
        type: 'auth/login/pending'
      })

      const state = store.getState().auth
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should handle fulfilled state', () => {
      const store = createMockStore()
      
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 'user1', email: 'test@example.com', role: 'user' },
          token: 'mock-token'
        }
      })

      const state = store.getState().auth
      expect(state.user).toEqual({ id: 'user1', email: 'test@example.com', role: 'user' })
      expect(state.token).toBe('mock-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('should handle rejected state', () => {
      const store = createMockStore()
      
      store.dispatch({
        type: 'auth/login/rejected',
        payload: 'Invalid credentials'
      })

      const state = store.getState().auth
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Invalid credentials')
    })
  })
})
