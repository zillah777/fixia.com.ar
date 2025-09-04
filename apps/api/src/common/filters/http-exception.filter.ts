import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;
    let errorCode: string | undefined;
    let action: string | undefined;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      // Extract custom error codes and actions if available
      errorCode = (exception as any).errorCode;
      action = (exception as any).action;
      details = (exception as any).details;
      
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
        errors = (errorResponse as any).message;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'A record with this data already exists';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        default:
          status = HttpStatus.BAD_REQUEST;
          message = 'Database error occurred';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
    }

    // Smart logging: avoid flooding logs with common authentication errors
    const isAuthError = status === HttpStatus.UNAUTHORIZED;
    const isCommonAuthRoute = ['/auth/verify', '/auth/refresh'].some(route => 
      request.url.includes(route)
    );
    
    if (isAuthError && isCommonAuthRoute && errorCode?.startsWith('AUTH_')) {
      // Log auth errors at debug level to prevent log flooding
      this.logger.debug(`Auth error ${errorCode}: ${request.method} ${request.url}`, {
        errorCode,
        userAgent: request.headers['user-agent']?.substring(0, 50) + '...',
        ip: request.ip,
      });
    } else if (status >= 500) {
      // Always log server errors
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : exception,
      );
    } else {
      // Log other client errors at warn level
      this.logger.warn(`${request.method} ${request.url} - ${message}`, {
        status,
        errorCode,
        ip: request.ip,
      });
    }

    const errorResponse = {
      success: false,
      message,
      status_code: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(errorCode && { error_code: errorCode }),
      ...(action && { action }),
      ...(details && { details }),
      ...(errors && Array.isArray(errors) && { errors }),
    };

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && status === HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = 'Internal server error';
    }

    response.status(status).json(errorResponse);
  }
}