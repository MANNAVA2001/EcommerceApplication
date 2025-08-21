import { Request, Response } from 'express'
import { AuthRequest } from './types'

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
})

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  }
  return res
}

export const createMockAuthRequest = (overrides: Partial<AuthRequest> = {}): Partial<AuthRequest> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: undefined,
  ...overrides,
})

export const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  comparePassword: jest.fn(),
}

export const mockCategory = {
  _id: 'cat123',
  name: 'Electronics',
  description: 'Electronic devices',
  comparisonFields: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockProduct = {
  _id: 'prod123',
  name: 'iPhone 15',
  description: 'Latest iPhone',
  price: 999,
  categoryId: 'cat123',
  features: {},
  images: [],
  inStock: true,
  stockQuantity: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockValidationResult = {
  isEmpty: jest.fn().mockReturnValue(true),
  array: jest.fn().mockReturnValue([]),
}
