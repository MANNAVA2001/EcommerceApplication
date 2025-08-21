// backend/src/controllers/categoryController.ts

// backend/src/controllers/categoryController.ts

import { Request, Response } from 'express';
import { Category, Product } from '../config/database'; // Assuming these are Sequelize models
import { AuthRequest } from '../models/User'; // Assuming this path is correct and it extends Request
// Import CategoryAttributes and CategoryCreationAttributes, assuming they have comparisonFields as string
import { IComparisonField, CategoryAttributes, CategoryCreationAttributes } from '../models/Category';
import { Op } from 'sequelize';
import { validationResult } from 'express-validator'; // Import validationResult
// Updated CategoriesController to handle comparisonFields as an array of objects to admin managment 
// Interface for the incoming request body when creating/updating a category
 export interface CategoryRequestBody {
  name: string;
  description: string;
  comparisonFields?: IComparisonField[]; // This is an array from the client
}
// updated validation to ensure comparisonFields is an array of objects
// Interface for the data structure returned in API responses
export interface ICategoryResponse {
  id: number; // Assuming ID is always a number and present in response
  name: string;
  description: string;
  comparisonFields: IComparisonField[]; // This is an array for the response
  createdAt?: Date;
  updatedAt?: Date;
  products?: any[]; // Products can be included, keep as any[] for flexibility or define a Product interface
}

/**
 * @route GET /api/categories
 * @desc Get all categories with associated products
 * @access Public
 */
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products' }],
    });

    const categoriesForResponse: ICategoryResponse[] = categories.map(cat => ({
      ...cat.toJSON(), // Converts Sequelize instance to plain object
      // Safely parse comparisonFields from string to IComparisonField[] for the response
      comparisonFields: (cat.comparisonFields && typeof cat.comparisonFields === 'string')
        ? JSON.parse(cat.comparisonFields)
        : (cat.comparisonFields || []), // Handle cases where it might be null/undefined or already parsed if model getter exists
    }));

    res.status(200).json({ success: true, data: categoriesForResponse });
    return;
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

/**
 * @route GET /api/categories/:id
 * @desc Get a single category by ID with associated products
 * @access Public
 */
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      include: [{ model: Product, as: 'products' }],
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const categoryForResponse: ICategoryResponse = {
      ...category.toJSON(),
      // Safely parse comparisonFields from string to IComparisonField[] for the response
      comparisonFields: (category.comparisonFields && typeof category.comparisonFields === 'string')
        ? JSON.parse(category.comparisonFields)
        : (category.comparisonFields || []), // Handle cases where it might be null/undefined or already parsed if model getter exists
    };

    res.status(200).json({ success: true, data: categoryForResponse });
    return;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

/**
 * @route POST /api/categories
 * @desc Create a new category
 * @access Private (Admin only, handled by AuthRequest)
 */
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req); // <--- This line is key
    if (!errors.isEmpty()) {
      res.status(400).json({ message: 'Validation failed', errors: errors.array() });
      return;
    }
    const { name, description, comparisonFields } = req.body;

    // Check if a category with the same name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      res.status(400).json({ message: 'Category with this name already exists' });
      return;
    }

    // Convert comparisonFields array to JSON string for storage in the database
    // Ensure CategoryCreationAttributes expects 'comparisonFields: string;'
    const comparisonFieldsString = JSON.stringify(comparisonFields || []);

    const newCategory = await Category.create({
      name,
      description,
      comparisonFields: comparisonFields ? JSON.stringify(comparisonFields) : '[]', // Pass the stringified version for the 'string' type
    } as CategoryCreationAttributes); // Type assertion is fine here if CategoryCreationAttributes expects 'string'


    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: newCategory.toJSON(),
    });
    return;
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

/**
 * @route PUT /api/categories/:id
 * @desc Update an existing category
 * @access Private (Admin only, handled by AuthRequest)
 */
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Declare id here
    const { name, description, comparisonFields } = req.body as Partial<CategoryRequestBody>; // Declare body variables here

    const category = await Category.findByPk(id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check for duplicate name only if the name is being updated and it's different from current
    // `existingCategory` is now declared within this inner scope.
    if (name !== undefined && name !== category.name) {
      const existingCategory = await Category.findOne({ // Redeclaration was likely here
        where: {
          name,
          id: { [Op.ne]: id }, // Exclude the current category itself
        },
      });
      if (existingCategory) {
        res.status(400).json({ message: 'Category with this name already exists' });
        return;
      }
    }

    const updateData: Partial<CategoryAttributes> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;

    if (comparisonFields !== undefined) {
      updateData.comparisonFields = JSON.stringify(comparisonFields); // Stringify the array for assignment to 'string' type
    }

    const updatedCategory = await category.update(updateData);

    const categoryDataForResponse: ICategoryResponse = {
      ...updatedCategory.toJSON(),
      comparisonFields: (updatedCategory.comparisonFields && typeof updatedCategory.comparisonFields === 'string')
        ? JSON.parse(updatedCategory.comparisonFields)
        : (updatedCategory.comparisonFields || []),
    };

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: categoryDataForResponse,
    });
    return;
  } catch (error: any) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};
/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category
 * @access Private (Admin only, handled by AuthRequest)
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Check if there are any products associated with this category
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      res.status(400).json({
        message: 'Cannot delete category with existing products. Please delete or reassign products first.',
      });
      return;
    }

    await category.destroy();
    res.status(200).json({ success: true, message: 'Category deleted successfully' });
    return; // Ensure to return after sending response
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

/**
 * @route GET /api/categories/:id/comparison-fields
 * @desc Get comparison fields for a specific category
 * @access Public
 */
export const getCategoryComparisonFields = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id, {
      attributes: ['comparisonFields'], // Only fetch the comparisonFields attribute
    });

    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    // Parse comparisonFields from string to IComparisonField[] for the response
    res.status(200).json({
      success: true,
      data: (category.comparisonFields && typeof category.comparisonFields === 'string')
        ? JSON.parse(category.comparisonFields)
        : (category.comparisonFields || []), // Handle cases where it might be null/undefined or already parsed if model getter exists
    });
    return;
  } catch (error) {
    console.error('Error fetching comparison fields:', error);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};