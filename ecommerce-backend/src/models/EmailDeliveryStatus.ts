import { DataTypes, Model, Optional } from 'sequelize';

export interface EmailDeliveryStatusAttributes {
  id: number;
  orderId: number;
  jobId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  provider?: string;
  messageId?: string;
  error?: string;
  attempts: number;
  lastAttempt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailDeliveryStatusCreationAttributes 
  extends Optional<EmailDeliveryStatusAttributes, 'id' | 'createdAt' | 'updatedAt' | 'provider' | 'messageId' | 'error'> {}

export class EmailDeliveryStatus extends Model<EmailDeliveryStatusAttributes, EmailDeliveryStatusCreationAttributes>
  implements EmailDeliveryStatusAttributes {
  public id!: number;
  public orderId!: number;
  public jobId!: string;
  public status!: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  public provider?: string;
  public messageId?: string;
  public error?: string;
  public attempts!: number;
  public lastAttempt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
