import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  user_type: 'client' | 'professional';
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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
    // Verify user still exists and is not deleted
    const user = await this.prisma.user.findUnique({
      where: { 
        id: payload.sub,
        deleted_at: null 
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
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
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
    };
  }
}