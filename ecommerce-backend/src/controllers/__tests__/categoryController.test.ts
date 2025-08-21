import { Request, Response } from 'express'
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryComparisonFields,
} from '../categoryController'
import { Category } from '../../models/Category' // Ensure this path is correct
import { Product } from '../../models/Product' // Ensure this path is correct
import { AuthRequest } from '../../types' // Ensure this path is correct based on your project structure
import { validationResult } from 'express-validator'
import * as ExpressValidator from 'express-validator'
import { Op } from 'sequelize'; // Import Op from sequelize


interface IComparisonField {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'string' | 'select' | 'multiselect'; // Ensure these are string literals
  required: boolean;
  displayOrder: number;
}
interface CategoryRequestBody {
  name: string;
  description: string;
  comparisonFields?: IComparisonField[]; // This is an array from the client
}

// Define an interface for the category structure expected in responses and mocks
interface ICategoryResponse {
  id: number; // Sequelize uses 'id' (number), and it's typically present in responses
  name: string;
  description: string;
  comparisonFields: IComparisonField[]; // This will always be an array in our test responses/mocks
  createdAt?: Date;
  updatedAt?: Date;
  products?: any[]; // Keep as any[] for simplicity in test mock, or define actual Product type
}

// Define a type for the mock category instance, which includes the methods that Sequelize instances have
interface MockCategoryInstance extends ICategoryResponse {
  toJSON: jest.Mock;
  update: jest.Mock;
  destroy: jest.Mock;
  rawComparisonFields: string;
}

// Mock the Category model - REVISED
jest.mock('../../models/Category', () => {
  const mockCategoryInstance = (data: Partial<ICategoryResponse> = {}): MockCategoryInstance => {
   const instance: MockCategoryInstance = {
      id: data.id || 1,
      name: data.name || 'Test Category',
      description: data.description || 'Test Description',
      comparisonFields: data.comparisonFields || [], // Always an array
      rawComparisonFields: JSON.stringify(data.comparisonFields || []), // For mocking direct DB string (if needed by attributes query like getCategoryComparisonFields)
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      toJSON: jest.fn().mockImplementation(function(this: MockCategoryInstance) {
        return {
          id: this.id,
          name: this.name,
          description: this.description,
          //comparisonFields: this.comparisonFields,
          comparisonFields: this.rawComparisonFields ? JSON.parse(this.rawComparisonFields) : [], // Already an array
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
          products: this.products,
        };
      }),
      update: jest.fn().mockImplementation(function (this: MockCategoryInstance, updateData: Partial<CategoryRequestBody>) {
        this.name = updateData.name || this.name;
        this.description = updateData.description || this.description;
        if (updateData.comparisonFields !== undefined) {
          this.rawComparisonFields = JSON.stringify(updateData.comparisonFields);
          this.comparisonFields = updateData.comparisonFields;
        }
        this.updatedAt = new Date();
        return Promise.resolve(this);
      }),
      destroy: jest.fn(),
    };
    return instance;
  };


  const mockCategoryConstructor = jest.fn().mockImplementation((data) => {
    return mockCategoryInstance({
      ...data,
      comparisonFields: data.comparisonFields || [], // Should be an array already from req.body
    });
  });

  Object.assign(mockCategoryConstructor, {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((data: CategoryRequestBody) => {
      const newInstance = mockCategoryInstance({
        ...data,
        id: Math.floor(Math.random() * 1000) + 100,
        comparisonFields: data.comparisonFields || [],
      });
      newInstance.rawComparisonFields = JSON.stringify(data.comparisonFields || []);
      return Promise.resolve(newInstance);
    }),
  });

  return {
    Category: mockCategoryConstructor,
    __esModule: true,
    mockCategoryInstance,
  };
});

// Mock the Product model
jest.mock('../../models/Product', () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  }
}));

// Mock express-validator
jest.mock('express-validator', () => ({
  validationResult: jest.fn(), // Mock validationResult function
  // If you are using other functions from express-validator, you might need to mock them here too.
}));
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize, // Spread actual Sequelize properties if other mocks are not needed
    Op: actualSequelize.Op, // Crucial: Use the actual Op object from Sequelize
  };
  });

const mockValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

const { Category: mockCategory, mockCategoryInstance } = require('../../models/Category')
const { Product: mockProduct } = require('../../models/Product')

