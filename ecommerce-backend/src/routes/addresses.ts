import express from 'express';
import { body } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { Router } from 'express'; 
import {
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/addressController';

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

router.post('/', authenticateToken, addressValidation, createAddress);  
router.put('/:id', authenticateToken, addressValidation, updateAddress);  
router.delete('/:id', authenticateToken, deleteAddress);
router.post('/', authenticateToken, addressValidation, createAddress);
router.put('/:id', authenticateToken, addressValidation, updateAddress);
router.delete('/:id', authenticateToken, deleteAddress);

export default router;
