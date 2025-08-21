import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

interface ErrorLogEntry {
  timestamp: string;
  method: string;
  url: string;
  queryParams: any;
  requestBody: any;
  error: {
    message: string;
    stack?: string;
    status?: number;
  };
  userAgent?: string;
  ip?: string;
}

const getLogFileName = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `error-${day}-${month}-${year}.log`;
};

const ensureLogsDirectory = (): void => {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};

export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction): void => {
  try {
    ensureLogsDirectory();
    
    const logEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      queryParams: req.query,
      requestBody: req.body,
      error: {
        message: err.message,
        stack: err.stack,
        status: err.status || err.statusCode
      },
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress
    };

    const logFileName = getLogFileName();
    const logFilePath = path.join(__dirname, '../../logs', logFileName);
    
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Failed to write error log:', logError);
  }

  console.error('===================');
  console.error('Error occurred:');
  console.error('Method:', req.method);
  console.error('URL:', req.url);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===================');

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      path: req.path,
      method: req.method
    }
  });
};
