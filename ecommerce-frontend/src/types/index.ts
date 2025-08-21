
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  comparisonFields: ComparisonField[];
  createdAt: string;
  updatedAt: string;
}

export interface ComparisonField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  unit?: string;
  displayOrder: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number | Category;
  features: Record<string, any>;
  images?: string[];
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface ProductsApiResponse {
  totalProducts: number;
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export interface ComparisonRequest {
  productIds: string[];
  categoryId: string;
}

export interface ComparisonData {
  category: {
    id: string;
    name: string;
    comparisonFields: ComparisonField[];
  };
  products: Product[];
}

export interface CartItem {
  productId: number;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface Order {
  id: string;
  userId: string;
  products: OrderProduct[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderProduct {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface CheckoutPaymentMethod {  
  id: string;  
  cardNumber: string;  
  expMonth: number;  
  expYear: number; 
  cvv: string; // Add this line  
}

export interface ExternalPriceData {
  productName: string;
  retailers: {
    name: 'Best Buy' | 'Costco' | 'Walmart';
    price: number;
    availability: boolean;
    url?: string;
    lastUpdated: string;
  }[];
}

export interface ExternalPriceRequest {
  productId: string;
  productName: string;
}

export interface ExternalPriceResponse {
  success: boolean;
  data: ExternalPriceData;
  message?: string;
}
interface CheckoutData {  
  user: {  
    id: number;  
    firstName: string;  
    lastName: string;  
    email: string;  
  };  
  addresses: Array<{  
    id: string;  
    street: string;  
    city: string;  
    state: string;  
    zipCode: string;  
    country: string;  
    isDefault: boolean;  
  }>;  
  paymentMethods: Array<{  
    id: string;  
    cardNumber: string;  
    expMonth: number;  
    expYear: number;  
  }>;  
}  
  
interface UserCheckoutState {  
  data: CheckoutData | null;  
  loading: boolean;  
  error: string | null;  
}
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

export interface GiftCard {
  id: number;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
  purchasedBy?: number;
  recipientEmail?: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

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

