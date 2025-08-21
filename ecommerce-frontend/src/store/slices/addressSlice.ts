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

interface AddressState {
  addresses: Address[];
  selectedAddress: Address | null;
  loading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddress: null,
  loading: false,
  error: null,
};

export const fetchUserAddresses = createAsyncThunk(
  'addresses/fetchUserAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Address[] }>('/addresses');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: Address }>('/addresses', addressData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ id, data }: { id: string; data: Partial<Address> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean; data: Address }>(`/addresses/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/addresses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address');
    }
  }
);

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchUserAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.addresses.push(action.payload);
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.addresses.findIndex(addr => addr.id === action.payload.id);
        if (index !== -1) {
          state.addresses[index] = action.payload;
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter(addr => addr.id !== action.payload);
      });
  },
});

export const { clearError, setSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;
