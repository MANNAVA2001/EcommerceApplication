import { Model, DataTypes, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface GiftCardAttributes {
  id: number;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
  purchasedBy?: number;
  recipientEmail?: string;
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GiftCardCreationAttributes = Optional<GiftCardAttributes, 'id' | 'code' | 'balance' | 'isActive' | 'createdAt' | 'updatedAt'>;

export class GiftCard extends Model<GiftCardAttributes, GiftCardCreationAttributes> {
  public id!: number;
  public code!: string;
  public amount!: number;
  public balance!: number;
  public isActive!: boolean;
  public purchasedBy?: number;
  public recipientEmail?: string;
  public message?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    GiftCard.belongsTo(models.User, { foreignKey: 'purchasedBy', as: 'purchaser' });
    GiftCard.hasMany(models.GiftCardTransaction, { foreignKey: 'giftCardId', as: 'transactions' });
  }
}

export interface GiftCardTransactionAttributes {
  id: number;
  giftCardId: number;
  orderId?: number;
  amount: number;
  type: 'purchase' | 'redemption';
  createdAt?: Date;
  updatedAt?: Date;
}

export type GiftCardTransactionCreationAttributes = Optional<GiftCardTransactionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class GiftCardTransaction extends Model<GiftCardTransactionAttributes, GiftCardTransactionCreationAttributes> {
  public id!: number;
  public giftCardId!: number;
  public orderId?: number;
  public amount!: number;
  public type!: 'purchase' | 'redemption';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    GiftCardTransaction.belongsTo(models.GiftCard, { foreignKey: 'giftCardId', as: 'giftCard' });
    GiftCardTransaction.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  }
}
