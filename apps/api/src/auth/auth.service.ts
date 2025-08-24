import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../modules/email/email.service';
import { LoginCredentials, RegisterData, AuthResponse } from '@fixia/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        professional_profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password from return object
    const { password_hash, ...result } = user;
    return result;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = await this.validateUser(credentials.email, credentials.password);
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      user_type: user.user_type 
    };
    
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Store refresh token in database
    await this.prisma.userSession.create({
      data: {
        user_id: user.id,
        refresh_token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      user,
      access_token,
      refresh_token,
      expires_in: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async register(registerData: any): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerData.password, 12);

    // Map frontend fields to backend fields
    const userCreateData = {
      email: registerData.email,
      password_hash: hashedPassword,
      name: registerData.fullName || registerData.name,
      user_type: registerData.userType || registerData.user_type,
      location: registerData.location,
      phone: registerData.phone,
      whatsapp_number: registerData.phone, // Use phone as WhatsApp number
      email_verified: false, // Require email verification
    };

    // Create user
    const user = await this.prisma.user.create({
      data: userCreateData,
    });

    // Create professional profile if user is professional
    if (userCreateData.user_type === 'professional') {
      const professionalData = {
        user_id: user.id,
        bio: registerData.description || '',
        specialties: registerData.serviceCategories || [],
        experience_years: registerData.experience || '',
        pricing_range: registerData.pricing || '',
        availability: registerData.availability || '',
        portfolio_url: registerData.portfolio || null,
        certifications: registerData.certifications || '',
      };

      await this.prisma.professionalProfile.create({
        data: professionalData,
      });
    }

    // Generate and send verification email
    await this.sendEmailVerification(registerData.email, user.id);

    // Generate tokens and return same as login
    const payload = { 
      sub: user.id, 
      email: user.email, 
      user_type: user.user_type 
    };
    
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '30d'),
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    // Store refresh token
    await this.prisma.userSession.create({
      data: {
        user_id: user.id,
        refresh_token,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Remove password from response and convert dates to strings
    const { password_hash, ...userResponse } = user;
    const userData = {
      ...userResponse,
      created_at: userResponse.created_at.toISOString(),
      updated_at: userResponse.updated_at.toISOString(),
      deleted_at: userResponse.deleted_at?.toISOString() || null,
    };

    return {
      user: userData,
      access_token,
      refresh_token,
      expires_in: 7 * 24 * 60 * 60,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verify refresh token exists in database
      const session = await this.prisma.userSession.findFirst({
        where: {
          refresh_token: refreshToken,
          expires_at: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!session) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const newPayload = {
        sub: session.user.id,
        email: session.user.email,
        user_type: session.user.user_type,
      };

      const access_token = this.jwtService.sign(newPayload);

      return { access_token };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.userSession.deleteMany({
      where: {
        user_id: userId,
        refresh_token: refreshToken,
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        deleted_at: null 
      },
      include: {
        professional_profile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Remove sensitive data
    const { password_hash, ...userProfile } = user;
    return userProfile;
  }

  async forgotPassword(email: string): Promise<{ message: string; success: boolean }> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate reset token
      const token = this.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Invalidate any existing tokens for this user
      await this.prisma.passwordResetToken.updateMany({
        where: { 
          user_id: user.id,
          used: false 
        },
        data: { used: true }
      });

      // Create new reset token
      await this.prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at: expiresAt,
        },
      });

      // TODO: Send email with reset link
      // For now, we'll log the token for development/testing
      console.log(`Reset token for ${email}: ${token}`);
      console.log(`Reset URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`);
    }

    // Always return success for security (don't reveal if email exists)
    return {
      message: 'Si el email existe, se ha enviado un enlace de recuperación',
      success: true
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string; success: boolean }> {
    // Find valid token
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expires_at: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido o expirado');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.user_id },
        data: { password_hash: hashedPassword }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      }),
      // Invalidate all user sessions (force re-login)
      this.prisma.userSession.deleteMany({
        where: { user_id: resetToken.user_id }
      })
    ]);

    return {
      message: 'Contraseña actualizada exitosamente',
      success: true
    };
  }

  private generateSecureToken(): string {
    // Generate a cryptographically secure random token
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  async sendEmailVerification(email: string, userId?: string): Promise<{ message: string; success: boolean }> {
    let user;
    
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await this.prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      return {
        message: 'Si el email existe, se ha enviado un enlace de verificación',
        success: true
      };
    }

    if (user.email_verified) {
      return {
        message: 'El email ya está verificado',
        success: true
      };
    }

    // Generate verification token
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    // Invalidate any existing tokens for this user
    await this.prisma.emailVerificationToken.updateMany({
      where: { 
        user_id: user.id,
        used: false 
      },
      data: { used: true }
    });

    // Create new verification token
    await this.prisma.emailVerificationToken.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });

    // Send email with verification link
    const verificationUrl = `${this.configService.get('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${token}`;
    
    try {
      await this.emailService.sendAccountVerification(email, user.name, verificationUrl);
    } catch (error) {
      this.logger?.error(`Failed to send verification email to ${email}:`, error);
      // Still log for development/testing fallback
      console.log(`Verification token for ${email}: ${token}`);
      console.log(`Verification URL: ${verificationUrl}`);
    }

    return {
      message: 'Se ha enviado un enlace de verificación a tu email',
      success: true
    };
  }

  async verifyEmail(token: string): Promise<{ message: string; success: boolean }> {
    // Find valid token
    const verificationToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        token,
        used: false,
        expires_at: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!verificationToken) {
      throw new BadRequestException('Token de verificación inválido o expirado');
    }

    if (verificationToken.user.email_verified) {
      throw new BadRequestException('El email ya está verificado');
    }

    // Update user email_verified and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verificationToken.user_id },
        data: { email_verified: true }
      }),
      this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true }
      })
    ]);

    return {
      message: 'Email verificado exitosamente',
      success: true
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string; success: boolean }> {
    // Get user with current password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and invalidate all sessions
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedNewPassword }
      }),
      // Invalidate all user sessions (force re-login on all devices)
      this.prisma.userSession.deleteMany({
        where: { user_id: userId }
      })
    ]);

    return {
      message: 'Contraseña actualizada exitosamente. Por seguridad, se ha cerrado sesión en todos los dispositivos.',
      success: true
    };
  }
}