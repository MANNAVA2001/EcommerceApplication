import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Header from '../Header'
import authReducer from '../../../store/slices/authSlice'
import cartReducer from '../../../store/slices/cartSlice'
import { mockPush } from '../../../setupTests'

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        error: null,
      },
      cart: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      },
      ...initialState,
    },
  })
}

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>)
}

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render header with brand name', () => {
    renderWithProvider(<Header />)

    expect(screen.getByText('E-Commerce Store')).toBeInTheDocument()
  })

  it('should display login and register buttons when user is not authenticated', () => {
    renderWithProvider(<Header />)

    expect(screen.getByText('Login')).toBeInTheDocument()
    expect(screen.getByText('Register')).toBeInTheDocument()
    expect(screen.queryByText('Logout')).not.toBeInTheDocument()
  })

  it('should display logout button when user is authenticated', () => {
    const storeWithUser = createMockStore({
      auth: {
        user: {
          id: 'user1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-token',
        loading: false,
        error: null,
      },
    })

    renderWithProvider(<Header />, storeWithUser)

    expect(screen.getByText('Logout')).toBeInTheDocument()
    expect(screen.queryByText('Login')).not.toBeInTheDocument()
    expect(screen.queryByText('Register')).not.toBeInTheDocument()
  })

  it('should display admin button for admin users', () => {
    const storeWithAdmin = createMockStore({
      auth: {
        user: {
          id: 'admin1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-token',
        loading: false,
        error: null,
      },
    })

    renderWithProvider(<Header />, storeWithAdmin)

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should not display admin button for regular users', () => {
    const storeWithUser = createMockStore({
      auth: {
        user: {
          id: 'user1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-token',
        loading: false,
        error: null,
      },
    })

    renderWithProvider(<Header />, storeWithUser)

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('should display cart badge with correct item count', () => {
    const storeWithCartItems = createMockStore({
      cart: {
        items: [
          { product: { id: 1, name: 'Product 1', price: 100, description: 'Test product', images: [], inStock: true, stockQuantity: 10, categoryId: 1, features: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, quantity: 2 },
          { product: { id: 2, name: 'Product 2', price: 200, description: 'Test product 2', images: [], inStock: true, stockQuantity: 5, categoryId: 1, features: {}, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, quantity: 1 },
        ],
        totalItems: 3,
        totalAmount: 100,
      },
    })

    renderWithProvider(<Header />, storeWithCartItems)

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should navigate to categories when categories button is clicked', () => {
    renderWithProvider(<Header />)

    const categoriesButton = screen.getByText('Categories')
    fireEvent.click(categoriesButton)

    expect(mockPush).toHaveBeenCalledWith('/categories')
  })

  it('should navigate to products when products button is clicked', () => {
    renderWithProvider(<Header />)

    const productsButton = screen.getByText('Products')
    fireEvent.click(productsButton)

    expect(mockPush).toHaveBeenCalledWith('/products')
  })

  it('should navigate to cart when cart icon is clicked', () => {
    renderWithProvider(<Header />)

    const cartButton = screen.getByTestId('ShoppingCartIcon').closest('button')
    fireEvent.click(cartButton!)

    expect(mockPush).toHaveBeenCalledWith('/cart')
  })

  it('should navigate to login when login button is clicked', () => {
    renderWithProvider(<Header />)

    const loginButton = screen.getByText('Login')
    fireEvent.click(loginButton)

    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  it('should navigate to register when register button is clicked', () => {
    renderWithProvider(<Header />)

    const registerButton = screen.getByText('Register')
    fireEvent.click(registerButton)

    expect(mockPush).toHaveBeenCalledWith('/register')
  })

  it('should navigate to admin when admin button is clicked', () => {
    const storeWithAdmin = createMockStore({
      auth: {
        user: {
          id: 'admin1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-token',
        loading: false,
        error: null,
      },
    })

    renderWithProvider(<Header />, storeWithAdmin)

    const adminButton = screen.getByText('Admin')
    fireEvent.click(adminButton)

    expect(mockPush).toHaveBeenCalledWith('/admin')
  })

  it('should logout and navigate to home when logout button is clicked', () => {
    const mockDispatch = jest.fn()
    const storeWithUser = createMockStore({
      auth: {
        user: {
          id: 'user1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'mock-token',
        loading: false,
        error: null,
      },
    })
    storeWithUser.dispatch = mockDispatch

    renderWithProvider(<Header />, storeWithUser)

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('logout'),
      })
    )
    expect(mockPush).toHaveBeenCalledWith('/')
  })
})
