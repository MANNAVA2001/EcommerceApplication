// types/index.ts (Updated)

import { Request } from 'express';
import { UserAttributes } from '../models/User'; 

export interface AuthRequest extends Request {
  //user?: UserAttributes; 
  user?: {
    id: number;
    email: string;
    role: string;
    username?: string; // Add this
    firstName?: string; // Add this
    lastName?: string;  // Add this
  };// Or whatever structure your authenticated user object has
}

// User Interfaces (Assuming these are already updated to Sequelize standards)
export interface IUser {
  id: number;
  email: string;
  password?: string; // Optional for safety in DTOs where password is not always exposed
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}


// Category Interfaces (Updated to include optional comparisonFields as a parsed array)
export interface ICategory {
  id: number;
  name: string;
  description: string;
  // This now represents the parsed JSON array from the Sequelize model
  comparisonFields?: IComparisonField[]; // Optional, as it's an included association/parsed JSON
  createdAt: Date;
  updatedAt: Date;
}

// ComparisonField Interface (now a standalone model or used for JSON type)
export interface IComparisonField {
  id?: number; // Optional if this interface is primarily for the JSON array structure
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string[];
  unit?: string;
  displayOrder: number;
}

// Product Interfaces (Crucial updates here)
export interface IProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number; // Foreign key
  features: Record<string, any>;
  images: string[]; // Getter method will return this as string[]
  inStock: boolean; // Explicitly added
  stockQuantity: number; // Explicitly added
  createdAt: Date;
  updatedAt: Date;

  // For Sequelize associations:
  // When you use `include: { model: Category, as: 'category' }`,
  // the `product` instance will have a `category` property.
  // This needs to be optional because it's only present if included in the query.
  category?: ICategory; // Added for populated category data

  // Add the getter method signature that your controller now uses
  getImagesArray(): string[];
}


// ComparisonConfig Interfaces
export interface IComparisonConfig {
  id: number;
  categoryId: number;
  fields: IComparisonField[]; // Represents the JSON array of field definitions
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Interfaces (Assuming these are already updated to Sequelize standards)
export interface IOrder {
  id: number;
  userId: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddressId: number;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// OrderProduct Interface (Assuming these are already updated to Sequelize standards)
export interface IOrderProduct {
  id?: number;
  orderId?: number;
  productId: number;
  quantity: number;
  price: number;
}


// Address Interface (Assuming these are already updated to Sequelize standards)
export interface IAddress {
  id?: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Request Body Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
}

export interface ProductQuery {
    page?: string;
    limit?: string;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: string;
    query?: string; 
    sortOrder?: 'asc' | 'desc';
}

export interface ComparisonRequest {
  productIds: number[];
  categoryId: number;
}
