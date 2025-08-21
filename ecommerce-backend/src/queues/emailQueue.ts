import { EmailJobData, EmailJobResult } from '../types/emailJob';
import { emailService } from '../services/emailService';

export class EmailQueue {
  async addEmailJob(emailData: EmailJobData): Promise<void> {
    try {
      console.log(`Processing email job for ${emailData.customerEmail}`);
      const result = await emailService.sendEmail(emailData);
      
      if (result.success) {
        console.log(`Email job completed successfully for ${emailData.customerEmail}`);
      } else {
        console.error(`Email job failed for ${emailData.customerEmail}:`, result.error);
      }
    } catch (error) {
      console.error(`Email job processing error for ${emailData.customerEmail}:`, error);
    }
  }

  async addOrderConfirmationJob(orderData: any): Promise<void> {
    try {
      console.log(`Processing order confirmation email for order ${orderData.orderId}`);
      const result = await emailService.sendOrderConfirmation(orderData);
      
      if (result.success) {
        console.log(`Order confirmation email sent successfully for order ${orderData.orderId}`);
      } else {
        console.error(`Order confirmation email failed for order ${orderData.orderId}:`, result.error);
      }
    } catch (error) {
      console.error(`Order confirmation email processing error for order ${orderData.orderId}:`, error);
    }
  }
}

export const emailQueue = new EmailQueue();

export const emailWorker = {
  on: (event: string, callback: Function) => {
    console.log(`Email worker event listener registered for: ${event}`);
  }
};

export const deadLetterQueue = {
  add: async (data: any) => {
    console.log('Dead letter queue - logging failed email:', data);
  }
};
