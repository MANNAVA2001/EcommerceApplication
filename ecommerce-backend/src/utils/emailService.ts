import nodemailer from 'nodemailer';
import { LoggerService } from '../services/loggerService';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

interface SMTPConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  name: string;
}

class EmailService {
  static sendOrderConfirmationEmail(email: any, arg1: any) {
    throw new Error('Method not implemented.');
  }
  private primaryTransporter: nodemailer.Transporter;
  private backupTransporter?: nodemailer.Transporter;
  private circuitBreaker: {
    failures: number;
    lastFailure: Date | null;
    isOpen: boolean;
  };

  constructor() {
    this.circuitBreaker = {
      failures: 0,
      lastFailure: null,
      isOpen: false,
    };

    const primaryConfig: SMTPConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
      name: 'primary',
    };

    this.primaryTransporter = this.createTransporter(primaryConfig);

    if (process.env.SMTP_HOST_BACKUP && process.env.SMTP_USER_BACKUP) {
      const backupConfig: SMTPConfig = {
        host: process.env.SMTP_HOST_BACKUP,
        port: parseInt(process.env.SMTP_PORT_BACKUP || '587'),
        user: process.env.SMTP_USER_BACKUP,
        pass: process.env.SMTP_PASS_BACKUP || '',
        name: 'backup',
      };
      this.backupTransporter = this.createTransporter(backupConfig);
    }
  }

  private createTransporter(config: SMTPConfig): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }

  private checkCircuitBreaker(): boolean {
    if (!this.circuitBreaker.isOpen) return false;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (this.circuitBreaker.lastFailure && this.circuitBreaker.lastFailure < fiveMinutesAgo) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
      LoggerService.info('EmailService', 'Circuit breaker reset');
      return false;
    }

    return true;
  }

  private recordFailure(): void {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = new Date();

    if (this.circuitBreaker.failures >= 10) {
      this.circuitBreaker.isOpen = true;
      LoggerService.warn('EmailService', 'Circuit breaker opened due to consecutive failures', {
        failures: this.circuitBreaker.failures,
      });
    }
  }

  private recordSuccess(): void {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailure = null;
  }

  async sendEmail(options: EmailOptions): Promise<{ messageId: string; provider: string }> {
    if (this.checkCircuitBreaker()) {
      throw new Error('Email service circuit breaker is open');
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    let lastError: Error | null = null;

    try {
      const result = await this.primaryTransporter.sendMail(mailOptions);
      this.recordSuccess();
      LoggerService.info('EmailService', 'Email sent successfully via primary provider', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      });
      return { messageId: result.messageId, provider: 'primary' };
    } catch (error) {
      lastError = error as Error;
      this.recordFailure();
      LoggerService.warn('EmailService', 'Primary email provider failed', { error: lastError.message });

      if (this.backupTransporter) {
        try {
          const result = await this.backupTransporter.sendMail(mailOptions);
          LoggerService.info('EmailService', 'Email sent successfully via backup provider', {
            to: options.to,
            subject: options.subject,
            messageId: result.messageId,
          });
          return { messageId: result.messageId, provider: 'backup' };
        } catch (backupError) {
          LoggerService.error('EmailService', 'Backup email provider also failed', backupError as Error);
          lastError = backupError as Error;
        }
      }
    }

    throw lastError || new Error('All email providers failed');
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<{ messageId: string; provider: string }> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const emailOptions: EmailOptions = {
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You have requested to reset your password. Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
      `,
    };

    return await this.sendEmail(emailOptions);
  }

  async sendOrderConfirmationWithInvoice(
    customerEmail: string,
    orderData: any,
    invoicePdf?: Buffer
  ): Promise<{ messageId: string; provider: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Order Confirmation</h2>
        <p>Dear ${orderData.user?.firstName || 'Customer'},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderData.id}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
          <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Shipping Address</h3>
          <p>
            ${orderData.shippingAddress?.street}<br>
            ${orderData.shippingAddress?.city}, ${orderData.shippingAddress?.state} ${orderData.shippingAddress?.zipCode}<br>
            ${orderData.shippingAddress?.country}
          </p>
        </div>

        <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">Order Items</h3>
          ${orderData.orderProducts?.map((item: any) => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <strong>${item.product?.name || 'Product'}</strong><br>
              <small style="color: #666;">${item.product?.description || ''}</small><br>
              Quantity: ${item.quantity} × $${item.price} = $${(item.quantity * item.price).toFixed(2)}
            </div>
          `).join('') || ''}
        </div>

        ${invoicePdf ? '<p>Please find your detailed invoice attached to this email.</p>' : '<p>Your detailed invoice will be sent separately once processing is complete.</p>'}
        <p>If you have any questions about your order, please don\'t hesitate to contact us.</p>
        
        <p>Best regards,<br>The E-commerce Team</p>
      </div>
    `;

    const emailOptions: EmailOptions = {
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderData.id}`,
      html,
    };

    if (invoicePdf) {
      emailOptions.attachments = [
        {
          filename: `invoice-${orderData.id}.pdf`,
          content: invoicePdf,
          contentType: 'application/pdf',
        },
      ];
    }

    return await this.sendEmail(emailOptions);
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<{ messageId: string; provider: string }> {
    const emailOptions: EmailOptions = {
      to: email,
      subject: 'Welcome to E-Commerce Store!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to E-Commerce Store!</h2>
          <p>Dear ${firstName},</p>
          <p>Thank you for registering with E-Commerce Store! We're excited to have you as part of our community.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0;">What's Next?</h3>
            <ul>
              <li>Browse our extensive product catalog</li>
              <li>Compare prices with external retailers</li>
              <li>Enjoy secure checkout and fast shipping</li>
              <li>Track your orders in real-time</li>
            </ul>
          </div>

          <p>If you have any questions, please don't hesitate to contact our support team.</p>
          
          <p>Happy shopping!<br>The E-Commerce Team</p>
        </div>
      `,
    };

    return await this.sendEmail(emailOptions);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.primaryTransporter.verify();
      LoggerService.info('EmailService', 'Primary email provider connection verified');
      
      if (this.backupTransporter) {
        try {
          await this.backupTransporter.verify();
          LoggerService.info('EmailService', 'Backup email provider connection verified');
        } catch (error) {
          LoggerService.warn('EmailService', 'Backup email provider connection failed', { error: (error as Error).message });
        }
      }
      
      return true;
    } catch (error) {
      LoggerService.error('EmailService', 'Primary email provider connection failed', error as Error);
      return false;
    }
  }
}

export { EmailService };
export const emailService = new EmailService();
