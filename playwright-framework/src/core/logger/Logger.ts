import winston from 'winston';

/**
 * Centralized singleton logger built on Winston.
 */
export class Logger {
  private static instance: Logger;
  private winstonLogger: winston.Logger;

  private constructor() {
    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'reports/test-execution.log' }),
      ],
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    this.winstonLogger.info(message);
  }

  warn(message: string): void {
    this.winstonLogger.warn(message);
  }

  error(message: string): void {
    this.winstonLogger.error(message);
  }

  debug(message: string): void {
    this.winstonLogger.debug(message);
  }
}
