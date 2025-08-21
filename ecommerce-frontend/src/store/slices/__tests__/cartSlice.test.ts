import { configureStore } from '@reduxjs/toolkit'
import cartReducer, { addToCart, removeFromCart, updateQuantity, clearCart } from '../cartSlice'

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

const mockProduct = {
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
}

describe('cartSlice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addToCart', () => {
    it('should add new item to empty cart', () => {
      const store = createMockStore()

      store.dispatch(addToCart({ product: mockProduct, quantity: 1 }))

      const state = store.getState().cart
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe(1)
      expect(state.items[0].quantity).toBe(1)
      expect(state.totalItems).toBe(1)
      expect(state.totalAmount).toBe(999)
    })

    it('should increase quantity for existing item', () => {
      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 1 }],
        totalItems: 1,
        totalAmount: 999,
      })

      store.dispatch(addToCart({ product: mockProduct, quantity: 2 }))

      const state = store.getState().cart
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(3)
      expect(state.totalItems).toBe(3)
      expect(state.totalAmount).toBe(2997)
    })

    it('should add multiple different items', () => {
      const secondProduct = {
        ...mockProduct,
        id: 2,
        name: 'Samsung Galaxy',
        price: 899,
      }

      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 1 }],
        totalItems: 1,
        totalAmount: 999,
      })

      store.dispatch(addToCart({ product: secondProduct, quantity: 1 }))

      const state = store.getState().cart
      expect(state.items).toHaveLength(2)
      expect(state.totalItems).toBe(2)
      expect(state.totalAmount).toBe(1898)
    })
  })

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 2 }],
        totalItems: 2,
        totalAmount: 1998,
      })

      store.dispatch(removeFromCart(1))

      const state = store.getState().cart
      expect(state.items).toHaveLength(0)
      expect(state.totalItems).toBe(0)
      expect(state.totalAmount).toBe(0)
    })

    it('should not affect cart when removing non-existent item', () => {
      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 1 }],
        totalItems: 1,
        totalAmount: 999,
      })

      store.dispatch(removeFromCart('nonexistent'))

      const state = store.getState().cart
      expect(state.items).toHaveLength(1)
      expect(state.totalItems).toBe(1)
      expect(state.totalAmount).toBe(999)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 1 }],
        totalItems: 1,
        totalAmount: 999,
      })

      store.dispatch(updateQuantity({ productId: 1, quantity: 3 }))

      const state = store.getState().cart
      expect(state.items[0].quantity).toBe(3)
      expect(state.totalItems).toBe(3)
      expect(state.totalAmount).toBe(2997)
    })

    it('should remove item when quantity is set to 0', () => {
      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 2 }],
        totalItems: 2,
        totalAmount: 1998,
      })

      store.dispatch(updateQuantity({ productId: 1, quantity: 0 }))

      const state = store.getState().cart
      expect(state.items).toHaveLength(0)
      expect(state.totalItems).toBe(0)
      expect(state.totalAmount).toBe(0)
    })

    it('should not affect cart when updating non-existent item', () => {
      const store = createMockStore({
        items: [{ productId: mockProduct.id, product: mockProduct, quantity: 1 }],
        totalItems: 1,
        totalAmount: 999,
      })

      store.dispatch(updateQuantity({ productId: 'nonexistent', quantity: 5 }))

      const state = store.getState().cart
      expect(state.items).toHaveLength(1)
      expect(state.totalItems).toBe(1)
      expect(state.totalAmount).toBe(999)
    })
  })

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const store = createMockStore({
        items: [
          { productId: mockProduct.id, product: mockProduct, quantity: 2 },
          { productId: 2, product: { ...mockProduct, id: 2 }, quantity: 1 },
        ],
        totalItems: 3,
        totalAmount: 2997,
      })

      store.dispatch(clearCart())

      const state = store.getState().cart
      expect(state.items).toHaveLength(0)
      expect(state.totalItems).toBe(0)
      expect(state.totalAmount).toBe(0)
    })

    it('should not affect empty cart', () => {
      const store = createMockStore()

      store.dispatch(clearCart())

      const state = store.getState().cart
      expect(state.items).toHaveLength(0)
      expect(state.totalItems).toBe(0)
      expect(state.totalAmount).toBe(0)
    })
  })
})
