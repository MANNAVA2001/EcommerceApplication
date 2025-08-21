export interface EmailJobData {
  type: 'order-confirmation';
  orderId: number;
  customerEmail: string;
  orderData: any;
  retryCount?: number;
  originalJobId?: string;
  finalError?: string;
  totalAttempts?: number;
}

export interface EmailJobResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  timestamp: string;
}

export interface EmailDeliveryStatus {
  id?: number;
  orderId: number;
  jobId: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  provider?: string;
  messageId?: string;
  error?: string;
  attempts: number;
  lastAttempt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
