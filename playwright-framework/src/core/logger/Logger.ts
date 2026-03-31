// EN: Import Winston logging library
import winston from 'winston';

/**
 * EN: Centralized singleton logger built on Winston.
 *     Outputs to both console and a log file.
 *     ÙŠØ®Ø±Ø¬ Ø¥Ù„Ù‰ Ø§Ù„ÙƒÙˆÙ†Ø³ÙˆÙ„ ÙˆÙ…Ù„Ù Ø³Ø¬Ù„ ÙÙŠ Ù†ÙØ³ Ø§Ù„ÙˆÙ‚Øª.
 */
export class Logger {
  // EN: Singleton instance | AR: Ø§Ù„Ù†Ø³Ø®Ø© Ø§Ù„ÙˆØ­ÙŠØ¯Ø©
  private static instance: Logger;
  // EN: The underlying Winston logger | AR: Ø§Ù„Ù€ Winston Logger Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠ
  private winstonLogger: winston.Logger;

  // EN: Private constructor - configures Winston with timestamp format and transports
  private constructor() {
    this.winstonLogger = winston.createLogger({
      // EN: Log level from environment or default to 'info'
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        // EN: Add timestamp to each log entry
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        // EN: Custom format: [timestamp] LEVEL: message
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        }),
      ),
      transports: [
        // EN: Output logs to the console
        new winston.transports.Console(),
        // EN: Also write logs to a file for later analysis
        new winston.transports.File({ filename: 'reports/test-execution.log' }),
      ],
    });
  }

  // EN: Get or create the singleton Logger instance
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // EN: Log an informational message | AR: ØªØ³Ø¬ÙŠÙ„ Ø±Ø³Ø§Ù„Ø© Ù…Ø¹Ù„ÙˆÙ…Ø§ØªÙŠØ©
  info(message: string): void {
    this.winstonLogger.info(message);
  }

  // EN: Log a warning message | AR: ØªØ³Ø¬ÙŠÙ„ Ø±Ø³Ø§Ù„Ø© ØªØ­Ø°ÙŠØ±
  warn(message: string): void {
    this.winstonLogger.warn(message);
  }

  // EN: Log an error message | AR: ØªØ³Ø¬ÙŠÙ„ Ø±Ø³Ø§Ù„Ø© Ø®Ø·Ø£
  error(message: string): void {
    this.winstonLogger.error(message);
  }

  // EN: Log a debug message (only shown when LOG_LEVEL=debug)
  debug(message: string): void {
    this.winstonLogger.debug(message);
  }
}
