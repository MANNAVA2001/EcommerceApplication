import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getUserCheckoutData,
  createCheckoutAddress,
  updateCheckoutAddress,
  deleteCheckoutAddress,
  createCheckoutPaymentMethod,
  updateCheckoutPaymentMethod,
  deleteCheckoutPaymentMethod
} from '../controllers/userCheckoutController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const addressValidation = [
  body('street')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address is required and must be less than 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City is required and must be less than 100 characters'),
  body('state')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State is required and must be less than 100 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zip code is required and must be less than 20 characters'),
  body('country')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country is required and must be less than 100 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

const paymentMethodValidation = [
  body('cardNumber')
    .isLength({ min: 16, max: 16 })
    .withMessage('Card number must be exactly 16 digits'),
  body('expMonth')
    .isInt({ min: 1, max: 12 })
    .withMessage('Expiration month must be between 1 and 12'),
  body('expYear')
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 })
    .withMessage('Expiration year must be valid'),
  body('cvv')
    .isLength({ min: 3, max: 4 })
    .withMessage('CVV must be 3 or 4 digits')
];

router.get('/checkout-data', authenticateToken, getUserCheckoutData);

router.post('/addresses', authenticateToken, addressValidation, createCheckoutAddress);
router.put('/addresses/:id', authenticateToken, addressValidation, updateCheckoutAddress);
router.delete('/addresses/:id', authenticateToken, deleteCheckoutAddress);

router.post('/payment-methods', authenticateToken, paymentMethodValidation, createCheckoutPaymentMethod);
router.put('/payment-methods/:id', authenticateToken, paymentMethodValidation, updateCheckoutPaymentMethod);
router.delete('/payment-methods/:id', authenticateToken, deleteCheckoutPaymentMethod);

export default router;
