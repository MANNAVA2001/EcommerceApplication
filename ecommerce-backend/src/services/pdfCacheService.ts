import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { LoggerService } from './loggerService';

export class PDFCacheService {
  private static cacheDir = path.join(__dirname, '../../cache/pdfs');

  static {
    this.ensureCacheDirectory();
  }

  private static ensureCacheDirectory(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private static generateCacheKey(orderData: any): string {
    const dataForHash = {
      orderId: orderData.id,
      totalAmount: orderData.totalAmount,
      orderDate: orderData.orderDate,
      products: orderData.orderProducts?.map((p: any) => ({
        id: p.product?.id,
        name: p.product?.name,
        quantity: p.quantity,
        price: p.price,
      })),
    };
    
    return crypto
      .createHash('md5')
      .update(JSON.stringify(dataForHash))
      .digest('hex');
  }

  static async get(orderData: any): Promise<Buffer | null> {
    try {
      const cacheKey = this.generateCacheKey(orderData);
      const filePath = path.join(this.cacheDir, `${cacheKey}.pdf`);
      
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (stats.mtime > oneHourAgo) {
          LoggerService.info('PDFCacheService', 'PDF cache hit', { orderId: orderData.id, cacheKey });
          return fs.readFileSync(filePath);
        } else {
          fs.unlinkSync(filePath);
          LoggerService.info('PDFCacheService', 'PDF cache expired, removed', { orderId: orderData.id, cacheKey });
        }
      }
      
      return null;
    } catch (error) {
      LoggerService.error('PDFCacheService', 'Error reading from PDF cache', error as Error, { orderId: orderData.id });
      return null;
    }
  }

  static async set(orderData: any, pdfBuffer: Buffer): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(orderData);
      const filePath = path.join(this.cacheDir, `${cacheKey}.pdf`);
      
      fs.writeFileSync(filePath, pdfBuffer);
      LoggerService.info('PDFCacheService', 'PDF cached successfully', { orderId: orderData.id, cacheKey });
    } catch (error) {
      LoggerService.error('PDFCacheService', 'Error writing to PDF cache', error as Error, { orderId: orderData.id });
    }
  }

  static async clear(): Promise<void> {
    try {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
      LoggerService.info('PDFCacheService', 'PDF cache cleared');
    } catch (error) {
      LoggerService.error('PDFCacheService', 'Error clearing PDF cache', error as Error);
    }
  }
}
