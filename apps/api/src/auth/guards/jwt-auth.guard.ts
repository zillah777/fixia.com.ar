import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES, createSecureError } from '../../common/constants/error-codes';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // If there's an error from the JWT strategy, handle it gracefully
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      
      // Check if token is missing entirely
      const authHeader = request.headers.authorization;
      const cookieToken = request.cookies?.access_token;
      
      if (!authHeader && !cookieToken) {
        throw createSecureError(ERROR_CODES.AUTH_TOKEN_MISSING, UnauthorizedException);
      }
      
      // If we have JWT info error, use specific error codes
      if (info) {
        switch (info.name) {
          case 'TokenExpiredError':
            throw createSecureError(ERROR_CODES.AUTH_TOKEN_EXPIRED, UnauthorizedException);
          case 'JsonWebTokenError':
            throw createSecureError(ERROR_CODES.AUTH_TOKEN_INVALID, UnauthorizedException);
          case 'NotBeforeError':
            throw createSecureError(ERROR_CODES.AUTH_TOKEN_INVALID, UnauthorizedException);
          default:
            throw createSecureError(ERROR_CODES.AUTH_TOKEN_INVALID, UnauthorizedException);
        }
      }
      
      // If there's a custom error from our strategy, re-throw it
      if (err?.errorCode) {
        throw err;
      }
      
      // Default fallback
      throw createSecureError(ERROR_CODES.AUTH_UNAUTHORIZED, UnauthorizedException);
    }
    
    return user;
  }
}