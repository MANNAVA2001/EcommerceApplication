// backend/src/controllers/orderController.ts
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Order, Product, OrderProduct, User, Address, DummyCardInfo, Payment, getSequelizeInstance } from '../config/database';
import { AuthRequest } from '../models/User';
import { validationResult } from 'express-validator';
import { EmailService } from '../utils/emailService';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { errorLogger } from '../utils/errorLogger'; // Assuming errorLogger is an object with a logError method
import { validateCardPrefix } from '../config/constants';
// Added Ordermanagement 
// Define types for request body payload
interface OrderProductPayload {
  productId: string; // Keep as string for now, will parse to number
  quantity: number;
  price: number; // Add price here if it's coming from frontend or to ensure it's available
}
// Define the request body structure for creating an order
// This should match the expected structure in your frontend form
interface CreateOrderRequestBody {
  products: OrderProductPayload[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  cardInfo?: {
    cardNumber: string;
    expMonth: string; // Changed to string to match input field
    expYear: string; // Changed to string to match input field
    cvv: string;
  };
  selectedPaymentId?: number;
  giftCardCode?: string;
  giftCardAmount?: number;
}
// Managed Order Listing on User Dashboard
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const { products, shippingAddress: shippingAddressData, paymentMethod, cardInfo, selectedPaymentId, giftCardCode, giftCardAmount } = req.body as CreateOrderRequestBody;

    // Check if shippingAddressData is provided
    if (!shippingAddressData) {
      res.status(400).json({ message: 'Shipping address is required' });
      return;
    }

    const shippingAddress = await Address.create({
      userId: req.user.id,
      street: shippingAddressData.street,
      city: shippingAddressData.city,
      state: shippingAddressData.state,
      zipCode: shippingAddressData.zipCode,
      country: shippingAddressData.country,
      isDefault: false
    });
    console.log(`Created shipping address with ID: ${shippingAddress.id}`);

    let totalAmount = 0;
    const orderProductsToCreate: Array<{ productId: number; quantity: number; price: number; }> = [];
    const productsToUpdateStock: Array<{ product: Product; quantity: number; }> = [];

    for (const item of products) {
      const productId = parseInt(item.productId, 10);
      if (isNaN(productId)) {
        res.status(400).json({ message: `Invalid product ID: ${item.productId}` });
        return;
      }
      
      const product = await Product.findByPk(productId);
      if (!product) {
        res.status(400).json({ message: `Product with ID ${item.productId} not found` });
        return;
      }

      if (!product.inStock || product.stockQuantity < item.quantity) {
        res.status(400).json({
          message: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
        });
        return;
      }

      const itemPrice = parseFloat(product.price.toString());
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderProductsToCreate.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice
      });
      productsToUpdateStock.push({ product, quantity: item.quantity });
    }

    let giftCardDiscount = 0;
    if (giftCardCode && giftCardAmount) {
      const sequelize = getSequelizeInstance();
      const GiftCard = sequelize.models.GiftCard;
      const giftCard = await GiftCard.findOne({
        where: { code: giftCardCode, isActive: true }
      });

      if (!giftCard) {
        res.status(400).json({ message: 'Invalid gift card code' });
        return;
      }

      if ((giftCard as any).balance < giftCardAmount) {
        res.status(400).json({ 
          message: 'Insufficient gift card balance',
          availableBalance: (giftCard as any).balance
        });
        return;
      }

      giftCardDiscount = Math.min(giftCardAmount, totalAmount);
      totalAmount -= giftCardDiscount;
    }

    const order = await Order.create({
      userId: req.user.id,
      orderDate: new Date(),
      totalAmount: totalAmount + giftCardDiscount,
      shippingAddressId: shippingAddress.id,
      paymentMethod,
      status: 'pending'
    });

    if (giftCardCode && giftCardDiscount > 0) {
      const sequelize = getSequelizeInstance();
      const GiftCard = sequelize.models.GiftCard;
      const GiftCardTransaction = sequelize.models.GiftCardTransaction;
      const giftCard = await GiftCard.findOne({
        where: { code: giftCardCode, isActive: true }
      });

      if (giftCard) {
        const newBalance = (giftCard as any).balance - giftCardDiscount;
        await giftCard.update({ balance: newBalance });

        await GiftCardTransaction.create({
          giftCardId: (giftCard as any).id,
          orderId: (order as any).id,
          amount: giftCardDiscount,
          type: 'redemption'
        });
      }
    }
    console.log(`Created order with ID: ${order.id}, total: ${totalAmount}`);
