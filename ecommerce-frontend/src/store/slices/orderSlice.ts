import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
  name?: string;
  description?: string;
  images?: string[];
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

interface Order {
  id: string;
  userId: string;
  user?: User;
  products: OrderProduct[];
  totalAmount: number;
   status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  bankName?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
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

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  pagination: null,
};

export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: {
    products: { productId: string; quantity: number; price: number }[];
    shippingAddress: Address;
    paymentMethod: string;
    cardInfo?: {
      cardNumber: string;
      expMonth: string;
      expYear: string;
      cvv: string;
    };
    selectedPaymentId?: number;
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: any }>('/orders', orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUser',
  async (params: { page?: number; limit?: number; status?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any>('/orders', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>(`/orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean; data: any }>(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        const transformedOrder = {
          ...action.payload,
          user: action.payload.user,
          products: action.payload.orderProducts?.map((orderProduct: any) => ({
            productId: orderProduct.product?.id || orderProduct.productId,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            name: orderProduct.product?.name,
            description: orderProduct.product?.description,
            images: orderProduct.product?.images
          })) || []
        };
        state.currentOrder = transformedOrder;
        state.orders.unshift(transformedOrder);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create order';
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        const transformedOrders = action.payload.data.map((order: any) => ({
          ...order,
          user: order.user,
          products: order.orderProducts?.map((orderProduct: any) => ({
            productId: orderProduct.product?.id || orderProduct.productId,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            name: orderProduct.product?.name,
            description: orderProduct.product?.description,
            images: orderProduct.product?.images
          })) || []
        }));
        state.orders = transformedOrders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch orders';
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        const transformedOrder = {
          ...action.payload,
          user: action.payload.user,
          products: action.payload.orderProducts?.map((orderProduct: any) => ({
            productId: orderProduct.product?.id || orderProduct.productId,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            name: orderProduct.product?.name,
            description: orderProduct.product?.description,
            images: orderProduct.product?.images
          })) || []
        };
        state.currentOrder = transformedOrder;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch order';
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const transformedOrder = {
          ...action.payload,
          user: action.payload.user,
          products: action.payload.orderProducts?.map((orderProduct: any) => ({
            productId: orderProduct.product?.id || orderProduct.productId,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            name: orderProduct.product?.name,
            description: orderProduct.product?.description,
            images: orderProduct.product?.images
          })) || []
        };
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = transformedOrder;
        }
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = transformedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update order status';
      })
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        const transformedOrders = action.payload.map((order: any) => ({
          ...order,
          user: order.user,
          products: order.orderProducts?.map((orderProduct: any) => ({
            productId: orderProduct.product?.id || orderProduct.productId,
            quantity: orderProduct.quantity,
            price: orderProduct.price,
            name: orderProduct.product?.name,
            description: orderProduct.product?.description,
            images: orderProduct.product?.images
          })) || []
        }));
        state.orders = transformedOrders;
        state.error = null;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (params: { page?: number; limit?: number; status?: string; userId?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: any }>('/orders/all', params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const { clearError } = orderSlice.actions;
export default orderSlice.reducer;
