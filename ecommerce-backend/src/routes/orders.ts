// backend/src/routes/orders.ts
import { Router } from 'express';
import { body } from 'express-validator'; // FIX: Removed .and() as it's not a direct method for ValidationChain
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController';
import { processPayment, getUserPaymentMethods } from '../controllers/paymentController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

const createOrderValidation = [
  body('products')
    .isArray({ min: 1 })
    .withMessage('At least one product is required'),
  body('products.*.productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('products.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Street address is required and must be less than 200 characters'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City is required and must be less than 100 characters'),
  body('shippingAddress.state')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State is required and must be less than 100 characters'),
  body('shippingAddress.zipCode')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Zip code is required and must be less than 20 characters'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country is required and must be less than 100 characters'),

  // Conditional validation for payment method details
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'bank_transfer'])
    .withMessage('Invalid payment method selected'),

  // If paymentMethod is credit_card or debit_card, then validate card details
  // CVV is always required for card payments
  body('cardInfo.cvv')
    .if(body('paymentMethod').isIn(['credit_card', 'debit_card']))
    .notEmpty().withMessage('CVV is required for card payments')
    .isLength({ min: 3, max: 4 }).withMessage('CVV must be 3 or 4 digits'),

  // If NOT using a selectedPaymentId, then require full card details for a new card
  body('cardInfo.cardNumber')
    .if((value, { req }) => {
      const { paymentMethod, selectedPaymentId } = req.body;
      return (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && !selectedPaymentId;
    })
    .notEmpty().withMessage('Card number is required for new cards')
    .isLength({ min: 16, max: 16 }).withMessage('Card number must be exactly 16 digits'),

  body('cardInfo.expMonth')
    .if((value, { req }) => {
      const { paymentMethod, selectedPaymentId } = req.body;
      return (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && !selectedPaymentId;
    })
    .notEmpty().withMessage('Expiration month is required for new cards')
    .isInt({ min: 1, max: 12 }).withMessage('Expiration month must be between 1 and 12'),

  body('cardInfo.expYear')
    .if((value, { req }) => {
      const { paymentMethod, selectedPaymentId } = req.body;
      return (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && !selectedPaymentId;
    })
    .notEmpty().withMessage('Expiration year is required for new cards')
    .isInt({ min: new Date().getFullYear(), max: new Date().getFullYear() + 20 }).withMessage('Expiration year must be valid'),

  // If using a selectedPaymentId, it must be an integer
  body('selectedPaymentId')
    .if(body('paymentMethod').isIn(['credit_card', 'debit_card'])) // Only if a card payment
    .optional() // It's optional, but if present, validate it
    .isInt({ min: 1 }).withMessage('Selected payment ID must be a positive integer'),
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

const saveCardValidation = [
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

const processPaymentValidation = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  body('dummyCardId')
    .isInt({ min: 1 })
    .withMessage('Card ID must be a positive integer'),
  body('cvv')
    .isLength({ min: 3, max: 4 })
    .withMessage('CVV must be 3 or 4 digits')
];

router.post('/', authenticateToken, createOrderValidation, createOrder);
router.get('/', authenticateToken, getUserOrders);
router.get('/all', authenticateToken, requireAdmin, getAllOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatusValidation, updateOrderStatus);
router.get('/api/cards', authenticateToken, getUserPaymentMethods);
//router.post('/api/cards', authenticateToken, saveCardValidation, saveCardInfo);
router.post('/api/payments/process', authenticateToken, processPaymentValidation, processPayment);

export default router;