// Handle the email sending functionality for order status updates
    const bulkOrderProductsData = orderProductsToCreate.map(op => ({
      ...op,
      orderId: order.id
    }));
    await OrderProduct.bulkCreate(bulkOrderProductsData);

    for (const item of productsToUpdateStock) {
      const { product, quantity } = item;
      const newStockQuantity = product.stockQuantity - quantity;
      const newInStockStatus = newStockQuantity > 0;

      await Product.update(
        {
          stockQuantity: newStockQuantity,
          inStock: newInStockStatus
        },
        { where: { id: product.id } }
      );
    }

    const populatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderProduct,
          as: 'orderProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'description', 'images'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Address,
          as: 'shippingAddress',
        }
      ]
    });

    let cardNumber: string | undefined;
    
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      console.log('Processing card payment, cardInfo:', cardInfo);
      try {
        let dummyCardId: number;
        
        if (selectedPaymentId && cardInfo?.cvv) {
          const existingCard = await DummyCardInfo.findOne({
            where: { id: selectedPaymentId, userId: req.user.id }
          });
          
          if (!existingCard) {
            res.status(404).json({ message: 'Payment method not found' });
            return;
          }
          
          if (existingCard.cvv !== cardInfo.cvv) {
            res.status(400).json({ message: 'CVV does not match' });
            return;
          }
          
          const validation = validateCardPrefix(existingCard.cardNumber);
          if (!validation.isValid) {
            res.status(400).json({ message: 'Invalid card details. Please check your card number and try again.' });
            return;
          }
          
          dummyCardId = existingCard.id;
          cardNumber = existingCard.cardNumber;
        } else if (cardInfo) {
          console.log('Validating new card with number:', cardInfo.cardNumber);
          const validation = validateCardPrefix(cardInfo.cardNumber);
          console.log('Validation result:', validation);
          if (!validation.isValid) {
            console.log('Card validation failed, rejecting order');
            res.status(400).json({ message: 'Invalid card details. Please check your card number and try again.' });
            return;
          }
          
          const savedCard = await DummyCardInfo.create({
            userId: req.user.id,
            cardNumber: cardInfo.cardNumber,
            expMonth: parseInt(cardInfo.expMonth, 10), // Parse to number
            expYear: parseInt(cardInfo.expYear, 10),   // Parse to number
            cvv: cardInfo.cvv
          });
          dummyCardId = savedCard.id;
          cardNumber = cardInfo.cardNumber;
        } else {
          res.status(400).json({ message: 'Payment information required' });
          return;
        }

        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        await Payment.create({
          userId: req.user.id,
          dummyCardId,
          orderId: order.id,
          amountCents: Math.round(totalAmount * 100),
          currency: 'USD',
          transactionId,
          status: 'completed'
        });

        await Order.update(
          { status: 'processing' },
          { where: { id: order.id } }
        );
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        res.status(500).json({ message: 'Payment processing failed' });
        return;
      }
    }

    try {
      if (populatedOrder && (populatedOrder as any).user && (populatedOrder as any).user.email) {
        const { QueueService } = await import('../services/queueService');
        
        const jobId = await QueueService.addEmailJob({
          type: 'order-confirmation',
          orderId: populatedOrder.id,
          customerEmail: (populatedOrder as any).user.email,
          orderData: populatedOrder,
        });

        console.log(`Order confirmation email queued successfully for order ${populatedOrder.id}, job ID: ${jobId}`);
      }
    } catch (emailError) {
      console.error(`Failed to queue order confirmation email for order ${populatedOrder?.id}:`, emailError);
    }

    let bankName: string | undefined;
    if ((paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && cardNumber) {
      const bankValidation = validateCardPrefix(cardNumber); // removed '!'
      bankName = bankValidation.bankName;
    }
    
    // Ensure responseData is a plain object
    const responseData = populatedOrder?.toJSON ? populatedOrder.toJSON() : populatedOrder;
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        ...responseData,
        bankName
      }
    });
  } catch (error) {
    errorLogger.logError('Order creation failed', error as Error, req);
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { page = 1, limit = 10, status } = req.query;

    const filter: any = { userId: req.user.id };
    if (status) {
      filter.status = status;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: filter,
      include: [
        {
          model: OrderProduct,
          as: 'orderProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'description', 'images'] }]
        }
      ],
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: parsedLimit,
    });

    const totalPages = Math.ceil(count / parsedLimit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parsedLimit,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const whereClause: any = { id: id };
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderProduct,
          as: 'orderProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'description', 'images'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Address,
          as: 'shippingAddress',
        }
      ]
    });

    if (!order) {
      res.status(404).json({ message: 'Order not found or not authorized' });
      return;
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const [updatedRowsCount] = await Order.update(
      { status: status },
      { where: { id: id } }
    );

    if (updatedRowsCount === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const updatedOrder = await Order.findByPk(id, {
      include: [
        {
          model: OrderProduct,
          as: 'orderProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'description', 'images'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Address,
          as: 'shippingAddress',
        }
      ]
    });

    try {
      const sequelize = getSequelizeInstance();
      const NotificationModel = sequelize.models.Notification;
      await NotificationModel.create({
        userId: updatedOrder?.userId || req.user?.id || 0,
        type: 'order_status',
        title: 'Order Status Updated',
        message: `Your order #${id} status has been updated to ${status}`,
        relatedId: parseInt(id)
      });
    } catch (notificationError) {
      console.error('Failed to create order status notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    const { page = 1, limit = 10, status, userId } = req.query;

    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const offset = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const { count, rows: orders } = await Order.findAndCountAll({
      where: filter,
      include: [
        {
          model: OrderProduct,
          as: 'orderProducts',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'description', 'images'] }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Address,
          as: 'shippingAddress',
        }
      ],
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: parsedLimit,
    });

    const totalPages = Math.ceil(count / parsedLimit);

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parsedLimit,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
