
import { Model, DataTypes, Optional } from 'sequelize';
import type { User } from './User';
import type { Order } from './Order';

export interface DummyCardInfoAttributes {
  id: number;
  userId: number;
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvv: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DummyCardInfoCreationAttributes = Optional<DummyCardInfoAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class DummyCardInfo extends Model<DummyCardInfoAttributes, DummyCardInfoCreationAttributes> {
  public id!: number;
  public userId!: number;
  public cardNumber!: string;
  public expMonth!: number;
  public expYear!: number;
  public cvv!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    DummyCardInfo.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

export interface PaymentAttributes {
  id: number;
  userId: number;
  dummyCardId: number;
  orderId: number;
  amountCents: number;
  currency: string;
  transactionId: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PaymentCreationAttributes = Optional<PaymentAttributes, 'id' | 'currency' | 'createdAt' | 'updatedAt'>;

export class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> {
  public id!: number;
  public userId!: number;
  public dummyCardId!: number;
  public orderId!: number;
  public amountCents!: number;
  public currency!: string;
  public transactionId!: string;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Payment.belongsTo(models.DummyCardInfo, { foreignKey: 'dummyCardId', as: 'dummyCard' });
    Payment.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  }
}
