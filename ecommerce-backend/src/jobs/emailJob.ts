import { Job } from 'bullmq';
import { EmailJobData, EmailJobResult } from '../types/emailJob';
import { EmailService } from '../utils/emailService';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { LoggerService } from '../services/loggerService';
import { EmailDeliveryStatus } from '../config/database';
import { deadLetterQueue } from '../queues/emailQueue';

export async function processEmailJob(job: Job<EmailJobData>): Promise<EmailJobResult> {
  const { orderId, customerEmail, orderData, retryCount = 0 } = job.data;
  
  LoggerService.info('EmailJob', `Processing email job for order ${orderId}`, {
    jobId: job.id,
    attempt: job.attemptsMade + 1,
    retryCount,
  });

  try {
    try {
      await EmailDeliveryStatus.update(
        { 
          attempts: job.attemptsMade + 1,
          lastAttempt: new Date(),
          status: 'pending'
        },
        { where: { jobId: job.id?.toString() || '' } }
      );
    } catch (dbError) {
      LoggerService.warn('EmailJob', 'Database unavailable for status tracking, continuing without DB tracking', {
        error: (dbError as Error).message,
      });
    }

    const emailService = new EmailService();
    let invoicePdf: Buffer | undefined;

    try {
      invoicePdf = await generateInvoicePDF(orderData);
      LoggerService.info('EmailJob', `PDF generated successfully for order ${orderId}`);
    } catch (pdfError) {
      LoggerService.warn('EmailJob', `PDF generation failed for order ${orderId}, sending email without PDF`, {
        error: (pdfError as Error).message,
      });
    }

    const { sendEmailWithFallback } = await import('../utils/emailFallback');
    const result = await sendEmailWithFallback(
      emailService,
      customerEmail,
      orderData,
      invoicePdf
    );

    try {
      await EmailDeliveryStatus.update(
        {
          status: 'sent',
          provider: result.provider,
          messageId: result.messageId,
          error: undefined,
        },
        { where: { jobId: job.id?.toString() || '' } }
      );
    } catch (dbError) {
      LoggerService.warn('EmailJob', 'Database unavailable for status tracking, email sent successfully but not tracked in DB', {
        error: (dbError as Error).message,
      });
    }

    LoggerService.info('EmailJob', `Email sent successfully for order ${orderId}`, {
      jobId: job.id,
      messageId: result.messageId,
      provider: result.provider,
    });

    return {
      success: true,
      messageId: result.messageId,
      provider: result.provider,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    const errorMessage = (error as Error).message;
    
    LoggerService.error('EmailJob', `Email job failed for order ${orderId}`, error as Error, {
      jobId: job.id,
      attempt: job.attemptsMade + 1,
    });

    try {
      await EmailDeliveryStatus.update(
        {
          status: 'failed',
          error: errorMessage,
          attempts: job.attemptsMade + 1,
          lastAttempt: new Date(),
        },
        { where: { jobId: job.id?.toString() || '' } }
      );
    } catch (dbError) {
      LoggerService.warn('EmailJob', 'Database unavailable for status tracking, continuing with retry logic', {
        error: (dbError as Error).message,
      });
    }

    if (job.attemptsMade >= 4) {
      LoggerService.error('EmailJob', `Moving job to dead letter queue after max attempts for order ${orderId}`, error as Error);
      
      await deadLetterQueue.add({
        ...job.data,
        originalJobId: job.id?.toString(),
        finalError: errorMessage,
        totalAttempts: job.attemptsMade + 1,
      });

      try {
        await EmailDeliveryStatus.update(
          { status: 'failed' },
          { where: { jobId: job.id?.toString() || '' } }
        );
      } catch (dbError) {
        LoggerService.warn('EmailJob', 'Database unavailable for final status tracking', {
          error: (dbError as Error).message,
        });
      }
    }

    throw error;
  }
}
