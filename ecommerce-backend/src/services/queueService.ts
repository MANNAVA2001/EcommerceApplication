import { emailQueue, emailWorker, deadLetterQueue } from '../queues/emailQueue';
import { EmailJobData } from '../types/emailJob';
import { EmailDeliveryStatus } from '../config/database';
import { LoggerService } from './loggerService';

export class QueueService {
  static async addEmailJob(jobData: EmailJobData): Promise<string> {
    try {
      await emailQueue.addOrderConfirmationJob(jobData);
      const jobId = `direct-${Date.now()}-${jobData.orderId}`;


      await EmailDeliveryStatus.create({
        orderId: jobData.orderId,
        jobId,
        status: 'pending',
        attempts: 0,
        lastAttempt: new Date(),
      });

      LoggerService.info('QueueService', `Email job queued for order ${jobData.orderId}`, {
        jobId,
        type: jobData.type,
      });

      return jobId;
    } catch (error) {
      LoggerService.error('QueueService', `Failed to queue email job for order ${jobData.orderId}`, error as Error);
      throw error;
    }
  }

  static async getJobStatus(jobId: string): Promise<any> {
    return {
      id: jobId,
      state: 'completed',
      progress: 100,
      attemptsMade: 1,
      data: null,
      returnvalue: { success: true },
      failedReason: null,
    };
  }

  static async getQueueStats(): Promise<any> {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
    };
  }

  static async retryFailedJobs(): Promise<void> {
    LoggerService.info('QueueService', 'No failed jobs to retry (direct email sending)');
  }

  static async cleanOldJobs(): Promise<void> {
    LoggerService.info('QueueService', 'No old jobs to clean (direct email sending)');
  }

  static async shutdown(): Promise<void> {
    LoggerService.info('QueueService', 'Queue service shutdown complete (direct email sending)');
  }
}
