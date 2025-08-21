import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/api';
import { AuthState, User, LoginRequest, RegisterRequest } from '../../types';
import Cookies from 'js-cookie';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{
        message: string;
        token: string;
        user: User;
      }>('/auth/login', credentials);
      
      Cookies.set('auth_token', response.token, { expires: 7 });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{
        message: string;
        token: string;
        user: User;
      }>('/auth/register', userData);
      
      Cookies.set('auth_token', response.token, { expires: 7 });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ user: User }>('/auth/profile');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: { firstName: string; lastName: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<{
        message: string;
        user: User;
      }>('/auth/profile', userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (data: { email: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{
        message: string;
        resetToken?: string;
      }>('/auth/forgot-password', data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset email');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: { token: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{
        message: string;
      }>('/auth/reset-password', data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset password');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      Cookies.remove('auth_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      const token = Cookies.get('auth_token');
      if (token) {
        if (!state.isAuthenticated || !state.token) {
          state.token = token;
          state.isAuthenticated = true;
        }
      } else {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        //state.isAuthenticated = true;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        //state.isAuthenticated = false;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
