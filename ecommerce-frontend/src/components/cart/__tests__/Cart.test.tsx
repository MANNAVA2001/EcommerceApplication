import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import Cart from '../Cart'
import cartReducer from '../../../store/slices/cartSlice'
import { mockPush } from '../../../setupTests'

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    preloadedState: {
      cart: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
        ...initialState,
      },
    },
  })
}

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>)
}

const mockCartItems = [
  {
    product: {
      id: 1,
      name: 'iPhone 15',
      price: 999,
      description: 'Latest iPhone',
      images: [],
      inStock: true,
      stockQuantity: 10,
      categoryId: 1,
      features: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    quantity: 2,
  },
  {
    product: {
      id: 2,
      name: 'Samsung Galaxy',
      price: 899,
      description: 'Latest Samsung',
      images: [],
      inStock: true,
      stockQuantity: 5,
      categoryId: 1,
      features: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    quantity: 1,
  },
]

describe('Cart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display empty cart message when cart is empty', () => {
    renderWithProvider(<Cart />)

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
  })

  it('should navigate to products page when continue shopping is clicked', () => {
    renderWithProvider(<Cart />)

    const continueButton = screen.getByText('Continue Shopping')
    fireEvent.click(continueButton)

    expect(mockPush).toHaveBeenCalledWith('/products')
  })

  it('should display cart items correctly', () => {
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })

    renderWithProvider(<Cart />, storeWithItems)

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    expect(screen.getByText('iPhone 15')).toBeInTheDocument()
    expect(screen.getByText('Samsung Galaxy')).toBeInTheDocument()
    expect(screen.getByText('$999.00 each')).toBeInTheDocument()
    expect(screen.getByText('$899.00 each')).toBeInTheDocument()
  })

  it('should calculate total amount correctly', () => {
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })

    renderWithProvider(<Cart />, storeWithItems)

    expect(screen.getByText('Total: $2897.00')).toBeInTheDocument()
  })

  it('should update quantity when quantity input changes', () => {
    const mockDispatch = jest.fn()
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })
    storeWithItems.dispatch = mockDispatch

    renderWithProvider(<Cart />, storeWithItems)

    const quantityInput = screen.getByTestId(`quantity-input-${mockCartItems[0].product.id}`);
    fireEvent.change(quantityInput, { target: { value: '3' } });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('updateQuantity'),
        payload: { productId: mockCartItems[0].product.id, quantity: 3 },
      })
    )
  })

  it('should remove item when quantity is set to 0', () => {
    const mockDispatch = jest.fn()
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })
    storeWithItems.dispatch = mockDispatch

    renderWithProvider(<Cart />, storeWithItems)

    const quantityInput = screen.getByTestId(`quantity-input-${mockCartItems[0].product.id}`);
    fireEvent.change(quantityInput, { target: { value: '0' } });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('removeFromCart'),
        payload: mockCartItems[0].product.id,
      })
    )
  })

  it('should increase quantity when plus button is clicked', () => {
    const mockDispatch = jest.fn()
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })
    storeWithItems.dispatch = mockDispatch

    renderWithProvider(<Cart />, storeWithItems)

    const addButtons = screen.getAllByTestId('AddIcon')
    fireEvent.click(addButtons[0])

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('updateQuantity'),
        payload: { productId: mockCartItems[0].product.id, quantity: 3 },
      })
    );
  });

  it('should decrease quantity when minus button is clicked', () => {
    const mockDispatch = jest.fn()
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })
    storeWithItems.dispatch = mockDispatch

    renderWithProvider(<Cart />, storeWithItems)

    const removeButtons = screen.getAllByTestId('RemoveIcon')
    fireEvent.click(removeButtons[0])

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('updateQuantity'),
        payload: { productId: mockCartItems[0].product.id, quantity: 1 },
      })
    )
  })

  it('should remove item when delete button is clicked', () => {
    const mockDispatch = jest.fn()
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })
    storeWithItems.dispatch = mockDispatch

    renderWithProvider(<Cart />, storeWithItems)

    const deleteButtons = screen.getAllByTestId('DeleteIcon')
    fireEvent.click(deleteButtons[0])

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('removeFromCart'),
        payload: mockCartItems[0].product.id,
      })
    )
  })

  it('should clear cart when clear cart button is clicked', () => {
    const mockDispatch = jest.fn()
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })
    storeWithItems.dispatch = mockDispatch

    renderWithProvider(<Cart />, storeWithItems)

    const clearButton = screen.getByText('Clear Cart')
    fireEvent.click(clearButton)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('clearCart'),
      })
    )
  })

  it('should navigate to checkout when proceed to checkout is clicked', () => {
    const storeWithItems = createMockStore({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 2897,
    })

    renderWithProvider(<Cart />, storeWithItems)

    const checkoutButton = screen.getByText('Proceed to Checkout')
    fireEvent.click(checkoutButton)

    expect(mockPush).toHaveBeenCalledWith('/checkout')
  })
})
