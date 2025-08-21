import { Request, Response } from 'express';
import { User, getSequelizeInstance } from '../config/database';
import { AuthRequest } from '../models/User';
import { validationResult } from 'express-validator';

export const purchaseGiftCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftCard = sequelize.models.GiftCard;
    const GiftCardTransaction = sequelize.models.GiftCardTransaction;
    const NotificationModel = sequelize.models.Notification;
    
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

    const { amount, recipientEmail, message } = req.body;

    if (amount < 10 || amount > 1000) {
      res.status(400).json({ message: 'Gift card amount must be between $10 and $1000' });
      return;
    }

    const generateGiftCardCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 12; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    const code = generateGiftCardCode();

    const giftCard = await GiftCard.create({
      code,
      amount,
      balance: amount,
      purchasedBy: req.user.id,
      recipientEmail,
      message,
      isActive: true
    });

    await GiftCardTransaction.create({
      giftCardId: (giftCard as any).id,
      amount,
      type: 'purchase'
    });

    if (recipientEmail && recipientEmail !== req.user.email) {
      const recipientUser = await User.findOne({ where: { email: recipientEmail } });
      
      if (recipientUser) {
        await NotificationModel.create({
          userId: recipientUser.id,
          type: 'gift_card_received',
          title: 'Gift Card Received',
          message: `You received a $${amount} gift card from ${req.user.firstName} ${req.user.lastName}`,
          relatedId: (giftCard as any).id
        });
      }

      try {
        console.log(`Gift card notification would be sent to ${recipientEmail}`);
      } catch (emailError) {
        console.error(`Failed to send gift card notification email:`, emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Gift card purchased successfully',
      data: {
        id: (giftCard as any).id,
        code: (giftCard as any).code,
        amount: (giftCard as any).amount,
        recipientEmail: (giftCard as any).recipientEmail
      }
    });
  } catch (error) {
    console.error('Purchase gift card error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getGiftCardByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftCard = sequelize.models.GiftCard;
    
    const { code } = req.params;

    const giftCard = await GiftCard.findOne({
      where: { code, isActive: true },
      attributes: ['id', 'code', 'amount', 'balance', 'isActive']
    });

    if (!giftCard) {
      res.status(404).json({ message: 'Gift card not found or inactive' });
      return;
    }

    res.json({
      success: true,
      data: giftCard
    });
  } catch (error) {
    console.error('Get gift card by code error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const redeemGiftCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftCard = sequelize.models.GiftCard;
    const GiftCardTransaction = sequelize.models.GiftCardTransaction;
    
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

    const { code, amount, orderId } = req.body;

    const giftCard = await GiftCard.findOne({
      where: { code, isActive: true }
    });

    if (!giftCard) {
      res.status(404).json({ message: 'Gift card not found or inactive' });
      return;
    }

    if ((giftCard as any).balance < amount) {
      res.status(400).json({ 
        message: 'Insufficient gift card balance',
        availableBalance: (giftCard as any).balance
      });
      return;
    }

    const newBalance = (giftCard as any).balance - amount;
    await giftCard.update({ balance: newBalance });

    await GiftCardTransaction.create({
      giftCardId: (giftCard as any).id,
      orderId,
      amount,
      type: 'redemption'
    });

    res.json({
      success: true,
      message: 'Gift card redeemed successfully',
      data: {
        redeemedAmount: amount,
        remainingBalance: newBalance
      }
    });
  } catch (error) {
    console.error('Redeem gift card error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getUserGiftCards = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftCard = sequelize.models.GiftCard;
    const GiftCardTransaction = sequelize.models.GiftCardTransaction;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const giftCards = await GiftCard.findAll({
      where: { purchasedBy: req.user.id },
      include: [
        {
          model: GiftCardTransaction,
          as: 'transactions'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: giftCards
    });
  } catch (error) {
    console.error('Get user gift cards error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const shareGiftCard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftCard = sequelize.models.GiftCard;
    const NotificationModel = sequelize.models.Notification;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { recipientEmails, message } = req.body;

    const giftCard = await GiftCard.findOne({
      where: { id, purchasedBy: req.user.id }
    });

    if (!giftCard) {
      res.status(404).json({ message: 'Gift card not found or not authorized' });
      return;
    }

    for (const email of recipientEmails) {
      try {
        const recipientUser = await User.findOne({ where: { email } });
        
        if (recipientUser) {
          await NotificationModel.create({
            userId: recipientUser.id,
            type: 'gift_card_shared',
            title: 'Gift Card Shared',
            message: `${req.user.firstName} ${req.user.lastName} shared a gift card with you`,
            relatedId: (giftCard as any).id
          });
        }

        console.log(`Gift card share notification would be sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send gift card share email to ${email}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: 'Gift card shared successfully'
    });
  } catch (error) {
    console.error('Share gift card error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
