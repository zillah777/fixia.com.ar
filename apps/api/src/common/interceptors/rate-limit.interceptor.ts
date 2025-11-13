import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Global rate limiter interceptor for POST/PUT/DELETE endpoints
 * Prevents abuse by limiting requests per IP address per minute
 *
 * Limits:
 * - Public endpoints: 10 requests/minute
 * - Authenticated endpoints: 30 requests/minute
 * - Admin endpoints: 100 requests/minute
 */
@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RateLimitInterceptor.name);

  // Store request counts: IP -> { count, reset_time }
  private requestCounts = new Map<
    string,
    { count: number; resetTime: number }
  >();

  // Clear old entries every 5 minutes
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [ip, data] of this.requestCounts.entries()) {
        if (data.resetTime < now) {
          this.requestCounts.delete(ip);
        }
      }
    }, 5 * 60 * 1000);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only apply rate limiting to mutation methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const ip = this.getClientIp(request);
    const user = request.user as any;
    const isAdmin = user?.user_type === 'admin';

    // Determine rate limit based on authentication and role
    let limit: number;
    let windowMs: number = 60 * 1000; // 1 minute window

    if (isAdmin) {
      limit = 100; // Admin: 100 requests/minute
    } else if (user?.id) {
      limit = 30; // Authenticated: 30 requests/minute
    } else {
      limit = 10; // Public: 10 requests/minute
    }

    // Check rate limit
    const now = Date.now();
    const data = this.requestCounts.get(ip);

    if (data && data.resetTime > now) {
      // Window still active
      data.count++;

      if (data.count > limit) {
        const remainingSeconds = Math.ceil((data.resetTime - now) / 1000);

        this.logger.warn(
          `Rate limit exceeded for IP: ${ip}, limit: ${limit}/min, remaining: ${remainingSeconds}s`
        );

        throw new HttpException(
          `Rate limit exceeded. Maximum ${limit} requests per minute. Try again in ${remainingSeconds} seconds.`,
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    } else {
      // New window
      const resetTime = now + windowMs;
      this.requestCounts.set(ip, { count: 1, resetTime });
    }

    return next.handle();
  }

  /**
   * Extract client IP from request
   * Considers X-Forwarded-For header for proxied requests
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  /**
   * Cleanup on application shutdown
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
