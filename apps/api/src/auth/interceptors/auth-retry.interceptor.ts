import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ERROR_CODES, createSecureError } from '../../common/constants/error-codes';

@Injectable()
export class AuthRetryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuthRetryInterceptor.name);
  
  // Track authentication attempts per IP to prevent abuse
  private readonly authAttempts = new Map<string, { count: number; lastAttempt: number }>();
  
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    return next.handle().pipe(
      catchError((error) => {
        // Handle authentication errors with smart retry logic
        if (error instanceof UnauthorizedException && (error as any).errorCode) {
          return this.handleAuthError(error, request, response);
        }
        return throwError(() => error);
      }),
    );
  }

  private handleAuthError(error: any, request: any, response: any): Observable<never> {
    const clientIp = request.ip;
    const userAgent = request.headers['user-agent'];
    const isAuthRoute = request.url.includes('/auth/');
    
    // Add retry hints to response headers for frontend
    this.addRetryHeaders(error, response);
    
    // Track failed attempts for rate limiting insights
    if (isAuthRoute && error.errorCode.includes('INVALID_CREDENTIALS')) {
      this.trackFailedAttempt(clientIp);
    }
    
    // Log security events without flooding
    this.logSecurityEvent(error, clientIp, userAgent, request.url);
    
    return throwError(() => error);
  }

  private addRetryHeaders(error: any, response: any): void {
    switch (error.errorCode) {
      case 'AUTH_1004': // AUTH_TOKEN_EXPIRED
        response.header('X-Auth-Action', 'REFRESH_TOKEN');
        response.header('X-Auth-Retry-After', '0'); // Can retry immediately
        break;
        
      case 'AUTH_1010': // AUTH_REFRESH_FAILED
        response.header('X-Auth-Action', 'LOGIN_REQUIRED');
        response.header('X-Auth-Retry-After', '0');
        break;
        
      case 'AUTH_1003': // AUTH_ACCOUNT_LOCKED
        const retryAfter = error.details?.remainingMinutes * 60 || 1800; // 30 minutes default
        response.header('X-Auth-Action', 'WAIT_OR_CONTACT_SUPPORT');
        response.header('X-Auth-Retry-After', retryAfter.toString());
        break;
        
      case 'AUTH_1001': // AUTH_INVALID_CREDENTIALS
        response.header('X-Auth-Action', 'CHECK_CREDENTIALS');
        response.header('X-Auth-Retry-After', '1'); // Wait 1 second
        break;
        
      default:
        response.header('X-Auth-Action', 'LOGIN_REQUIRED');
        response.header('X-Auth-Retry-After', '0');
    }
  }

  private trackFailedAttempt(clientIp: string): void {
    const now = Date.now();
    const existing = this.authAttempts.get(clientIp);
    
    if (existing) {
      // Reset counter if more than 15 minutes have passed
      if (now - existing.lastAttempt > 900000) { // 15 minutes
        this.authAttempts.set(clientIp, { count: 1, lastAttempt: now });
      } else {
        this.authAttempts.set(clientIp, { 
          count: existing.count + 1, 
          lastAttempt: now 
        });
      }
    } else {
      this.authAttempts.set(clientIp, { count: 1, lastAttempt: now });
    }
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      this.cleanupOldAttempts();
    }
  }

  private cleanupOldAttempts(): void {
    const now = Date.now();
    const cutoff = now - 3600000; // 1 hour
    
    for (const [ip, data] of this.authAttempts.entries()) {
      if (data.lastAttempt < cutoff) {
        this.authAttempts.delete(ip);
      }
    }
  }

  private logSecurityEvent(error: any, clientIp: string, userAgent: string, url: string): void {
    const attempts = this.authAttempts.get(clientIp);
    const isHighFrequency = attempts && attempts.count > 5;
    
    if (isHighFrequency) {
      this.logger.warn(`High frequency auth failures detected`, {
        errorCode: error.errorCode,
        clientIp: clientIp.substring(0, 12) + '...',
        attempts: attempts.count,
        userAgent: userAgent?.substring(0, 50) + '...',
        url,
      });
    } else {
      this.logger.debug(`Auth error`, {
        errorCode: error.errorCode,
        url,
      });
    }
  }
}