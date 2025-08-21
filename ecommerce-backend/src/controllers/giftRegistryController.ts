import { Request, Response } from 'express';
import { Product, User, getSequelizeInstance } from '../config/database';
import { AuthRequest } from '../models/User';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

export const createGiftRegistry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftRegistry = sequelize.models.GiftRegistry;
    const GiftRegistryItem = sequelize.models.GiftRegistryItem;
    
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

    const { name, description, isPublic = true, items = [] } = req.body;

    const shareableUrl = uuidv4();

    const registry = await GiftRegistry.create({
      userId: req.user.id,
      name,
      description,
      shareableUrl,
      isPublic
    });

    if (items.length > 0) {
      const registryItems = items.map((item: any) => ({
        registryId: (registry as any).id,
        productId: item.productId,
        quantity: item.quantity || 1,
        priority: item.priority || 'medium'
      }));

      await GiftRegistryItem.bulkCreate(registryItems);
    }

    const populatedRegistry = await GiftRegistry.findByPk((registry as any).id, {
      include: [
        {
          model: GiftRegistryItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Gift registry created successfully',
      data: populatedRegistry
    });
  } catch (error) {
    console.error('Create gift registry error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getUserGiftRegistries = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftRegistry = sequelize.models.GiftRegistry;
    const GiftRegistryItem = sequelize.models.GiftRegistryItem;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const registries = await GiftRegistry.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: GiftRegistryItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: registries
    });
  } catch (error) {
    console.error('Get user gift registries error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getGiftRegistryByUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftRegistry = sequelize.models.GiftRegistry;
    const GiftRegistryItem = sequelize.models.GiftRegistryItem;
    
    const { shareableUrl } = req.params;

    const registry = await GiftRegistry.findOne({
      where: { shareableUrl, isPublic: true },
      include: [
        {
          model: GiftRegistryItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!registry) {
      res.status(404).json({ message: 'Gift registry not found or not public' });
      return;
    }

    res.json({
      success: true,
      data: registry
    });
  } catch (error) {
    console.error('Get gift registry by URL error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const updateGiftRegistry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftRegistry = sequelize.models.GiftRegistry;
    const GiftRegistryItem = sequelize.models.GiftRegistryItem;
    
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
    const { name, description, isPublic, items } = req.body;

    const registry = await GiftRegistry.findOne({
      where: { id, userId: req.user.id }
    });

    if (!registry) {
      res.status(404).json({ message: 'Gift registry not found or not authorized' });
      return;
    }

    await registry.update({
      name: name || (registry as any).name,
      description: description !== undefined ? description : (registry as any).description,
      isPublic: isPublic !== undefined ? isPublic : (registry as any).isPublic
    });

    if (items) {
      await GiftRegistryItem.destroy({ where: { registryId: (registry as any).id } });
      
      if (items.length > 0) {
        const registryItems = items.map((item: any) => ({
          registryId: (registry as any).id,
          productId: item.productId,
          quantity: item.quantity || 1,
          priority: item.priority || 'medium'
        }));

        await GiftRegistryItem.bulkCreate(registryItems);
      }
    }

    const updatedRegistry = await GiftRegistry.findByPk((registry as any).id, {
      include: [
        {
          model: GiftRegistryItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Gift registry updated successfully',
      data: updatedRegistry
    });
  } catch (error) {
    console.error('Update gift registry error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const deleteGiftRegistry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftRegistry = sequelize.models.GiftRegistry;
    const GiftRegistryItem = sequelize.models.GiftRegistryItem;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const registry = await GiftRegistry.findOne({
      where: { id, userId: req.user.id }
    });

    if (!registry) {
      res.status(404).json({ message: 'Gift registry not found or not authorized' });
      return;
    }

    await GiftRegistryItem.destroy({ where: { registryId: (registry as any).id } });
    await registry.destroy();

    res.json({
      success: true,
      message: 'Gift registry deleted successfully'
    });
  } catch (error) {
    console.error('Delete gift registry error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const shareGiftRegistry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const GiftRegistry = sequelize.models.GiftRegistry;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const { recipientEmails, message } = req.body;

    const registry = await GiftRegistry.findOne({
      where: { id, userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ]
    });

    if (!registry) {
      res.status(404).json({ message: 'Gift registry not found or not authorized' });
      return;
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/gift-registries/${(registry as any).shareableUrl}`;

    for (const email of recipientEmails) {
      try {
        console.log(`Sending gift registry share email to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send gift registry share email to ${email}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: 'Gift registry shared successfully',
      shareUrl
    });
  } catch (error) {
    console.error('Share gift registry error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
