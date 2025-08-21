import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';

export interface Notification {
  id: number;
  userId: number;
  type: 'order_status' | 'gift_card_received' | 'gift_card_shared' | 'gift_registry_shared';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  createdAt: string;
  updatedAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

export const fetchNotifications = createAsyncThunk<
  { notifications: Notification[]; pagination: any },
  { page?: number; limit?: number; unreadOnly?: boolean }
>(
  'notification/fetchNotifications',
  async ({ page = 1, limit = 20, unreadOnly = false }, { rejectWithValue, getState }) => {
    const state = getState() as any;
    if (!state.auth.isAuthenticated) {
      return rejectWithValue('User not authenticated');
    }
    
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: Notification[];
        pagination: any;
      }>('/notifications', {
        params: { page, limit, unreadOnly }
      });
      return { notifications: response.data, pagination: response.pagination };
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk<number>(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as any;
    if (!state.auth.isAuthenticated) {
      return rejectWithValue('User not authenticated');
    }
    
    try {
      const response = await apiClient.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
      return response.data.count;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk<number, number>(
  'notification/markAsRead',
  async (id, { rejectWithValue, getState }) => {
    const state = getState() as any;
    if (!state.auth.isAuthenticated) {
      return rejectWithValue('User not authenticated');
    }
    
    try {
      await apiClient.put(`/notifications/${id}/read`);
      return id;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk<void>(
  'notification/markAllAsRead',
  async (_, { rejectWithValue, getState }) => {
    const state = getState() as any;
    if (!state.auth.isAuthenticated) {
      return rejectWithValue('User not authenticated');
    }
    
    try {
      await apiClient.put('/notifications/mark-all-read');
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk<number, number>(
  'notification/delete',
  async (id, { rejectWithValue, getState }) => {
    const state = getState() as any;
    if (!state.auth.isAuthenticated) {
      return rejectWithValue('User not authenticated');
    }
    
    try {
      await apiClient.delete(`/notifications/${id}`);
      return id;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return rejectWithValue('Authentication required');
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
      });
  },
});

export const { clearError, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
