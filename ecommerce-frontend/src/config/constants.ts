export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile'
  },
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    BY_CATEGORY: (categoryId: string) => `/products?categoryId=${categoryId}`
  },
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
    COMPARISON_FIELDS: (id: string) => `/categories/${id}/comparison-fields`
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    USER_ORDERS: '/orders/user'
  },
  ADMIN: {
    CREATE_ADMIN: '/create-admin'
  }
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  CART: '/cart',
  ORDERS: '/orders',
  COMPARE: '/compare',
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders'
  }
}

export const UI_CONSTANTS = {
  DRAWER_WIDTH: 240,        // Sidebar width in pixels
  HEADER_HEIGHT: 64,        // Header height in pixels
  ITEMS_PER_PAGE: 12,       // Default pagination size
  DEBOUNCE_DELAY: 300       // Search input debounce delay in ms
}

import { VALID_CARD_PREFIXES, validateCardPrefix } from '../shared/constants';

export { VALID_CARD_PREFIXES, validateCardPrefix };

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  PASSWORDS_DONT_MATCH: 'Passwords do not match'
} as const;
