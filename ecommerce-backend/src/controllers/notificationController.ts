import { Request, Response } from 'express';
import { getSequelizeInstance } from '../config/database';
import { AuthRequest } from '../models/User';

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const Notification = sequelize.models.Notification;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const filter: any = { userId: req.user.id };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const offset = (Number(page) - 1) * Number(limit);
    const parsedLimit = Number(limit);

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: filter,
      order: [['createdAt', 'DESC']],
      offset: offset,
      limit: parsedLimit,
    });

    const totalPages = Math.ceil(count / parsedLimit);

    res.json({
      success: true,
      data: notifications,
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
    console.error('Get user notifications error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const Notification = sequelize.models.Notification;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found or not authorized' });
      return;
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const Notification = sequelize.models.Notification;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const getUnreadNotificationCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const Notification = sequelize.models.Notification;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const count = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread notification count error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sequelize = getSequelizeInstance();
    const Notification = sequelize.models.Notification;
    
    if (!req.user || !req.user.id) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.user.id }
    });

    if (!notification) {
      res.status(404).json({ message: 'Notification not found or not authorized' });
      return;
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
  }
};
