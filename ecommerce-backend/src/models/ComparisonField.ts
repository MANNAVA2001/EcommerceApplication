// backend/src/models/ComparisonField.ts
import { Model, DataTypes, Optional } from 'sequelize';
import type { Category, IComparisonField } from './Category';

export interface ComparisonFieldAttributes { // <--- EXPORT THIS
  id: number;
  categoryId: number;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  options?: string; // Stored as JSON string
  unit?: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ComparisonFieldCreationAttributes = Optional< // <--- EXPORT THIS
  ComparisonFieldAttributes,
  'id' | 'required' | 'options' | 'unit' | 'displayOrder' | 'createdAt' | 'updatedAt'
>;

export class ComparisonField extends Model<ComparisonFieldAttributes, ComparisonFieldCreationAttributes> {
  public id!: number;
  public categoryId!: number;
  public name!: string;
  public type!: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  public required!: boolean;
  public options?: string[]; // Application-level type
  public unit?: string;
  public displayOrder!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static associate(models: any) {
    ComparisonField.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
  }
}