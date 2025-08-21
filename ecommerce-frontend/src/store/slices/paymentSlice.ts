import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

interface PaymentMethod {
  id: string;
  userId: string;
  cardNumber: string;
  expMonth: number;
  expYear: number;
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  loading: false,
  error: null,
};

export const fetchUserPaymentMethods = createAsyncThunk(
  'payments/fetchUserPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: PaymentMethod[] }>('/payment-methods/');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment methods');
    }
  }
);
export const createPaymentMethod = createAsyncThunk<PaymentMethod, Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>(  
  'payments/createPaymentMethod',    
  async (paymentData, { rejectWithValue }) => {    
    try {    
      const response = await apiClient.post<{ success: boolean; data: PaymentMethod }>('/payment-methods/', paymentData);    
      return response.data;    
    } catch (error: any) {    
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment method');    
    }    
  }    
);    
    
export const updatePaymentMethod = createAsyncThunk<PaymentMethod, { id: string } & Partial<PaymentMethod>>(  
  'payments/updatePaymentMethod',    
  async ({ id, ...paymentData }, { rejectWithValue }) => {    
    try {    
      const response = await apiClient.put<{ success: boolean; data: PaymentMethod }>(`/payment-methods/${id}`, paymentData);    
      return response.data;    
    } catch (error: any) {    
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment method');    
    }    
  }    
);
export const deletePaymentMethod = createAsyncThunk(
  'payments/deletePaymentMethod',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/payment-methods/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment method');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchUserPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePaymentMethod.fulfilled, (state, action) => {
        state.paymentMethods = state.paymentMethods.filter(method => method.id !== action.payload);
      });
  },
});



export const { clearError, setSelectedPaymentMethod } = paymentSlice.actions;
export default paymentSlice.reducer;
