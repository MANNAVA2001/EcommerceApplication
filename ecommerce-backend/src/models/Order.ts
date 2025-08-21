// backend/src/models/Order.ts

import { Model, DataTypes, Optional } from 'sequelize'; // <--- UPDATED: Optional imported as a type
import type { User } from './User';
import type { Product } from './Product';

export interface AddressAttributes {
  id: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AddressCreationAttributes = Optional<AddressAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Address extends Model<AddressAttributes, AddressCreationAttributes> {
  public id!: number;
  public userId!: number;
  public street!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public country!: string;
  public isDefault!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Address.hasMany(models.Order, { foreignKey: 'shippingAddressId', as: 'orders' });
    Address.belongsTo(models.User, { foreignKey: 'userId', as: 'user' }); 
  }
}

export interface OrderProductAttributes {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderProductCreationAttributes = Optional<OrderProductAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class OrderProduct extends Model<OrderProductAttributes, OrderProductCreationAttributes> { // <--- ENSURE 'export' IS HERE
  public id!: number;
  public orderId!: number;
  public productId!: number;
  public quantity!: number;
  public price!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    OrderProduct.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
    OrderProduct.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  }
}

export interface OrderAttributes {
  id: number;
  userId: number;
  orderDate: Date; 
  shippingAddressId: number;
  totalAmount: number;
  status: 'pending' | 'confirmation' | 'processing' | 'shipped' | 'delivery' | 'delivered' | 'cancelled';
  paymentMethod: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderCreationAttributes = Optional<OrderAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export class Order extends Model<OrderAttributes, OrderCreationAttributes> {
  static id(id: any, arg1: { include: ({ model: typeof OrderProduct; as: string; include: { model: typeof Product; as: string; attributes: string[]; }[]; } | { model: typeof User; as: string; attributes: string[]; } | { model: typeof Address; as: string; })[]; }) {
    throw new Error('Method not implemented.');
  }
  public id!: number;
  public userId!: number;
  public orderDate!: Date;
  public shippingAddressId!: number;
  public totalAmount!: number;
  public status!: 'pending' | 'confirmation' | 'processing' | 'shipped' | 'delivery' | 'delivered' | 'cancelled';
  public paymentMethod!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getUser!: () => Promise<User>;
  public getShippingAddress!: () => Promise<Address>;
  public getOrderProducts!: () => Promise<OrderProduct[]>;
  user: any;

  static associate(models: any) {
    Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Order.belongsTo(models.Address, { foreignKey: 'shippingAddressId', as: 'shippingAddress' });
    Order.hasMany(models.OrderProduct, { foreignKey: 'orderId', as: 'orderProducts', onDelete: 'CASCADE' });
  }
}

export interface IOrderProduct {
  productId: number;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}
