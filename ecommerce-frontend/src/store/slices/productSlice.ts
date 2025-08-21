import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { Product, ProductQuery, ApiResponse, ProductsApiResponse, ComparisonRequest, ComparisonData, ExternalPriceData, ExternalPriceRequest, ExternalPriceResponse } from '../../types';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  comparisonData: ComparisonData | null;
  externalPriceData: ExternalPriceData | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  comparisonData: null,
  externalPriceData: null,
  loading: false,
  error: null,
  pagination: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (query: ProductQuery = {}, { rejectWithValue }) => {
    try {
      const queryWithLimit = { ...query, limit: 50 };
      const response = await apiClient.get<ProductsApiResponse>('/products', queryWithLimit);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ProductsApiResponse>(`/products?categoryId=${categoryId}&limit=50`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products by category');
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: string, { rejectWithValue }) => {
    try {
      console.log('Devin: Fetching product with ID:', id);
      const response = await apiClient.get<Product>(`/products/${id}`);
      console.log('Devin: Product API response:', response);
      return response;
    } catch (error: any) {
      console.error('Devin: Product fetch error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<Product>('/products', productData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }: { id: string; data: Partial<Product> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/products/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const compareProducts = createAsyncThunk(
  'products/compareProducts',
  async (comparisonRequest: ComparisonRequest, { rejectWithValue }) => {
    try {
      const requestWithNumberIds = {
        ...comparisonRequest,
        productIds: comparisonRequest.productIds.map(id => parseInt(id, 10)),
        categoryId: parseInt(comparisonRequest.categoryId, 10)
      };
      
      const response = await apiClient.post<ComparisonData>('/products/compare', requestWithNumberIds);
      
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to compare products');
    }
  }
);

export const compareExternalPrices = createAsyncThunk(
  'products/compareExternalPrices',
  async (request: ExternalPriceRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ExternalPriceResponse>(`/products/${request.productId}/external-prices`, {
        productName: request.productName
      });
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch external prices');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    clearComparisonData: (state) => {
      state.comparisonData = null;
    },
    clearExternalPriceData: (state) => {
      state.externalPriceData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = (action.payload.products || []).map(product => ({
          ...product,
          images: product.images || []
        }));
        state.pagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalProducts || 0,
          itemsPerPage: 10,
          hasNextPage: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrevPage: (action.payload.currentPage || 1) > 1,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.products = (action.payload.products || []).map(product => ({
          ...product,
          images: product.images || []
        }));
        state.pagination = {
          currentPage: action.payload.currentPage || 1,
          totalPages: action.payload.totalPages || 1,
          totalItems: action.payload.totalProducts || 0,
          itemsPerPage: 10,
          hasNextPage: (action.payload.currentPage || 1) < (action.payload.totalPages || 1),
          hasPrevPage: (action.payload.currentPage || 1) > 1,
        };
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.pending, (state) => {
        console.log('Devin: fetchProductById.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        console.log('Devin: fetchProductById.fulfilled with payload:', action.payload);
        state.loading = false;
        if (action.payload) {
          state.selectedProduct = { ...action.payload, images: action.payload.images || [] };
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        console.log('Devin: fetchProductById.rejected with error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        if (action.payload) {
          const product = { ...action.payload, images: action.payload.images || [] };
          state.products.push(product);
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.products.findIndex(product => product.id === action.payload.id);
          if (index !== -1) {
            const product = { ...action.payload, images: action.payload.images || [] };
            state.products[index] = product;
          }
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(product => product.id.toString() !== action.payload);
      })
      .addCase(compareProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.comparisonData = null;
      })
      .addCase(compareProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.comparisonData = action.payload;
      })
      .addCase(compareProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.comparisonData = null;
      })
      .addCase(compareExternalPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.externalPriceData = null;
      })
      .addCase(compareExternalPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.externalPriceData = action.payload;
      })
      .addCase(compareExternalPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.externalPriceData = null;
      });
  },
});

export const { clearError, setSelectedProduct, clearComparisonData, clearExternalPriceData } = productSlice.actions;
export default productSlice.reducer;
