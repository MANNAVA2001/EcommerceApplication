import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';  
import apiClient from '../../utils/api';

interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethod {
  id: string;
  userId: string;
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  createdAt: string;
  updatedAt: string;
}


export interface CheckoutData {  
  user: {  
    id: number;  
    firstName: string;  
    lastName: string;  
    email: string;  
  };  
  addresses: Address[];  
  paymentMethods: PaymentMethod[];  
}  
  
interface UserCheckoutState {  
  data: CheckoutData | null;  
  loading: boolean;  
  error: string | null;  
}  

const initialState: UserCheckoutState = {  
  data: null,  
  loading: false,  
  error: null,  
};

export const fetchUserCheckoutData = createAsyncThunk<CheckoutData>(    
  'userCheckout/fetchCheckoutData',      
  async (_, { rejectWithValue }) => {      
    try {      
      const response = await apiClient.get<CheckoutData>('/user/checkout-data');      
      return response;      
    } catch (error: any) {      
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch checkout data');      
    }      
  }      
);

export const createCheckoutAddress = createAsyncThunk(
  'userCheckout/createAddress',
  async (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: Address }>('/user/addresses', addressData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create address');
    }
  }
);

export const updateCheckoutAddress = createAsyncThunk(
  'userCheckout/updateAddress',
  async ({ id, data }: { id: string; data: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean; data: Address }>(`/user/addresses/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteCheckoutAddress = createAsyncThunk(
  'userCheckout/deleteAddress',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user/addresses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const createCheckoutPaymentMethod = createAsyncThunk(
  'userCheckout/createPaymentMethod',
  async (paymentData: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: PaymentMethod }>('/user/payment-methods', paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payment method');
    }
  }
);

export const updateCheckoutPaymentMethod = createAsyncThunk(
  'userCheckout/updatePaymentMethod',
  async ({ id, ...paymentData }: { id: string } & Partial<PaymentMethod>, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean; data: PaymentMethod }>(`/user/payment-methods/${id}`, paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment method');
    }
  }
);

export const deleteCheckoutPaymentMethod = createAsyncThunk(
  'userCheckout/deletePaymentMethod',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/user/payment-methods/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payment method');
    }
  }
);

const userCheckoutSlice = createSlice({  
  name: 'userCheckout',  
  initialState, 
  reducers: {},  
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCheckoutData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCheckoutData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCheckoutData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createCheckoutAddress.fulfilled, (state, action) => {
        if (state.data) {
          state.data.addresses.push(action.payload);
        }
      })
      .addCase(updateCheckoutAddress.fulfilled, (state, action) => {
        if (state.data) {
          const index = state.data.addresses.findIndex(addr => addr.id === action.payload.id);
          if (index !== -1) {
            state.data.addresses[index] = action.payload;
          }
        }
      })
      .addCase(deleteCheckoutAddress.fulfilled, (state, action) => {
        if (state.data) {
          state.data.addresses = state.data.addresses.filter(addr => addr.id !== action.payload);
        }
      })
      .addCase(createCheckoutPaymentMethod.fulfilled, (state, action) => {
        if (state.data) {
          state.data.paymentMethods.push(action.payload);
        }
      })
      .addCase(updateCheckoutPaymentMethod.fulfilled, (state, action) => {
        if (state.data) {
          const index = state.data.paymentMethods.findIndex(method => method.id === action.payload.id);
          if (index !== -1) {
            state.data.paymentMethods[index] = action.payload;
          }
        }
      })
      .addCase(deleteCheckoutPaymentMethod.fulfilled, (state, action) => {
        if (state.data) {
          state.data.paymentMethods = state.data.paymentMethods.filter(method => method.id !== action.payload);
        }
      });
  },  
});
export default userCheckoutSlice.reducer;
