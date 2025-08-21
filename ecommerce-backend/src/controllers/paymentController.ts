import { Request, Response } from 'express';
import { DummyCardInfo, Payment, Order, getSequelizeInstance} from '../config/database';
import { AuthRequest } from '../models/User';
import { validationResult } from 'express-validator';
import { QueryTypes } from 'sequelize';

interface SaveCardRequestBody {
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}

interface ProcessPaymentRequestBody {
  orderId: number;
  dummyCardId: number;
  cvv: string;
}


export const getUserPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const paymentMethods = await DummyCardInfo.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'userId', 'cardNumber', 'expMonth', 'expYear', 'createdAt', 'updatedAt']
    });

    const maskedPaymentMethods = paymentMethods.map(method => ({
      ...method.toJSON(),
      cardNumber: `****-****-****-${method.cardNumber.slice(-4)}`
    }));

    res.status(200).json({ success: true, data: maskedPaymentMethods });
  } catch (error) {
    console.error('Error fetching user payment methods:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const processPayment = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { orderId, dummyCardId, cvv } = req.body as ProcessPaymentRequestBody;

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id }
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found or not authorized' });
      return;
    }

    const cardInfo = await DummyCardInfo.findOne({
      where: { id: dummyCardId, userId: req.user.id }
    });

    if (!cardInfo) {
      res.status(404).json({ message: 'Card information not found or not authorized' });
      return;
    }

    if (cardInfo.cvv !== cvv) {
      res.status(400).json({ message: 'CVV does not match' });
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 15000));

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payment = await Payment.create({
      userId: req.user.id,
      dummyCardId,
      orderId,
      amountCents: Math.round(order.totalAmount * 100),
      currency: 'USD',
      transactionId,
      status: 'completed'
    });

    await Order.update(
      { status: 'processing' },
      { where: { id: orderId } }
    );

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        transactionId: payment.transactionId,
        status: payment.status,
        amount: payment.amountCents / 100
      }
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
