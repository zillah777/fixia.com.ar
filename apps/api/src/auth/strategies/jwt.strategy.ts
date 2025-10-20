import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { ERROR_CODES, createSecureError } from '../../common/constants/error-codes';

export interface JwtPayload {
  sub: string;
  email: string;
  user_type: 'client' | 'professional';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request) => {
          // Support httpOnly cookies for browser clients
          return request?.cookies?.access_token || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      // Check for expired token (redundant safety check)
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw createSecureError(ERROR_CODES.AUTH_TOKEN_EXPIRED, UnauthorizedException);
      }

      // Verify user still exists and is not deleted
      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
        select: {
          id: true,
          email: true,
          name: true,
          user_type: true,
          verified: true,
          email_verified: true,
          location: true,
          created_at: true,
          locked_until: true,
          deleted_at: true,
        },
      });

      if (!user || user.deleted_at !== null) {
        // Use specific error for user not found (e.g., user was deleted)
        throw createSecureError(ERROR_CODES.AUTH_USER_NOT_FOUND, UnauthorizedException);
      }

      // Check if account is currently locked
      if (user.locked_until && user.locked_until > new Date()) {
        const remainingTime = Math.ceil((user.locked_until.getTime() - Date.now()) / 1000 / 60);
        throw createSecureError(ERROR_CODES.AUTH_ACCOUNT_LOCKED, UnauthorizedException, { 
          remainingMinutes: remainingTime 
        });
      }

      // Return user data that will be available in req.user
      return {
        sub: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        verified: user.verified,
        email_verified: user.email_verified,
        location: user.location,
        exp: payload.exp,
      };
    } catch (error) {
      // Log authentication failures with minimal details to avoid log flooding
      // Only log at debug level for common auth failures
      const isCommonAuthError = error.errorCode && error.errorCode.startsWith('AUTH_');
      
      if (isCommonAuthError) {
        this.logger.debug(`JWT validation failed: ${error.errorCode}`, {
          errorCode: error.errorCode,
          userId: payload?.sub?.substring(0, 8) + '...' || 'unknown',
        });
      } else {
        this.logger.warn('Unexpected JWT validation error', {
          error: error.message,
          userId: payload?.sub?.substring(0, 8) + '...' || 'unknown',
        });
      }

      throw error;
    }
  }
}