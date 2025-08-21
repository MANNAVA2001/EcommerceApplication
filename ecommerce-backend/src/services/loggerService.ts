import fs from 'fs';
import path from 'path';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  service: string;
  message: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
  };
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

export class LoggerService {
  private static writeLog(entry: LogEntry): void {
    try {
      ensureLogsDirectory();
      const logFileName = getLogFileName();
      const logFilePath = path.join(__dirname, '../../logs', logFileName);
      fs.appendFileSync(logFilePath, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  static info(service: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      service,
      message,
      data,
    };
    
    this.writeLog(entry);
    console.log(`[${service}] ${message}`, data ? JSON.stringify(data) : '');
  }

  static warn(service: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      service,
      message,
      data,
    };
    
    this.writeLog(entry);
    console.warn(`[${service}] ${message}`, data ? JSON.stringify(data) : '');
  }

  static error(service: string, message: string, error?: Error, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      service,
      message,
      data,
      error: error ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    
    this.writeLog(entry);
    console.error(`[${service}] ${message}`, error || '', data ? JSON.stringify(data) : '');
  }
}
