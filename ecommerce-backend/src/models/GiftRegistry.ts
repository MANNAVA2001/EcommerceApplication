import { Model, DataTypes, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export interface GiftRegistryAttributes {
  id: number;
  userId: number;
  name: string;
  description?: string;
  shareableUrl: string;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type GiftRegistryCreationAttributes = Optional<GiftRegistryAttributes, 'id' | 'shareableUrl' | 'createdAt' | 'updatedAt'>;

export class GiftRegistry extends Model<GiftRegistryAttributes, GiftRegistryCreationAttributes> {
  public id!: number;
  public userId!: number;
  public name!: string;
  public description?: string;
  public shareableUrl!: string;
  public isPublic!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    GiftRegistry.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    GiftRegistry.hasMany(models.GiftRegistryItem, { foreignKey: 'registryId', as: 'items' });
  }
}

export interface GiftRegistryItemAttributes {
  id: number;
  registryId: number;
  productId: number;
  quantity: number;
  priority: 'low' | 'medium' | 'high';
  createdAt?: Date;
  updatedAt?: Date;
}

export type GiftRegistryItemCreationAttributes = Optional<GiftRegistryItemAttributes, 'id' | 'priority' | 'createdAt' | 'updatedAt'>;

export class GiftRegistryItem extends Model<GiftRegistryItemAttributes, GiftRegistryItemCreationAttributes> {
  public id!: number;
  public registryId!: number;
  public productId!: number;
  public quantity!: number;
  public priority!: 'low' | 'medium' | 'high';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    GiftRegistryItem.belongsTo(models.GiftRegistry, { foreignKey: 'registryId', as: 'registry' });
    GiftRegistryItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  }
}
