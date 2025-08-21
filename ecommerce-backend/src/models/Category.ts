// backend/src/models/Category.ts
import { Model, Optional, DataTypes } from 'sequelize';
import type { Product } from './Product';
import type { ComparisonField as ComparisonFieldModel } from './ComparisonField';
//import { IComparisonField } from '../models/Category';

export interface IComparisonField {
  name: string;
  type: "number" |"String"| "boolean" | "text" | "select" | "multiselect"; // This is the crucial part
  required: boolean;
  displayOrder: number;
}

export interface CategoryAttributes { // <--- EXPORT THIS
  id: number;
  name: string;
  description: string;
  comparisonFields: string; // Stored as string in DB
  createdAt?: Date;
  updatedAt?: Date;
}

export type CategoryCreationAttributes = Optional<CategoryAttributes, 'id' | 'createdAt' | 'updatedAt'>; // <--- EXPORT THIS

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> {
  public id!: number;
  public name!: string;
  public description!: string;
  public comparisonFields!: string; // <--- Application-level type is IComparisonField[]
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    Category.hasMany(models.Product, { foreignKey: 'categoryId', as: 'products' });
    Category.hasMany(models.ComparisonField, { foreignKey: 'categoryId', as: 'comparisonFieldsData' });
  }
}