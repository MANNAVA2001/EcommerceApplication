import { Router } from 'express';  
import { getUserPaymentMethods } from '../controllers/paymentController';  
import { authenticateToken } from '../middleware/auth';  
  
const router = Router();  
  
router.get('/', authenticateToken, getUserPaymentMethods);  
  
export default router;