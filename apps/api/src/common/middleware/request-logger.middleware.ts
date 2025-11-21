import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    constructor(private readonly logger: CustomLoggerService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();
        const { method, originalUrl, ip } = req;
        const userAgent = req.get('user-agent') || '';
        const userId = (req as any).user?.id || (req as any).user?.sub;

        // Skip logging for health checks (too noisy)
        if (originalUrl.startsWith('/health')) {
            return next();
        }

        // Log incoming request
        this.logger.debug('Incoming request', {
            method,
            path: originalUrl,
            ip,
            userId,
            userAgent: userAgent.substring(0, 100),
        });

        // Log response when finished
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;

            // Determine log level based on status code
            if (statusCode >= 500) {
                this.logger.error('Request failed', undefined, {
                    method,
                    path: originalUrl,
                    statusCode,
                    duration: `${duration}ms`,
                    ip,
                    userId,
                });
            } else if (statusCode >= 400) {
                this.logger.warn('Request error', {
                    method,
                    path: originalUrl,
                    statusCode,
                    duration: `${duration}ms`,
                    ip,
                    userId,
                });
            } else if (duration > 1000) {
                // Log slow requests
                this.logger.performance('Slow request', duration, {
                    method,
                    path: originalUrl,
                    statusCode,
                    ip,
                    userId,
                });
            } else {
                this.logger.log('Request completed', {
                    method,
                    path: originalUrl,
                    statusCode,
                    duration: `${duration}ms`,
                    ip,
                    userId,
                });
            }
        });

        next();
    }
}
