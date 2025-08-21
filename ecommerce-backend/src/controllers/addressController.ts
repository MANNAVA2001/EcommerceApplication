import { Request, Response } from 'express';
import { Address, getSequelizeInstance } from '../config/database'; 
import { AuthRequest } from '../models/User';
import { validationResult } from 'express-validator';
import { Op, QueryTypes } from 'sequelize';
import { getUserCheckoutData } from './userCheckoutController';  



export const getAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const address = await Address.findOne({
      where: { id, userId: req.user.id }
    });

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.error('Error fetching address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id } }
      );
    }

    const address = await Address.create({
      userId: req.user.id,
      street,
      city,
      state,
      zipCode,
      country: country || 'United States',
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: address
    });
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);  
    if (!errors.isEmpty()) {  
      res.status(400).json({  
        message: 'Validation failed',  
        errors: errors.array()  
      });  
      return;  
    }  
  
    if (!req.user || !req.user.id) {  
      res.status(401).json({ message: 'User not authenticated' });  
      return;  
    }  

    const { id } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    const address = await Address.findOne({
      where: { id, userId: req.user.id }
    });

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id, id: { [Op.ne]: id } } }
      );
    }

    await address.update({
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    });

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const address = await Address.findOne({
      where: { id, userId: req.user.id }
    });

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    await address.destroy();
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
