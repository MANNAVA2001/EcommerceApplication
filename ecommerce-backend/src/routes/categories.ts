import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryComparisonFields
} from '../controllers/categoryController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description is required and must be less than 500 characters'),
  body('comparisonFields')
    .optional()
    .isArray()
    .withMessage('Comparison fields must be an array'),
  body('comparisonFields.*.name')
    .if(body('comparisonFields').exists())
    .trim()
    .notEmpty()
    .withMessage('Comparison field name is required'),
  body('comparisonFields.*.type')
    .if(body('comparisonFields').exists())
    .isIn(['text', 'number', 'boolean', 'select', 'multiselect'])
    .withMessage('Invalid comparison field type'),
  body('comparisonFields.*.displayOrder')
    .if(body('comparisonFields').exists())
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

router.get('/', getAllCategories);
router.get('/:id', getCategoryById);
router.get('/:id/comparison-fields', getCategoryComparisonFields);
router.post('/', authenticateToken, requireAdmin, categoryValidation, createCategory);
router.put('/:id', authenticateToken, requireAdmin, categoryValidation, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export default router;
