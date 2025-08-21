import fs from 'fs';
import path from 'path';

interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  url?: string;
  method?: string;
  queryParams?: any;
  requestBody?: any;
  userId?: string;
  stack?: string;
}

class ErrorLogger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(): string {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `error-${day}-${month}-${year}.log`;
  }

  public log(entry: ErrorLogEntry): void {
    const logEntry = {
      ...entry,
      timestamp: new Date().toISOString()
    };

    const logFile = path.join(this.logDir, this.getLogFileName());
    const logLine = JSON.stringify(logEntry) + '\n';

    fs.appendFileSync(logFile, logLine);
  }

  public logError(message: string, error: Error, req?: any): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      url: req?.originalUrl,
      method: req?.method,
      queryParams: req?.query,
      requestBody: req?.body,
      userId: req?.user?.id,
      stack: error.stack
    });
  }
}

export const errorLogger = new ErrorLogger();
