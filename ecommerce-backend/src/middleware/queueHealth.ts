import { Request, Response, NextFunction } from 'express';
import { QueueService } from '../services/queueService';
import { LoggerService } from '../services/loggerService';

export async function queueHealthCheck(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await QueueService.getQueueStats();
    
    if (stats.failed > 100) {
      LoggerService.warn('QueueHealth', 'High number of failed jobs detected', stats);
    }
    
    if (stats.waiting > 1000) {
      LoggerService.warn('QueueHealth', 'High number of waiting jobs detected', stats);
    }
    
    next();
  } catch (error) {
    LoggerService.error('QueueHealth', 'Queue health check failed', error as Error);
    next();
  }
}