describe('CategoryController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockAuthReq: Partial<AuthRequest>
  let spyValidationResult: jest.SpyInstance;

  beforeEach(() => {
    mockReq = {
      params: {},
      body: {},
    }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    }
    mockAuthReq = {
      user: { id: 1, role: 'admin', email: 'admin@ecommerce.com' },
      params: {},
      body: {},
    }
    jest.clearAllMocks()
    spyValidationResult = jest.spyOn(ExpressValidator, 'validationResult');
    spyValidationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    } as any);
  });

  afterEach(() => {
    spyValidationResult.mockRestore(); // Restore the original validationResult function after each test
  });


  describe('getAllCategories', () => {
    it('should return all categories successfully', async () => {
      const mockCategoriesData: ICategoryResponse[] = [{
        id: 1,
        name: 'Electronics',
        description: 'Electronic items',
        comparisonFields: [{ name: 'Weight', type: 'number', required: false, displayOrder: 1 }],
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      }, {
        id: 2,
        name: 'Books',
        description: 'Books and literature',
        comparisonFields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      }, ];

      mockCategory.findAll.mockResolvedValue(mockCategoriesData.map(c => {
        const instance = mockCategoryInstance(c);
        instance.rawComparisonFields = JSON.stringify(c.comparisonFields); // Set the internal string
        return instance;
      }));

      await getAllCategories(mockReq as Request, mockRes as Response);

      expect(mockCategory.findAll).toHaveBeenCalledWith({
        include: [{ model: mockProduct, as: 'products' }],
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining(
          mockCategoriesData.map(c => expect.objectContaining({
            id: c.id,
            name: c.name,
            description: c.description,
            comparisonFields: c.comparisonFields, // Expect array from response
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          }))
        ),
      });
    });

    it('should handle errors', async () => {
      mockCategory.findAll.mockRejectedValue(new Error('Database error'));

      await getAllCategories(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id successfully', async () => {
      const mockCategoryData: ICategoryResponse = {
        id: 1,
        name: 'Electronics',
        description: 'Electronic items',
        comparisonFields: [{ name: 'Screen Size', type: 'number', required: true, displayOrder: 1 }],
        createdAt: new Date(),
        updatedAt: new Date(),
        products: [],
      };

      mockReq.params = { id: '1' };
      const instance = mockCategoryInstance(mockCategoryData);
      instance.rawComparisonFields = JSON.stringify(mockCategoryData.comparisonFields); // Set the internal string
      mockCategory.findByPk.mockResolvedValue(instance); // Mock findByPk to return the instance

      await getCategoryById(mockReq as Request, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1', {
        include: [{ model: mockProduct, as: 'products' }],
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: mockCategoryData.id,
          name: mockCategoryData.name,
          description: mockCategoryData.description,
          comparisonFields: mockCategoryData.comparisonFields, // Test expects array in response
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return 404 for non-existent category', async () => {
      mockReq.params = { id: '999' };
      mockCategory.findByPk.mockResolvedValue(null);

      await getCategoryById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category not found',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockCategory.findByPk.mockRejectedValue(new Error('Database error'));

      await getCategoryById(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData: CategoryRequestBody = {
        name: 'New Category',
        description: 'Description of new category',
        comparisonFields: [{ name: 'Size', type: 'text', required: true, displayOrder: 1 }],
      };

      mockAuthReq.body = categoryData;
      const createdCategoryMockData: ICategoryResponse = {
        id: 1,
        name: categoryData.name,
        description: categoryData.description,
        comparisonFields: categoryData.comparisonFields || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const instance = mockCategoryInstance(createdCategoryMockData);
      mockCategory.create.mockResolvedValue(instance);
      mockCategory.findOne.mockResolvedValue(null);
      await createCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findOne).toHaveBeenCalledWith({ where: { name: categoryData.name } });
      // Expect comparisonFields to be stringified when passed to create
      expect(mockCategory.create).toHaveBeenCalledWith({
        ...categoryData,
        comparisonFields: JSON.stringify(categoryData.comparisonFields),
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category created successfully',
        data: expect.objectContaining({
          id: createdCategoryMockData.id,
          name: categoryData.name,
          description: categoryData.description,
          comparisonFields: categoryData.comparisonFields,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return error for duplicate category name', async () => {
      mockAuthReq.body = { name: 'Electronics', description: 'desc', comparisonFields: [] };
      //mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockCategory.findOne.mockResolvedValue({ name: 'Electronics' } as any);

      await createCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findOne).toHaveBeenCalledWith({ where: { name: 'Electronics' } });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category with this name already exists',
      });
    });

    it('should return 400 if validation fails', async () => {
      mockAuthReq.body = { name: '' };
      spyValidationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false), // Validation fails
        array: jest.fn().mockReturnValue([{ msg: 'Name is required', path: 'name', location: 'body', value: '' }])
      } as any);
      mockCategory.findOne.mockResolvedValue(null);
      mockCategory.create.mockClear();

      await createCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: [{ msg: 'Name is required', path: 'name', location: 'body', value: '' }]
      });
      expect(mockCategory.create).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockAuthReq.body = { name: 'Error Category', description: 'desc', comparisonFields: [] };
      //mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockCategory.findOne.mockResolvedValue(null);
      mockCategory.create.mockRejectedValue(new Error('Database error'));

      await createCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      mockAuthReq.user = { id: 1, role: 'admin', email: 'admin@ecommerce.com' };
      mockAuthReq.params = { id: '1' };
      const updateData: CategoryRequestBody = {
        name: 'Updated Electronics',
        description: 'Updated description',
        comparisonFields: [{ name: 'Weight', type: 'number', required: false, displayOrder: 1 }],
      };
      mockAuthReq.body = updateData;

      const mockExistingCategoryData: ICategoryResponse = {
        id: 1,
        name: 'Electronics',
        description: 'Original description',
        comparisonFields: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockExistingCategoryInstance = mockCategoryInstance(mockExistingCategoryData);
      mockExistingCategoryInstance.rawComparisonFields = JSON.stringify(mockExistingCategoryData.comparisonFields);
      const mockUpdatedCategoryInstance = mockCategoryInstance({
        ...mockExistingCategoryData,
        ...updateData,
        updatedAt: new Date(),
      });
      mockUpdatedCategoryInstance.rawComparisonFields = JSON.stringify(updateData.comparisonFields);


      mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockCategory.findByPk.mockResolvedValue(mockExistingCategoryInstance);
      mockExistingCategoryInstance.update.mockResolvedValue(mockUpdatedCategoryInstance);


      await updateCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1');
      expect(mockCategory.findOne).toHaveBeenCalledWith({
        where: { name: updateData.name, id:  { [Op.ne]: '1' } }
      });
      expect(mockExistingCategoryInstance.update).toHaveBeenCalledWith({
        ...updateData,
        comparisonFields: JSON.stringify(updateData.comparisonFields),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category updated successfully',
        data: expect.objectContaining({
          id: mockExistingCategoryInstance.id, // Use the updated instance
          name: updateData.name,
          description: updateData.description,
          comparisonFields: updateData.comparisonFields, // Expect array in response
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return 400 if validation fails', async () => {
      mockAuthReq.params = { id: '1' };
      mockAuthReq.body = { name: 'Existing Category' };
      const mockExistingCategoryOriginal = mockCategoryInstance({
        id: 1, name: 'Original Name', description: 'desc', comparisonFields: []
      });
      mockExistingCategoryOriginal.rawComparisonFields = JSON.stringify([]);
      const mockOtherExistingCategory = mockCategoryInstance({
        id: 2, name: 'Existing Category', description: 'desc2', comparisonFields: []
      });
      mockOtherExistingCategory.rawComparisonFields = JSON.stringify([]);

      mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockCategory.findByPk.mockResolvedValue(mockExistingCategoryOriginal);
      mockCategory.findOne.mockResolvedValue(mockOtherExistingCategory);

      await updateCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1');
      expect(mockCategory.findOne).toHaveBeenCalledWith({
        where: { name: 'Existing Category', id: { [Op.ne]: '1' } } // FIX: Use Op.ne directly
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category with this name already exists',
      });
    });



    it('should return 404 for non-existent category', async () => {
      mockAuthReq.params = { id: 'nonexistent' };
      //mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockCategory.findByPk.mockResolvedValue(null);

      await updateCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('nonexistent');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category not found'
      });
    });

   /* it('should return 400 for duplicate category name during update', async () => {
      mockAuthReq.params = { id: '1' };
      mockAuthReq.body = { name: 'Existing Category' };

      const mockExistingCategoryOriginal = mockCategoryInstance({
        id: 1, name: 'Original Name', description: 'desc', comparisonFields: []
      });
      mockExistingCategoryOriginal.rawComparisonFields = JSON.stringify([]);
      const mockOtherExistingCategory = mockCategoryInstance({
        id: 2, name: 'Existing Category', description: 'desc2', comparisonFields: []
      });
      mockOtherExistingCategory.rawComparisonFields = JSON.stringify([]);

      //mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
      mockCategory.findByPk.mockResolvedValue(mockExistingCategoryOriginal);
      mockCategory.findOne.mockResolvedValue(mockOtherExistingCategory);

      await updateCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1');
      expect(mockCategory.findOne).toHaveBeenCalledWith({
        where: { name: 'Existing Category', id: { [Op.ne]: '1' } }
      });
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category with this name already exists',
      });
    });*/

    it('should handle errors during update process', async () => {
      mockAuthReq.params = { id: '1' };
      mockAuthReq.body = { name: 'Error Category' };
      //mockValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);

      const mockExistingCategoryForError = mockCategoryInstance({
        id: 1, name: 'Original Name', description: 'Original Desc', comparisonFields: []
      });
      mockExistingCategoryForError.rawComparisonFields = JSON.stringify([]);
      mockCategory.findByPk.mockResolvedValue(mockExistingCategoryForError);
      mockCategory.findOne.mockResolvedValue(null); // Added: Ensure findOne does not return duplicate name
      mockExistingCategoryForError.update.mockRejectedValue(new Error('Database error during update'));

      await updateCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });

  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mockAuthReq.params = { id: '1' };

      const mockCategoryInstanceInTest = mockCategoryInstance({
        id: 1, name: 'Electronics', description: '', comparisonFields: []
      });
      mockCategoryInstanceInTest.rawComparisonFields = JSON.stringify([]);

      mockCategory.findByPk.mockResolvedValue(mockCategoryInstanceInTest);
      mockProduct.count.mockResolvedValue(0); // No products, so can delete
      mockCategoryInstanceInTest.destroy.mockResolvedValue(undefined); // Simulate successful deletion

      await deleteCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1');
      expect(mockProduct.count).toHaveBeenCalledWith({ where: { categoryId: '1' } });
      expect(mockCategoryInstanceInTest.destroy).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Category deleted successfully'
      });
    });

    it('should return 404 for non-existent category', async () => {
      mockAuthReq.params = { id: '999' };
      mockCategory.findByPk.mockResolvedValue(null);

      await deleteCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('999');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category not found',
      });
    });

    it('should return error when category has products', async () => {
      mockAuthReq.params = { id: '1' };

      const mockCategoryInstanceInTest = mockCategoryInstance({
        id: 1, name: 'Electronics', description: '', comparisonFields: []
      });
      mockCategoryInstanceInTest.rawComparisonFields = JSON.stringify([]);

      mockCategory.findByPk.mockResolvedValue(mockCategoryInstanceInTest);
      mockProduct.count.mockResolvedValue(5);

      await deleteCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1');
      expect(mockProduct.count).toHaveBeenCalledWith({ where: { categoryId: '1' } });
      expect(mockCategoryInstanceInTest.destroy).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Cannot delete category with existing products. Please delete or reassign products first.',
      });
    });

    it('should handle errors during deletion process', async () => {
      mockAuthReq.params = { id: '1' };

      const mockCategoryInstanceInTest = mockCategoryInstance({
        id: 1, name: 'Electronics', description: '', comparisonFields: []
      });
      mockCategoryInstanceInTest.rawComparisonFields = JSON.stringify([]);

      mockCategory.findByPk.mockResolvedValue(mockCategoryInstanceInTest);
      mockProduct.count.mockResolvedValue(0);
      mockCategoryInstanceInTest.destroy.mockRejectedValue(new Error('Database error during delete'));

      await deleteCategory(mockAuthReq as AuthRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });


  describe('getCategoryComparisonFields', () => {
    it('should return comparison fields successfully', async () => {
      const mockComparisonFields: IComparisonField[] = [
        { name: 'Brand', type: 'text', required: true, displayOrder: 1 },
        { name: 'Price', type: 'number', required: true, displayOrder: 2 },
      ];

      mockReq.params = { id: '1' };
      const mockCategoryInstanceInTest = mockCategoryInstance({
        id: 1,
        name: 'Electronics',
        description: 'Electronic items',
        comparisonFields: mockComparisonFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCategoryInstanceInTest.rawComparisonFields = JSON.stringify(mockComparisonFields);

      mockCategory.findByPk.mockResolvedValue(mockCategoryInstanceInTest);

      await getCategoryComparisonFields(mockReq as Request, mockRes as Response);

      expect(mockCategory.findByPk).toHaveBeenCalledWith('1', { attributes: ['comparisonFields'] });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockComparisonFields,
      });
    });

    it('should return 404 for non-existent category', async () => {
      mockReq.params = { id: '999' };
      mockCategory.findByPk.mockResolvedValue(null);

      await getCategoryComparisonFields(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Category not found',
      });
    });

    it('should handle errors', async () => {
      mockReq.params = { id: '1' };
      mockCategory.findByPk.mockRejectedValue(new Error('Database error'));

      await getCategoryComparisonFields(mockReq as Request, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error'
      });
    });
  });
});