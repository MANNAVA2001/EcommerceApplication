import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginForm from '../LoginForm'
import authReducer from '../../../store/slices/authSlice'
import { mockPush } from '../../../setupTests'

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

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>)
}

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form correctly', () => {
    renderWithProvider(<LoginForm />)

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
  })

  it('should update form fields when user types', () => {
    renderWithProvider(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    expect(emailInput.value).toBe('test@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('should display error message when login fails', () => {
    const storeWithError = createMockStore({
      error: 'Invalid credentials',
    })

    renderWithProvider(<LoginForm />, storeWithError)

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('should show loading state during login', () => {
    const storeWithLoading = createMockStore({
      loading: true,
    })

    renderWithProvider(<LoginForm />, storeWithLoading)

    expect(screen.getByText('Signing In...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  it('should navigate to register page when register link is clicked', () => {
    renderWithProvider(<LoginForm />)

    const registerLink = screen.getByText(/don't have an account/i)
    fireEvent.click(registerLink)

    expect(mockPush).toHaveBeenCalledWith('/register')
  })

  it('should submit form with correct data', async () => {
    const mockDispatch = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        user: { role: 'user' },
      }),
    })
    const mockStore = createMockStore()
    mockStore.dispatch = mockDispatch

    renderWithProvider(<LoginForm />, mockStore)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('should navigate to admin page for admin users', async () => {
    const mockDispatch = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        user: { role: 'admin' },
      }),
    })
    const mockStore = createMockStore()
    mockStore.dispatch = mockDispatch

    renderWithProvider(<LoginForm />, mockStore)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'admin@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin')
    })
  })

  it('should navigate to products page for regular users', async () => {
    const mockDispatch = jest.fn().mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({
        user: { role: 'user' },
      }),
    })
    const mockStore = createMockStore()
    mockStore.dispatch = mockDispatch

    renderWithProvider(<LoginForm />, mockStore)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/products')
    })
  })

  it('should clear error when user starts typing', () => {
    const mockDispatch = jest.fn()
    const storeWithError = createMockStore({
      error: 'Invalid credentials',
    })
    storeWithError.dispatch = mockDispatch

    renderWithProvider(<LoginForm />, storeWithError)

    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('clearError'),
      })
    )
  })
})
