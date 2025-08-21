// backend/src/models/User.ts
import { Model, DataTypes, Optional } from 'sequelize'; // Correct import for Optional
import bcrypt from 'bcryptjs';
import { Request } from 'express';

export interface UserAttributes { // <--- EXPORT THIS
  id: number;
  username?: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string; 
  role: 'admin' | 'user';
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'role' | 'createdAt' | 'updatedAt' | 'password'>; // <--- EXPORT THIS

export class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public phone?: string; 
  public role!: 'admin' | 'user';
  public resetToken?: string;
  public resetTokenExpiry?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    // Check if password exists before comparing to prevent runtime errors
    if (!this.password) {
      console.warn('Attempted to compare password for a user without a loaded password hash.');
      return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
  }

  static associate(models: any) {
    User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
  }
}

export interface AuthRequest extends Request {
  user?: User;
}
