import { Model, DataTypes, Optional } from 'sequelize';

export interface NotificationAttributes {
  id: number;
  userId: number;
  type: 'order_status' | 'gift_card_received' | 'gift_card_shared' | 'gift_registry_shared';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<NotificationAttributes, 'id' | 'isRead' | 'createdAt' | 'updatedAt'>;

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> {
  public id!: number;
  public userId!: number;
  public type!: 'order_status' | 'gift_card_received' | 'gift_card_shared' | 'gift_registry_shared';
  public title!: string;
  public message!: string;
  public isRead!: boolean;
  public relatedId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}
