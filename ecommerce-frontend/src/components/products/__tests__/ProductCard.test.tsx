import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProductCard from '../ProductCard'
import cartReducer from '../../../store/slices/cartSlice'
import { mockPush } from '../../../setupTests'

const createMockStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
    },
    preloadedState: {
      cart: {
        items: [],
        totalItems: 0,
        totalAmount: 0,
      },
    },
  })
}

const renderWithProvider = (component: React.ReactElement, store = createMockStore()) => {
  return render(<Provider store={store}>{component}</Provider>)
}

const mockProduct = {
  id: 1,
  name: 'iPhone 15 Pro',
  description: 'Latest iPhone with advanced camera system and A17 Pro chip for professional photography and performance.',
  price: 999.99,
  images: ['https://example.com/iphone.jpg'],
  inStock: true,
  stockQuantity: 10,
  categoryId: 1,
  features: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockOutOfStockProduct = {
  ...mockProduct,
  id: 2,
  name: 'Out of Stock Product',
  inStock: false,
  stockQuantity: 0,
}

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render product information correctly', () => {
    renderWithProvider(<ProductCard product={mockProduct} />)

    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
    expect(screen.getByText(/Latest iPhone with advanced camera/)).toBeInTheDocument()
    expect(screen.getByText('$999.99')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(screen.getByText('10 available')).toBeInTheDocument()
  })

  it('should truncate long descriptions', () => {
    const longDescriptionProduct = {
      ...mockProduct,
      description: 'This is a very long description that should be truncated because it exceeds the 100 character limit that we have set for product descriptions in the card component.',
    }

    renderWithProvider(<ProductCard product={longDescriptionProduct} />)

    expect(screen.getByText(/This is a very long description that should be truncated because it exceeds the 100 character.../)).toBeInTheDocument()
  })

  it('should display out of stock status correctly', () => {
    renderWithProvider(<ProductCard product={mockOutOfStockProduct} />)

    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    expect(screen.queryByText(/available/)).not.toBeInTheDocument()
  })

  it('should disable add to cart button when product is out of stock', () => {
    renderWithProvider(<ProductCard product={mockOutOfStockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    expect(addToCartButton).toBeDisabled()
  })

  it('should enable add to cart button when product is in stock', () => {
    renderWithProvider(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    expect(addToCartButton).not.toBeDisabled()
  })

  it('should navigate to product detail when view button is clicked', () => {
    renderWithProvider(<ProductCard product={mockProduct} />)

    const viewButton = screen.getByTestId('VisibilityIcon').closest('button')
    fireEvent.click(viewButton!)
    expect(mockPush).toHaveBeenCalledWith(`/products/${mockProduct.id}`)

  })

  it('should add product to cart when add to cart button is clicked', () => {
    const mockStore = createMockStore()
    const mockDispatch = jest.fn()
    mockStore.dispatch = mockDispatch
    
    renderWithProvider(<ProductCard product={mockProduct} />, mockStore)

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i })
    fireEvent.click(addToCartButton)

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('addToCart'),
        payload: { product: mockProduct, quantity: 1 },
      })
    )
  })

  it('should display compare button when showCompareButton is true', () => {
    const mockOnSelect = jest.fn()
    renderWithProvider(
      <ProductCard 
        product={mockProduct} 
        showCompareButton={true}
        onSelect={mockOnSelect}
      />
    )

    expect(screen.getByTestId('CompareIcon')).toBeInTheDocument()
  })

  it('should not display compare button when showCompareButton is false', () => {
    renderWithProvider(<ProductCard product={mockProduct} showCompareButton={false} />)

    expect(screen.queryByTestId('CompareIcon')).not.toBeInTheDocument()
  })

  it('should call onSelect when compare button is clicked', () => {
    const mockOnSelect = jest.fn()
    renderWithProvider(
      <ProductCard 
        product={mockProduct} 
        showCompareButton={true}
        onSelect={mockOnSelect}
      />
    )

    const compareButton = screen.getByTestId('CompareIcon').closest('button')
    fireEvent.click(compareButton!)

    expect(mockOnSelect).toHaveBeenCalledWith(mockProduct.id.toString())
  })

  it('should highlight compare button when product is selected', () => {
    const mockOnSelect = jest.fn()
    renderWithProvider(
      <ProductCard 
        product={mockProduct} 
        showCompareButton={true}
        onSelect={mockOnSelect}
        isSelected={true}
      />
    )

    const compareButton = screen.getByTestId('CompareIcon').closest('button')
    expect(compareButton).toHaveClass('MuiIconButton-colorSecondary')
  })

  it('should use placeholder image when product has no images', () => {
    const productWithoutImages = {
      ...mockProduct,
      images: [],
    }

    renderWithProvider(<ProductCard product={productWithoutImages} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', '/placeholder-image.jpg')
  })

  it('should use first image when product has multiple images', () => {
    const productWithMultipleImages = {
      ...mockProduct,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    }

    renderWithProvider(<ProductCard product={productWithMultipleImages} />)

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })
})
