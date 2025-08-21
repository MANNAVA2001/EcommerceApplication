// backend/src/tests/productController.test.ts

import { Request, Response } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  compareProducts,
  getRecommendations,
} from '../productController';

import { Product } from '../../models/Product';
import { Category } from '../../models/Category';
import { AuthRequest, ProductQuery } from '../../types/index';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { Model } from 'sequelize';

// Define a specific return type for the mocked findAndCountAll when not grouping
// This explicitly tells TypeScript that 'count' will be a number.
type MockFindAndCountAllResult = {
  count: number;
  rows: Product[]; // Assuming 'Product' refers to the actual model instance type
};

// Mock the actual Sequelize models (Product and Category)
jest.mock('../../models/Product', () => {
  const mockProductInstance = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
    price: 999.00,
    categoryId: 1,
    features: JSON.stringify({}), // Stored as stringified JSON in actual model
    images: JSON.stringify([]),   // Stored as stringified JSON in actual model
    stockQuantity: 10,
    inStock: true,
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
    save: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
    // toJSON should return plain data without mock functions
    toJSON: jest.fn(function(this: any) {
        const json = {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            categoryId: this.categoryId,
            features: typeof this.features === 'string' ? JSON.parse(this.features) : this.features,
            images: typeof this.images === 'string' ? JSON.parse(this.images) : this.images,
            stockQuantity: this.stockQuantity,
            inStock: this.inStock,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
        return json;
    }),
    set: jest.fn(function(this: any, data: any) {
        Object.assign(this, data);
        return this;
    }),
    // The update method for instances
    update: jest.fn(function(this: any, data: any) {
        Object.assign(this, data);
        this.updatedAt = new Date();
        if (data.stockQuantity !== undefined) {
            this.inStock = data.stockQuantity > 0;
        }
        if (data.features !== undefined && typeof data.features !== 'string') {
            this.features = JSON.stringify(data.features);
        }
        if (data.images !== undefined && typeof data.images !== 'string') {
            this.images = JSON.stringify(data.images);
        }
        return Promise.resolve(this);
    }),
  };

  const mockProductConstructor = jest.fn().mockImplementation((data: any) => {
    const instance = {
        ...mockProductInstance,
        ...data,
        features: typeof data.features === 'object' ? JSON.stringify(data.features) : data.features,
        images: typeof data.images === 'object' ? JSON.stringify(data.images) : data.images,
        // Ensure that createdAt and updatedAt are Date objects from the start
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date(),
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    instance.destroy = jest.fn().mockResolvedValue(true);
    instance.toJSON = jest.fn(function(this: any) {
        const json = { ...this };
        if (typeof json.features === 'string') json.features = JSON.parse(json.features);
        if (typeof json.images === 'string') json.images = JSON.parse(json.images);
        delete (json as any).save;
        delete (json as any).destroy;
        delete (json as any).set;
        delete (json as any).update;
        delete (json as any).toJSON;
        return json;
    });
    instance.set = jest.fn(function(this: any, data: any) { Object.assign(this, data); return this; });
    instance.update = jest.fn(function(this: any, data: any) {
        Object.assign(this, data);
        this.updatedAt = new Date();
        if (data.stockQuantity !== undefined) {
            this.inStock = data.stockQuantity > 0;
        }
        if (data.features !== undefined && typeof data.features !== 'string') {
            this.features = JSON.stringify(data.features);
        }
        if (data.images !== undefined && typeof data.images !== 'string') {
            this.images = JSON.stringify(data.images);
        }
        return Promise.resolve(this);
    });
    return instance;
  });

  Object.assign(mockProductConstructor, {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    // Use the custom type for findAndCountAll to explicitly define 'count' as a number
    findAndCountAll: jest.fn<
    Promise<{ count: number; rows: Product[] }>, [any?]>()
      .mockImplementation(async (options?: any) => {
        // Default mock implementation returns a number for count
        return {
          count: 0,
          rows: [],
        };
      }),
  });

  return {
    Product: mockProductConstructor,
  };
});

jest.mock('../../models/Category', () => {
  const mockCategoryInstance = {
    id: 1,
    name: 'Test Category',
    description: 'Description',
    comparisonFields: JSON.stringify([]), // Stored as stringified JSON
    toJSON: jest.fn(function(this: any) {
        const json = {
            id: this.id,
            name: this.name,
            description: this.description,
            comparisonFields: typeof this.comparisonFields === 'string' ? JSON.parse(this.comparisonFields) : this.comparisonFields,
        };
        delete (json as any).toJSON;
        return json;
    }),
  };

  const mockCategoryConstructor = jest.fn().mockImplementation((data: any) => ({
    ...mockCategoryInstance,
    ...data,
    comparisonFields: typeof data.comparisonFields === 'object' ? JSON.stringify(data.comparisonFields) : data.comparisonFields,
    toJSON: jest.fn(function(this: any) {
        const json = { ...this };
        if (typeof json.comparisonFields === 'string') json.comparisonFields = JSON.parse(json.comparisonFields);
        delete (json as any).toJSON;
        return json;
    }),
  }));

  Object.assign(mockCategoryConstructor, {
    findByPk: jest.fn(),
  });

  return {
    Category: mockCategoryConstructor,
  };
});

jest.mock('express-validator');

const mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

const mockProduct = Product as jest.Mocked<typeof Product>;
const mockCategory = Category as jest.Mocked<typeof Category>;

global.fetch = jest.fn();

describe('ProductController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockAuthReq: Partial<AuthRequest>;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockAuthReq = {
      params: {},
      body: {},
    };
    jest.clearAllMocks();
  });

  describe('getAllProducts', () => {
    it('should return products with pagination', async () => {
      const mockProductsData = [
        { id: 1, name: 'iPhone', price: 999.00, categoryId: 1, description: 'Desc1', features: {}, images: [], stockQuantity: 10, inStock: true, createdAt: new Date('2023-01-01T10:00:00Z'), updatedAt: new Date('2023-01-01T10:00:00Z') },
        { id: 2, name: 'Samsung', price: 899.00, categoryId: 1, description: 'Desc2', features: {}, images: [], stockQuantity: 5, inStock: true, createdAt: new Date('2023-01-01T10:00:00Z'), updatedAt: new Date('2023-01-01T10:00:00Z') },
      ];

      mockReq.query = { page: '1', limit: '12' } as any;

      const mockedProductInstances = mockProductsData.map(p => {
        const instance = (mockProduct as any)(p);
        instance.toJSON.mockReturnValue({
            ...p,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
        });
        return instance;
      });

      (mockProduct.findAndCountAll as any).mockResolvedValue({ // <--- Cast to 'any' here
        count: mockProductsData.length,
        rows: mockedProductInstances,
      });

      await getAllProducts(mockReq as AuthRequest, mockRes as Response);

      expect(mockProduct.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        offset: 0,
        limit: 12,
        include: [{ model: Category, as: 'category' }],
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        totalProducts: mockProductsData.length,
        products: mockProductsData.map(p => ({
            ...p,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
            features: {},
            images: [],
        })),
        currentPage: 1,
        totalPages: 1,
      });
    });

    it('should filter products by category', async () => {
      mockReq.query = { categoryId: '1' } as any;

      (mockProduct.findAndCountAll as any).mockResolvedValue({ // <--- Cast to 'any' here
        count: 0,
        rows: [],
      });

      await getAllProducts(mockReq as AuthRequest, mockRes as Response);

      expect(mockProduct.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { categoryId: 1 },
        include: [{ model: Category, as: 'category' }],
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        totalProducts: 0,
        products: [],
        currentPage: 1,
        totalPages: 0,
      });
    });

    it('should filter products by price range', async () => {
      mockReq.query = { minPrice: '100', maxPrice: '500' } as any;

      (mockProduct.findAndCountAll as any).mockResolvedValue({ // <--- Cast to 'any' here
        count: 0,
        rows: [],
      });

      await getAllProducts(mockReq as AuthRequest, mockRes as Response);

      expect(mockProduct.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { price: { [Op.gte]: 100, [Op.lte]: 500 } },
        include: [{ model: Category, as: 'category' }],
      }));
      expect(mockRes.json).toHaveBeenCalledWith({
        totalProducts: 0,
        products: [],
        currentPage: 1,
        totalPages: 0,
      });
    });
  });

  describe('getProductById', () => {
    it('should return product by id successfully', async () => {
      const mockProductData = {
        id: 1,
        name: 'iPhone',
        price: 999.00,
        categoryId: 1,
        description: 'Test Description',
        features: {},
        images: [],
        stockQuantity: 10,
        inStock: true,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
      };

      mockReq.params = { id: '1' };
      const productInstance = (mockProduct as any)(mockProductData);
      productInstance.toJSON.mockReturnValue({
          ...mockProductData,
          createdAt: productInstance.createdAt,
          updatedAt: productInstance.updatedAt,
      });

      mockProduct.findByPk.mockResolvedValue(productInstance);

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.json).toHaveBeenCalledWith({
        ...mockProductData,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return 404 for non-existent product', async () => {
      mockReq.params = { id: '999' };
      mockProduct.findByPk.mockResolvedValue(null);

      await getProductById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });
  });

  describe('createProduct', () => {
    it('should create product successfully', async () => {
      const newProductData = {
        name: 'New iPhone',
        description: 'Latest iPhone model',
        price: 1099.00,
        categoryId: 1,
        features: { color: 'black' },
        images: ['image1.jpg'],
        stockQuantity: 10,
      };

      mockAuthReq.body = newProductData;
      // mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any); // This line is not used.
      const mockCategoryInstance = (mockCategory as any)({ id: 1, name: 'Electronics' });
      mockCategoryInstance.toJSON.mockReturnValue({ id: 1, name: 'Electronics' });
      mockCategory.findByPk.mockResolvedValue(mockCategoryInstance);

      const mockCreatedProductInstance = (mockProduct as any)({
        id: 3,
        ...newProductData,
        inStock: newProductData.stockQuantity > 0, // Ensure inStock is set based on stockQuantity
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCreatedProductInstance.toJSON.mockImplementation(function(this: any) {
          const json = { ...this };
          if (typeof json.features === 'string') json.features = JSON.parse(json.features);
          if (typeof json.images === 'string') json.images = JSON.parse(json.images);
          delete (json as any).save;
          delete (json as any).destroy;
          delete (json as any).set;
          delete (json as any).update;
          delete (json as any).toJSON;
          return json;
      });

      mockProduct.create.mockResolvedValue(mockCreatedProductInstance);

      await createProduct(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        id: 3,
        name: 'New iPhone',
        description: 'Latest iPhone model',
        price: 1099.00,
        categoryId: 1,
        features: { color: 'black' },
        images: ['image1.jpg'],
        stockQuantity: 10,
        inStock: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return error for invalid category', async () => {
      mockAuthReq.body = { categoryId: 999, name: 'Product', price: 100, stockQuantity: 1 };
      // mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any); // This line is not used.
      mockCategory.findByPk.mockResolvedValue(null);

      await createProduct(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category not found',
      });
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      mockAuthReq.params = { id: '1' };
      const updateData = {
        name: 'Updated iPhone',
        price: 1199.00,
        stockQuantity: 15,
        features: { color: 'blue' },
      };
      mockAuthReq.body = updateData;

      const initialProductData = {
        id: 1,
        name: 'iPhone',
        categoryId: 1,
        price: 999.00,
        stockQuantity: 10,
        description: 'Original Description',
        features: JSON.stringify({ color: 'black' }),
        images: JSON.stringify(['old.jpg']),
        inStock: true,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
      };

      const mockProductInstance = (mockProduct as any)(initialProductData);
      mockProduct.findByPk.mockResolvedValue(mockProductInstance);

      await updateProduct(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockProductInstance.update).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Updated iPhone',
        price: 1199.00,
        stockQuantity: 15,
        inStock: true,
        features: JSON.stringify(updateData.features),
      }));

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Updated iPhone',
        price: 1199.00,
        stockQuantity: 15,
        inStock: true,
        features: { color: 'blue' },
        updatedAt: expect.any(Date),
        createdAt: expect.any(Date),
        categoryId: 1,
        description: 'Original Description',
        images: ['old.jpg'],
      }));
    });

    it('should return 404 for non-existent product', async () => {
      mockAuthReq.params = { id: '999' };
      // mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any); // This line is not used.
      mockProduct.findByPk.mockResolvedValue(null);

      await updateProduct(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      mockAuthReq.params = { id: '1' };

      const mockProductData = {
        id: 1,
        name: 'iPhone',
      };
      const mockProductInstance = (mockProduct as any)(mockProductData);
      mockProductInstance.destroy.mockResolvedValue(true);
      mockProduct.findByPk.mockResolvedValue(mockProductInstance);

      await deleteProduct(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockProductInstance.destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 404 for non-existent product', async () => {
      mockAuthReq.params = { id: '999' };
      mockProduct.findByPk.mockResolvedValue(null);

      await deleteProduct(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Product not found',
      });
    });
  });

  describe('compareProducts', () => {
    it('should compare products successfully', async () => {
      const compareData = {
        productIds: [1, 2],
        categoryId: 1,
      };

      mockReq.body = compareData;

      const mockCategoryData = {
        id: 1,
        name: 'Electronics',
        comparisonFields: [{ name: 'Brand', type: 'text' }, { name: 'Price', type: 'number' }],
      };
      const mockCategoryInstance = (mockCategory as any)(mockCategoryData);
      mockCategoryInstance.toJSON.mockReturnValue(mockCategoryData);


      const mockProductsData = [
        {
          id: 1,
          name: 'iPhone',
          price: 999.00,
          features: { brand: 'Apple' },
          categoryId: 1,
          images: [],
          stockQuantity: 10,
          inStock: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Samsung',
          price: 899.00,
          features: { brand: 'Samsung' },
          categoryId: 1,
          images: [],
          stockQuantity: 5,
          inStock: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockProductInstances = mockProductsData.map(p => {
        const instance = (mockProduct as any)(p);
        instance.toJSON.mockReturnValue({
            ...p,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
        });
        return instance;
      });


      mockCategory.findByPk.mockResolvedValue(mockCategoryInstance);
      mockProduct.findAll.mockResolvedValue(mockProductInstances);

      await compareProducts(mockReq as Request, mockRes as Response);

      expect(mockProduct.findAll).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: { [Op.in]: [1, 2] }, categoryId: 1 },
        include: [{ model: Category, as: 'category' }],
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        category: {
            ...mockCategoryData,
            comparisonFields: mockCategoryData.comparisonFields,
        },
        products: mockProductsData.map(p => ({
            ...p,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        })),
      }));
    });

    it('should return error for insufficient products', async () => {
      mockReq.body = { productIds: [1], categoryId: 1 };

      await compareProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'At least 2 product IDs are required for comparison',
      });
    });

    it('should return error if category ID is missing', async () => {
      mockReq.body = { productIds: [1, 2] };

      await compareProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category ID is required for comparison',
      });
    });

    it('should return 404 for non-existent category', async () => {
      mockReq.body = { productIds: [1, 2], categoryId: 999 };
      mockCategory.findByPk.mockResolvedValue(null);

      await compareProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category not found',
      });
    });

    it('should return 404 if one or more products are not found or do not belong to the category', async () => {
      mockReq.body = { productIds: [1, 2], categoryId: 1 };

      const mockCategoryData = {
        id: 1,
        name: 'Electronics',
        comparisonFields: [],
      };
      const mockCategoryInstance = (mockCategory as any)(mockCategoryData);
      mockCategoryInstance.toJSON.mockReturnValue(mockCategoryData);

      const mockProductsData = [
        {
          id: 1,
          name: 'iPhone',
          price: 999.00,
          features: {},
          categoryId: 1,
          images: [],
          stockQuantity: 10,
          inStock: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const mockProductInstances = mockProductsData.map(p => {
        const instance = (mockProduct as any)(p);
        instance.toJSON.mockReturnValue({
            ...p,
            createdAt: instance.createdAt,
            updatedAt: instance.updatedAt,
        });
        return instance;
      });

      mockCategory.findByPk.mockResolvedValue(mockCategoryInstance);
      mockProduct.findAll.mockResolvedValue(mockProductInstances);

      await compareProducts(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'One or more products not found or do not belong to the specified category',
      });
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations successfully', async () => {
      mockReq.params = { productId: '1' };
      mockReq.query = { limit: '5' };

      const mockProductData = {
        id: 1,
        name: 'iPhone',
        categoryId: 1,
        price: 999.00,
        description: 'Test Description',
        features: {},
        images: [],
        stockQuantity: 10,
        inStock: true,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
      };

      const mockRecommendationsResponse = {
        recommendations: [
          { id: 2, name: 'Samsung', similarity_score: 0.8 },
        ],
      };

      const productInstance = (mockProduct as any)(mockProductData);
      productInstance.toJSON.mockReturnValue({
          ...mockProductData,
          createdAt: productInstance.createdAt,
          updatedAt: productInstance.updatedAt,
      });
      mockProduct.findByPk.mockResolvedValue(productInstance);

      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockRecommendationsResponse),
      } as any);

      await getRecommendations(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        product: {
            ...mockProductData,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        },
        recommendations: mockRecommendationsResponse.recommendations,
      }));
    });

    it('should return 404 for non-existent product', async () => {
      mockReq.params = { productId: '999' };
      mockProduct.findByPk.mockResolvedValue(null);

      await getRecommendations(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Product not found' });
    });

    it('should return fallback recommendations when service fails', async () => {
      mockReq.params = { productId: '1' };
      mockReq.query = { limit: '5' };

      const mockProductData = {
        id: 1,
        name: 'iPhone',
        categoryId: 1,
        price: 999.00,
        description: 'Test Description',
        features: {},
        images: [],
        stockQuantity: 10,
        inStock: true,
        createdAt: new Date('2023-01-01T10:00:00Z'),
        updatedAt: new Date('2023-01-01T10:00:00Z'),
      };

      const mockFallbackProducts = [
        {
            id: 2,
            name: 'Samsung',
            price: 899.00,
            categoryId: 1,
            description: 'Fallback Desc',
            features: {},
            images: [],
            stockQuantity: 5,
            inStock: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
      ];

      const productInstance = (mockProduct as any)(mockProductData);
      productInstance.toJSON.mockReturnValue({
          ...mockProductData,
          createdAt: productInstance.createdAt,
          updatedAt: productInstance.updatedAt,
      });
      mockProduct.findByPk.mockResolvedValue(productInstance);

      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      mockFetch.mockRejectedValue(new Error('Service unavailable'));

      const mockFallbackInstances = mockFallbackProducts.map(p => {
          const instance = (mockProduct as any)(p);
          instance.toJSON.mockReturnValue({
              ...p,
              createdAt: instance.createdAt,
              updatedAt: instance.updatedAt,
          });
          return instance;
      });

      mockProduct.findAll.mockResolvedValue(mockFallbackInstances);

      await getRecommendations(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        product: {
            ...mockProductData,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
        },
        recommendations: expect.arrayContaining([
          expect.objectContaining({
            id: 2,
            name: 'Samsung',
            price: 899.00,
            similarity_score: 0.5,
            categoryId: 1,
            description: 'Fallback Desc',
            features: {},
            images: [],
            stockQuantity: 5,
            inStock: true,
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }),
        ]),
      }));
    });
  });
});