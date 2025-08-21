import nodemailer from 'nodemailer';
import { EmailJobData, EmailJobResult } from '../types/emailJob';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}
// EmailService class to handle email sending functionality
class EmailService {
  private transporter: nodemailer.Transporter;
  private backupTransporter?: nodemailer.Transporter;

  constructor() {
    this.transporter = this.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });

    if (process.env.SMTP_HOST_BACKUP) {
      this.backupTransporter = this.createTransporter({
        host: process.env.SMTP_HOST_BACKUP,
        port: parseInt(process.env.SMTP_PORT_BACKUP || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER_BACKUP || '',
          pass: process.env.SMTP_PASS_BACKUP || '',
        },
      });
    }
  }

  private createTransporter(config: EmailConfig): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  async sendEmail(emailData: EmailJobData): Promise<EmailJobResult> {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: emailData.customerEmail,
      subject: `Order Confirmation - Order #${emailData.orderId}`,
      html: this.generateOrderConfirmationHTML(emailData.orderData),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${emailData.customerEmail}: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Primary email service failed for ${emailData.customerEmail}:`, error);
      
      if (this.backupTransporter) {
        try {
          const info = await this.backupTransporter.sendMail(mailOptions);
          console.log(`Email sent via backup service to ${emailData.customerEmail}: ${info.messageId}`);
          return {
            success: true,
            messageId: info.messageId,
            timestamp: new Date().toISOString(),
            provider: 'backup',
          };
        } catch (backupError) {
          console.error(`Backup email service also failed for ${emailData.customerEmail}:`, backupError);
        }
      }

      return {
        success: false,
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async sendOrderConfirmation(orderData: any): Promise<EmailJobResult> {
    const emailData: EmailJobData = {
      type: 'order-confirmation',
      orderId: orderData.orderId,
      customerEmail: orderData.customerEmail,
      orderData: orderData,
    };

    return this.sendEmail(emailData);
  }

  private generateOrderConfirmationHTML(orderData: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear ${orderData.customerName},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0;">
          <h3>Order #${orderData.orderId}</h3>
          <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
        </div>

        <h3>Items Ordered:</h3>
        <ul>
          ${orderData.items?.map((item: any) => `
            <li>${item.name} - Quantity: ${item.quantity} - $${item.price}</li>
          `).join('') || '<li>Order details not available</li>'}
        </ul>

        <p>We'll send you another email when your order ships.</p>
        <p>Thank you for shopping with us!</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;
  }
}

export const emailService = new EmailService();
export default emailService;
