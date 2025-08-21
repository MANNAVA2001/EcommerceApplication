import { Request, Response } from 'express';
import { getSequelizeInstance, Address, DummyCardInfo } from '../config/database';
import { AuthRequest } from '../models/User';
import { QueryTypes, Op } from 'sequelize';
import { validationResult } from 'express-validator';

/*interface StoredProcedureResult {  
  userId: number;  
  username: string;  
  email: string;  
  firstName: string;  
  lastName: string;  
  phone: string;  
  addressId: number;  
  street: string;  
  city: string;  
  state: string;  
  zipCode: string;  
  country: string;  
  isDefault: boolean;  
  cardId: number;  
  cardNumber: string;  
  expMonth: number;  
  expYear: number;  
}*/
  
export const getUserCheckoutData = async (req: AuthRequest, res: Response): Promise<void> => {  
  try {  
    const userId = req.user?.id;  
      
    if (!userId) {  
      res.status(401).json({ message: 'User not authenticated' });  
      return;  
    }  
  
    const results = await getSequelizeInstance().query( // <--- Change .transaction to .query
      'EXEC GetUserWithAddressAndDummyCardInfo @UserId = :userId',
     {
       replacements: { userId },
       type: QueryTypes.SELECT
     }
   ) as any[];

    // Transform data to separate addresses and cards  
    const addresses = results.filter((row: any) => row.addressId).map((row: any) => ({  
      id: row.addressId,  
      street: row.street,  
      city: row.city,  
      state: row.state,  
      zipCode: row.zipCode,  
      country: row.country,  
      isDefault: row.isDefault  
    }));
    const cards = results.filter((row: any) => row.cardId).map((row: any) => ({  
      id: row.cardId,  
      cardNumber: `****-****-****-${row.cardNumber.slice(-4)}`,  
      expMonth: row.expMonth,  
      expYear: row.expYear  
      // CVV intentionally excluded for security  
    }));  
  
    res.status(200).json({  
      success: true,  
      data: {  
        user: {  
          id: results[0]?.userId,  
          firstName: results[0]?.firstName,  
          lastName: results[0]?.lastName,  
          email: results[0]?.email  
        },  
        addresses,  
        paymentMethods: cards  
      }  
    });  
  
  } catch (error) {  
    console.error('Error fetching checkout data:', error);  
    res.status(500).json({   
      message: 'Failed to retrieve checkout data',   
      error: (error as Error).message   
    });  
  }  
};

export const createCheckoutAddress = async (req: AuthRequest, res: Response): Promise<void> => {
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
    console.error('Error creating checkout address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCheckoutAddress = async (req: AuthRequest, res: Response): Promise<void> => {
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
    console.error('Error updating checkout address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCheckoutAddress = async (req: AuthRequest, res: Response): Promise<void> => {
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
    console.error('Error deleting checkout address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createCheckoutPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { cardNumber, expMonth, expYear, cvv } = req.body;

    const paymentMethod = await DummyCardInfo.create({
      userId: req.user.id,
      cardNumber,
      expMonth: parseInt(expMonth, 10),
      expYear: parseInt(expYear, 10),
      cvv
    });

    const maskedPaymentMethod = {
      ...paymentMethod.toJSON(),
      cardNumber: `****-****-****-${cardNumber.slice(-4)}`
    };

    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      data: maskedPaymentMethod
    });
  } catch (error) {
    console.error('Error creating checkout payment method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCheckoutPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const { cardNumber, expMonth, expYear, cvv } = req.body;

    const paymentMethod = await DummyCardInfo.findOne({
      where: { id, userId: req.user.id }
    });

    if (!paymentMethod) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }

    await paymentMethod.update({
      cardNumber,
      expMonth: parseInt(expMonth, 10),
      expYear: parseInt(expYear, 10),
      cvv
    });

    const maskedPaymentMethod = {
      ...paymentMethod.toJSON(),
      cardNumber: `****-****-****-${cardNumber.slice(-4)}`
    };

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully',
      data: maskedPaymentMethod
    });
  } catch (error) {
    console.error('Error updating checkout payment method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCheckoutPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const paymentMethod = await DummyCardInfo.findOne({
      where: { id, userId: req.user.id }
    });

    if (!paymentMethod) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }

    await paymentMethod.destroy();
    res.status(200).json({ success: true, message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting checkout payment method:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
