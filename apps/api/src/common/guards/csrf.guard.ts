import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as crypto from 'crypto';

export const CSRF_EXEMPT_KEY = 'csrf_exempt';
export const CsrfExempt = () => Reflector.createDecorator();

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Check if route is exempt from CSRF protection
    const isExempt = this.reflector.getAllAndOverride<boolean>(CSRF_EXEMPT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isExempt) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Only check CSRF for state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      // Generate and set CSRF token for safe methods
      this.generateCsrfToken(request, response);
      return true;
    }

    // Validate CSRF token for unsafe methods
    return this.validateCsrfToken(request);
  }

  private generateCsrfToken(request: any, response: any): void {
    if (!request.session) {
      request.session = {};
    }

    if (!request.session.csrfToken) {
      request.session.csrfToken = crypto.randomBytes(32).toString('hex');

      // Set CSRF token in cookie for frontend access
      response.cookie('csrf-token', request.session.csrfToken, {
        httpOnly: false, // Frontend needs to read this
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // SECURITY: Changed from 'lax' to 'strict' for better protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      this.logger.debug(`✅ Generated CSRF token: ${request.session.csrfToken.substring(0, 8)}...`);
    }
  }

  private validateCsrfToken(request: any): boolean {
    const sessionToken = request.session?.csrfToken;
    const headerToken = request.headers['x-csrf-token'] ||
      request.headers['x-xsrf-token'] ||
      request.body?._csrf;

    if (!sessionToken) {
      this.logger.warn('🚨 CSRF validation failed: No session token', {
        ip: request.ip || request.connection?.remoteAddress,
        path: request.url,
        method: request.method,
        userAgent: request.headers['user-agent']?.substring(0, 50),
      });
      throw new BadRequestException('CSRF token required');
    }

    if (!headerToken) {
      this.logger.warn('🚨 CSRF validation failed: No header token provided', {
        ip: request.ip || request.connection?.remoteAddress,
        path: request.url,
        method: request.method,
        userAgent: request.headers['user-agent']?.substring(0, 50),
      });
      throw new BadRequestException('CSRF token missing in request');
    }

    if (!this.constantTimeCompare(sessionToken, headerToken)) {
      this.logger.warn('🚨 CSRF validation failed: Token mismatch', {
        ip: request.ip || request.connection?.remoteAddress,
        path: request.url,
        method: request.method,
        userAgent: request.headers['user-agent']?.substring(0, 50),
      });
      throw new BadRequestException('CSRF token invalid');
    }

    this.logger.debug('✅ CSRF token validated successfully', {
      path: request.url,
      method: request.method,
    });
    return true;
  }

  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}