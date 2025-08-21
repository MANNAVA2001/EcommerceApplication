import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
//import connectDatabase from './config/database';
import { connectDatabase } from './config/database';

import { errorLogger, notFoundHandler } from './middleware/errorLogger';

import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import addressRoutes from './routes/addresses';
import paymentMethodRoutes from './routes/paymentMethods';
import queueRoutes from './routes/queue';
// import brandRoutes from './routes/brandRoutes';
import { createSingleAdmin } from './controllers/adminController';
import userCheckoutRoutes from './routes/userCheckout';
import giftRegistryRoutes from './routes/giftRegistries';
import giftCardRoutes from './routes/giftCards';
import notificationRoutes from './routes/notifications';
import * as path from 'path';


//dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

app.set('trust proxy', true);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080']),
  credentials: true,
}));

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/user', userCheckoutRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/gift-registries', giftRegistryRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/brands', brandRoutes);

app.post('/api/create-admin', createSingleAdmin);

app.get('/api/health', async (req, res) => {
  try {
    const { QueueService } = await import('./services/queueService');
    const queueStats = await QueueService.getQueueStats();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      queue: queueStats
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Queue health check failed'
    });
  }
});

app.use(notFoundHandler);
app.use(errorLogger);

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    
    const { emailWorker } = await import('./queues/emailQueue');
    console.log('Email queue worker started');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully');
      const { QueueService } = await import('./services/queueService');
      await QueueService.shutdown();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT received, shutting down gracefully');
      const { QueueService } = await import('./services/queueService');
      await QueueService.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
