import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

export interface GiftCardTransaction {
  id: number;
  giftCardId: number;
  orderId?: number;
  amount: number;
  type: 'purchase' | 'redemption';
  createdAt: string;
}

export interface GiftCard {
  id: number;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
  purchasedBy?: number;
  recipientEmail?: string;
  message?: string;
  transactions?: GiftCardTransaction[];
  createdAt: string;
  updatedAt: string;
}

interface GiftCardState {
  giftCards: GiftCard[];
  currentGiftCard: GiftCard | null;
  loading: boolean;
  error: string | null;
}

const initialState: GiftCardState = {
  giftCards: [],
  currentGiftCard: null,
  loading: false,
  error: null,
};

export const purchaseGiftCard = createAsyncThunk<GiftCard, { amount: number; recipientEmail?: string; message?: string }>(
  'giftCard/purchase',
  async (purchaseData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: GiftCard }>('/gift-cards/purchase', purchaseData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to purchase gift card');
    }
  }
);

export const fetchGiftCardByCode = createAsyncThunk<GiftCard, string>(
  'giftCard/fetchByCode',
  async (code, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: GiftCard }>(`/gift-cards/code/${code}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gift card');
    }
  }
);

export const redeemGiftCard = createAsyncThunk<{ redeemedAmount: number; remainingBalance: number }, { code: string; amount: number; orderId: number }>(
  'giftCard/redeem',
  async (redeemData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{ success: boolean; data: { redeemedAmount: number; remainingBalance: number } }>('/gift-cards/redeem', redeemData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to redeem gift card');
    }
  }
);

export const fetchUserGiftCards = createAsyncThunk<GiftCard[]>(
  'giftCard/fetchUserCards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: GiftCard[] }>('/gift-cards');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch gift cards');
    }
  }
);

export const shareGiftCard = createAsyncThunk<void, { id: number; recipientEmails: string[]; message?: string }>(
  'giftCard/share',
  async ({ id, recipientEmails, message }, { rejectWithValue }) => {
    try {
      await apiClient.post(`/gift-cards/${id}/share`, { recipientEmails, message });
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share gift card');
    }
  }
);

const giftCardSlice = createSlice({
  name: 'giftCard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGiftCard: (state, action) => {
      state.currentGiftCard = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(purchaseGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseGiftCard.fulfilled, (state, action) => {
        state.loading = false;
        state.giftCards.unshift(action.payload);
      })
      .addCase(purchaseGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGiftCardByCode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGiftCardByCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGiftCard = action.payload;
      })
      .addCase(fetchGiftCardByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(redeemGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(redeemGiftCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(redeemGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserGiftCards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserGiftCards.fulfilled, (state, action) => {
        state.loading = false;
        state.giftCards = action.payload;
      })
      .addCase(fetchUserGiftCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(shareGiftCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(shareGiftCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(shareGiftCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentGiftCard } = giftCardSlice.actions;
export default giftCardSlice.reducer;
