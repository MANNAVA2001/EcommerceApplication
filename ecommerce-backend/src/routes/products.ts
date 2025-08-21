import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getRecommendations,
  compareProducts,
  compareExternalPrices,
} from '../controllers/productController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Product name is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('features')
    .optional()
    .isObject()
    .withMessage('Features must be an object'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
];

const compareValidation = [
  body('productIds')
    .isArray({ min: 2 })
    .withMessage('At least 2 product IDs are required for comparison'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
];

const externalPriceValidation = [
  body('productName')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Product name is required')
];

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/recommendations', getRecommendations);
router.post('/', authenticateToken, requireAdmin, productValidation, createProduct);
router.put('/:id', authenticateToken, requireAdmin, productValidation, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);
router.get('/search', searchProducts);
router.post('/compare', authenticateToken, compareValidation, compareProducts);
router.post('/:id/external-prices', authenticateToken, externalPriceValidation, compareExternalPrices);

export default router;
