import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

interface LogContext {
  userId?: string;
  requestId?: string;
  ip?: string;
  method?: string;
  path?: string;
  duration?: string;
  statusCode?: number;
  [key: string]: any;
}

/**
 * Custom Logger Service - Production Ready
 * 
 * Features:
 * - Structured JSON logging in production
 * - Human-readable logging in development
 * - Context support (userId, requestId, etc.)
 * - Performance tracking
 * - Error stack traces
 */
@Injectable()
export class CustomLoggerService implements LoggerService {
  private readonly isProduction = process.env.NODE_ENV === 'production';
  private readonly isDevelopment = process.env.NODE_ENV === 'development';

  log(message: string, context?: LogContext) {
    this.printMessage('info', message, context);
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.printMessage('error', message, { ...context, trace });
  }

  warn(message: string, context?: LogContext) {
    this.printMessage('warn', message, context);
  }

  debug(message: string, context?: LogContext) {
    if (!this.isProduction) {
      this.printMessage('debug', message, context);
    }
  }

  verbose(message: string, context?: LogContext) {
    if (!this.isProduction) {
      this.printMessage('verbose', message, context);
    }
  }

  private printMessage(level: string, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    
    if (this.isProduction) {
      // JSON estructurado para producción (fácil de parsear)
      console.log(JSON.stringify({
        timestamp,
        level,
        message,
        environment: 'production',
        ...context,
      }));
    } else {
      // Formato legible para desarrollo
      const emoji = this.getEmoji(level);
      const contextStr = context ? ` ${JSON.stringify(context, null, 2)}` : '';
      console.log(`${emoji} [${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`);
    }
  }

  private getEmoji(level: string): string {
    const emojis = {
      info: '📘',
      error: '❌',
      warn: '⚠️',
      debug: '🔍',
      verbose: '💬',
    };
    return emojis[level] || '📝';
  }

  /**
   * Log security events (authentication, authorization, etc.)
   */
  security(message: string, context?: LogContext) {
    this.printMessage('info', `🔒 SECURITY: ${message}`, {
      ...context,
      category: 'security',
    });
  }

  /**
   * Log performance metrics
   */
  performance(message: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? 'warn' : 'info';
    this.printMessage(level, `⚡ PERFORMANCE: ${message}`, {
      ...context,
      duration: `${duration}ms`,
      category: 'performance',
    });
  }
}
