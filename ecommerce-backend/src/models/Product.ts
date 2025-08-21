// backend/src/models/Product.ts
import { Model, DataTypes, Optional } from 'sequelize';
import type { Category } from './Category';
import type { OrderProduct } from './Order';

export interface ProductAttributes { // <--- EXPORT THIS
  id: number;
  name: string;
  description?: string;
  price: number;
  categoryId: number;
  features: string; // Stored as string in DB
  images: string;   // Stored as string in DB
  stockQuantity: number;
  inStock: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductCreationAttributes = Optional<ProductAttributes, 'id' | 'description' | 'features' | 'images' | 'stockQuantity' | 'inStock' | 'createdAt' | 'updatedAt'>; // <--- EXPORT THIS

export class Product extends Model<ProductAttributes, ProductCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public price!: number;
  public categoryId!: number;
  public features!: { [key: string]: any }; // <--- Application-level type is object
  public images!: string[]; // <--- Application-level type is string[]
  public stockQuantity!: number;
  public inStock!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // The getters/setters in database.ts handle the JSON parsing/stringifying
  // These helper methods might not be strictly necessary if you always access via model instance,
  // but they don't hurt if you prefer explicit access.
  // Make sure not to call them like this.getDataValue('features') directly inside the model,
  // the Sequelize getter will handle it.
  // public getImagesArray(): string[] {
  //     return this.getDataValue('images'); // This would return the stringified version if called here
  // }
  // public getFeaturesObject(): object {
  //     return this.getDataValue('features'); // This would return the stringified version if called here
  // }

  static associate(models: any) {
    Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    Product.hasMany(models.OrderProduct, { foreignKey: 'productId', as: 'orderProducts' });
  }
}