/**
 * Production-Safe Logger Utility
 * 
 * Provides logging methods that respect environment:
 * - Development: Full console output
 * - Production: Only errors and warnings
 * 
 * Usage:
 * ```typescript
 * import { logger } from '@/utils/logger';
 * 
 * logger.debug('User logged in', { userId: '123' });
 * logger.info('Payment processed');
 * logger.warn('Slow API response', { duration: 2000 });
 * logger.error('API call failed', error);
 * ```
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

class Logger {
    /**
     * Debug logs - Only in development
     * Use for detailed debugging information
     */
    debug(...args: any[]): void {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args);
        }
    }

    /**
     * Info logs - Only in development
     * Use for general information
     */
    info(...args: any[]): void {
        if (isDevelopment) {
            console.log('[INFO]', ...args);
        }
    }

    /**
     * Warning logs - Always logged
     * Use for potential issues that don't break functionality
     */
    warn(...args: any[]): void {
        console.warn('[WARN]', ...args);
    }

    /**
     * Error logs - Always logged
     * Use for errors and exceptions
     */
    error(...args: any[]): void {
        console.error('[ERROR]', ...args);
    }

    /**
     * Success logs - Only in development
     * Use for successful operations
     */
    success(...args: any[]): void {
        if (isDevelopment) {
            console.log('✅', ...args);
        }
    }

    /**
     * Group logs - Only in development
     * Use for grouping related logs
     */
    group(label: string, callback: () => void): void {
        if (isDevelopment) {
            console.group(label);
            callback();
            console.groupEnd();
        }
    }

    /**
     * Table logs - Only in development
     * Use for displaying tabular data
     */
    table(data: any): void {
        if (isDevelopment) {
            console.table(data);
        }
    }

    /**
     * Time measurement - Only in development
     * Use for performance tracking
     */
    time(label: string): void {
        if (isDevelopment) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (isDevelopment) {
            console.timeEnd(label);
        }
    }
}

export const logger = new Logger();

// Export environment flags for conditional logic
export { isDevelopment, isProduction };
