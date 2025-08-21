import { Router } from 'express';
import { body } from 'express-validator';
import {
  purchaseGiftCard,
  getGiftCardByCode,
  redeemGiftCard,
  getUserGiftCards,
  shareGiftCard
} from '../controllers/giftCardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const purchaseGiftCardValidation = [
  body('amount')
    .isFloat({ min: 10, max: 1000 })
    .withMessage('Gift card amount must be between $10 and $1000'),
  body('recipientEmail')
    .optional()
    .isEmail()
    .withMessage('Recipient email must be valid'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message must be less than 500 characters')
];

const redeemGiftCardValidation = [
  body('code')
    .isLength({ min: 1 })
    .withMessage('Gift card code is required'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Redemption amount must be greater than 0'),
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer')
];

const shareGiftCardValidation = [
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

router.post('/purchase', authenticateToken, purchaseGiftCardValidation, purchaseGiftCard);
router.get('/code/:code', getGiftCardByCode);
router.post('/redeem', authenticateToken, redeemGiftCardValidation, redeemGiftCard);
router.get('/', authenticateToken, getUserGiftCards);
router.post('/:id/share', authenticateToken, shareGiftCardValidation, shareGiftCard);

export default router;
