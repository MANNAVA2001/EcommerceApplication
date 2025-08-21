import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

export interface GiftRegistryItem {
  id: number;
  registryId: number;
  productId: number;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  product?: {
    id: number;
    name: string;
    price: number;
    images: string[];
  };
}

export interface GiftRegistry {
  id: number;
  userId: number;
  name: string;
  description?: string;
  shareableUrl: string;
  isPublic: boolean;
  items: GiftRegistryItem[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface GiftRegistryState {
  registries: GiftRegistry[];
  currentRegistry: GiftRegistry | null;
  loading: boolean;
  error: string | null;
}

const initialState: GiftRegistryState = {
  registries: [],
  currentRegistry: null,
  loading: false,
  error: null,
};

export const fetchUserGiftRegistries = createAsyncThunk<GiftRegistry[]>(
  'giftRegistry/fetchUserRegistries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: GiftRegistry[] }>('/gift-registries');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gift registries');
    }
  }
);

export const fetchGiftRegistryByUrl = createAsyncThunk<GiftRegistry, string>(
  'giftRegistry/fetchByUrl',
  async (shareableUrl: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: GiftRegistry }>(`/gift-registries/shared/${shareableUrl}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gift registry');
    }
  }
);

export const createGiftRegistry = createAsyncThunk<GiftRegistry, Partial<GiftRegistry>>(
  'giftRegistry/create',
  async (registryData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: GiftRegistry }>('/gift-registries', registryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create gift registry');
    }
  }
);

export const updateGiftRegistry = createAsyncThunk<GiftRegistry, { id: number; data: Partial<GiftRegistry> }>(
  'giftRegistry/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{ success: boolean; data: GiftRegistry }>(`/gift-registries/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update gift registry');
    }
  }
);

export const deleteGiftRegistry = createAsyncThunk<number, number>(
  'giftRegistry/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/gift-registries/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete gift registry');
    }
  }
);

export const shareGiftRegistry = createAsyncThunk<string, { id: number; recipientEmails: string[]; message?: string }>(
  'giftRegistry/share',
  async ({ id, recipientEmails, message }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; shareUrl: string }>(`/gift-registries/${id}/share`, {
        recipientEmails,
        message
      });
      return response.shareUrl;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share gift registry');
    }
  }
);

const giftRegistrySlice = createSlice({
  name: 'giftRegistry',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRegistry: (state, action) => {
      state.currentRegistry = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserGiftRegistries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGiftRegistries.fulfilled, (state, action) => {
        state.loading = false;
        state.registries = action.payload;
      })
      .addCase(fetchUserGiftRegistries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGiftRegistryByUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGiftRegistryByUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRegistry = action.payload;
      })
      .addCase(fetchGiftRegistryByUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createGiftRegistry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGiftRegistry.fulfilled, (state, action) => {
        state.loading = false;
        state.registries.unshift(action.payload);
      })
      .addCase(createGiftRegistry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateGiftRegistry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGiftRegistry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.registries.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.registries[index] = action.payload;
        }
        if (state.currentRegistry?.id === action.payload.id) {
          state.currentRegistry = action.payload;
        }
      })
      .addCase(updateGiftRegistry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteGiftRegistry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGiftRegistry.fulfilled, (state, action) => {
        state.loading = false;
        state.registries = state.registries.filter(r => r.id !== action.payload);
        if (state.currentRegistry?.id === action.payload) {
          state.currentRegistry = null;
        }
      })
      .addCase(deleteGiftRegistry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(shareGiftRegistry.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareGiftRegistry.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(shareGiftRegistry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentRegistry } = giftRegistrySlice.actions;
export default giftRegistrySlice.reducer;
