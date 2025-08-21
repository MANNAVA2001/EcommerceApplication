import { Router } from 'express';
import { body } from 'express-validator';
import {
  createGiftRegistry,
  getUserGiftRegistries,
  getGiftRegistryByUrl,
  updateGiftRegistry,
  deleteGiftRegistry,
  shareGiftRegistry
} from '../controllers/giftRegistryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const createGiftRegistryValidation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Registry name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high')
];

const updateGiftRegistryValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Registry name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array')
];

const shareGiftRegistryValidation = [
  body('recipientEmails')
    .isArray({ min: 1 })
    .withMessage('At least one recipient email is required'),
  body('recipientEmails.*')
    .isEmail()
    .withMessage('All recipient emails must be valid'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

router.post('/', authenticateToken, createGiftRegistryValidation, createGiftRegistry);
router.get('/', authenticateToken, getUserGiftRegistries);
router.get('/shared/:shareableUrl', getGiftRegistryByUrl);
router.put('/:id', authenticateToken, updateGiftRegistryValidation, updateGiftRegistry);
router.delete('/:id', authenticateToken, deleteGiftRegistry);
router.post('/:id/share', authenticateToken, shareGiftRegistryValidation, shareGiftRegistry);

export default router;
