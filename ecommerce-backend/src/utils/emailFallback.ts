import { LoggerService } from '../services/loggerService';
import { generateOrderConfirmationHTML } from './htmlEmailFallback';

export async function sendEmailWithFallback(
  emailService: any,
  customerEmail: string,
  orderData: any,
  invoicePdf?: Buffer
): Promise<{ messageId: string; provider: string }> {
  try {
    return await emailService.sendOrderConfirmationWithInvoice(
      customerEmail,
      orderData,
      invoicePdf
    );
  } catch (error) {
    LoggerService.warn('EmailFallback', 'Primary email sending failed, trying HTML fallback', {
      error: (error as Error).message,
      orderId: orderData.id,
    });

    const htmlContent = generateOrderConfirmationHTML(orderData);
    
    return await emailService.sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderData.id}`,
      html: htmlContent,
    });
  }
}
