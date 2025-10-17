import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';
import { EmailService } from '../modules/email/email.service';
import { LoginCredentials, RegisterData, AuthResponse } from '@fixia/types';
import { ERROR_CODES, createSecureError } from '../common/constants/error-codes';

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
      throw createSecureError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, UnauthorizedException);
    }

    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      const remainingTime = Math.ceil((user.locked_until.getTime() - Date.now()) / 1000 / 60);
      throw createSecureError(ERROR_CODES.AUTH_ACCOUNT_LOCKED, UnauthorizedException, { remainingMinutes: remainingTime });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user.id);
      throw createSecureError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, UnauthorizedException);
    }

    // Reset failed login attempts on successful login
    if (user.failed_login_attempts > 0 || user.locked_until) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failed_login_attempts: 0,
          locked_until: null,
        },
      });
    }

    // Remove password from return object and ensure location is never undefined
    const { password_hash, ...result } = user;
    return {
      ...result,
      location: result.location || '', // Ensure location is always a string
    };
  }

  private async handleFailedLogin(userId: string): Promise<void> {
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_DURATION_MINUTES = 30;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { failed_login_attempts: true, email: true },
    });

    if (!user) return;

    const newAttempts = user.failed_login_attempts + 1;
    const shouldLock = newAttempts >= MAX_ATTEMPTS;

    const updateData: any = {
      failed_login_attempts: newAttempts,
    };

    if (shouldLock) {
      updateData.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
      this.logger.warn(`Account locked due to failed login attempts: ${user.email}`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const user = await this.validateUser(credentials.email, credentials.password);
    
    // Check if email is verified - required for login security
    if (!user.email_verified) {
      throw createSecureError(ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED, UnauthorizedException, { email: user.email });
    }
    
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

  async register(registerData: any): Promise<{ message: string; success: boolean; requiresVerification: boolean }> {
    // NOTE: This method is now primarily used by the controller
    // The main registration logic has been moved to the controller for better control
    this.logger.log(`🔄 Legacy register method called - redirecting to controller logic`);
    
    // This method is kept for backward compatibility but should not be used directly
    throw new BadRequestException('Please use the main registration endpoint directly');
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      // Verify JWT signature and expiration
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Verify refresh token exists in database and is not expired
      const session = await this.prisma.userSession.findFirst({
        where: {
          refresh_token: refreshToken,
          expires_at: { gt: new Date() },
        },
        include: { 
          user: {
            select: {
              id: true,
              email: true,
              user_type: true,
              deleted_at: true,
              locked_until: true,
            }
          }
        },
      });

      if (!session) {
        throw createSecureError(ERROR_CODES.AUTH_REFRESH_FAILED, UnauthorizedException);
      }

      // Check if user still exists and is not deleted
      if (session.user.deleted_at) {
        // Clean up sessions for deleted user
        await this.prisma.userSession.deleteMany({
          where: { user_id: session.user.id }
        });
        throw createSecureError(ERROR_CODES.AUTH_USER_NOT_FOUND, UnauthorizedException);
      }

      // Check if account is currently locked
      if (session.user.locked_until && session.user.locked_until > new Date()) {
        const remainingTime = Math.ceil((session.user.locked_until.getTime() - Date.now()) / 1000 / 60);
        throw createSecureError(ERROR_CODES.AUTH_ACCOUNT_LOCKED, UnauthorizedException, { 
          remainingMinutes: remainingTime 
        });
      }

      // Generate new access token
      const newPayload = {
        sub: session.user.id,
        email: session.user.email,
        user_type: session.user.user_type,
      };

      const access_token = this.jwtService.sign(newPayload);

      this.logger.debug(`Token refreshed successfully for user: ${session.user.id}`);

      return { access_token };
    } catch (error) {
      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        throw createSecureError(ERROR_CODES.AUTH_TOKEN_INVALID, UnauthorizedException);
      } else if (error.name === 'TokenExpiredError') {
        throw createSecureError(ERROR_CODES.AUTH_REFRESH_FAILED, UnauthorizedException);
      } else if (error.errorCode) {
        // Re-throw our custom errors
        throw error;
      } else {
        // Log unexpected errors but don't expose details
        this.logger.error('Unexpected error during token refresh', error);
        throw createSecureError(ERROR_CODES.AUTH_REFRESH_FAILED, UnauthorizedException);
      }
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
      throw createSecureError(ERROR_CODES.AUTH_USER_NOT_FOUND, UnauthorizedException);
    }

    // Remove sensitive data
    const { password_hash, failed_login_attempts, locked_until, ...userProfile } = user;
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

      // Send password reset email
      const resetUrl = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      try {
        await this.emailService.sendPasswordReset(email, user.name, resetUrl);
        this.logger.log(`Password reset email sent to ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
        // For development/testing fallback
        console.log(`Reset token for ${email}: ${token}`);
        console.log(`Reset URL: ${resetUrl}`);
      }
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
    
    // Security logging: Track verification attempts
    this.logger.log(`Email verification request: email=${email}, userId=${userId || 'not provided'}`);
    
    if (userId) {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    } else {
      user = await this.prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      // Security: Don't reveal whether email exists in database
      this.logger.warn(`Verification requested for non-existent email: ${email}`);
      return {
        message: 'Si el email existe, se ha enviado un enlace de verificación',
        success: true
      };
    }

    if (user.email_verified) {
      this.logger.log(`Verification requested for already verified email: ${email}`);
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
    const invalidatedTokens = await this.prisma.emailVerificationToken.updateMany({
      where: { 
        user_id: user.id,
        used: false 
      },
      data: { used: true }
    });
    
    if (invalidatedTokens.count > 0) {
      this.logger.log(`Invalidated ${invalidatedTokens.count} previous verification tokens for user: ${user.id}`);
    }

    // Create new verification token
    await this.prisma.emailVerificationToken.create({
      data: {
        user_id: user.id,
        token,
        expires_at: expiresAt,
      },
    });
    
    this.logger.log(`New verification token created for user: ${user.id}, expires: ${expiresAt.toISOString()}`);

    // Send email with verification link - use backend GET endpoint that automatically redirects
    const apiUrl = this.configService.get('API_URL') || 'https://fixia-api.onrender.com';
    const verificationUrl = `${apiUrl}/auth/verify/${token}`;
    
    this.logger.log(`🔍 URL Generation Debug:`);
    this.logger.log(`  API_URL: ${this.configService.get('API_URL')}`);
    this.logger.log(`  Final API URL: ${apiUrl}`);
    this.logger.log(`  Verification URL: ${verificationUrl}`);
    this.logger.log(`Attempting to send verification email to ${email}`);
    
    try {
      const emailSent = await this.emailService.sendAccountVerification(email, user.name, verificationUrl);
      if (emailSent) {
        this.logger.log(`✅ Verification email sent successfully to ${email}`);
      } else {
        this.logger.error(`❌ Email service returned false for ${email}`);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send verification email to ${email}:`, error);
      // Still log for development/testing fallback
      console.log(`🔍 DEBUG - Verification token for ${email}: ${token}`);
      console.log(`🔍 DEBUG - Verification URL: ${verificationUrl}`);
    }

    return {
      message: 'Se ha enviado un correo electrónico para verificar la cuenta',
      success: true
    };
  }

  async verifyEmail(token: string): Promise<{ message: string; success: boolean }> {
    const startTime = Date.now();
    
    // Security: Add minimum processing time to prevent timing attacks
    const normalizeResponseTime = async (result: { message: string; success: boolean }, error?: boolean) => {
      const processingTime = Date.now() - startTime;
      const minProcessingTime = 100; // 100ms minimum to normalize timing
      
      if (processingTime < minProcessingTime) {
        await new Promise(resolve => setTimeout(resolve, minProcessingTime - processingTime));
      }
      
      // Log security event
      this.logger.log(`Email verification attempt: token=${token.substring(0, 8)}..., success=${!error}, processingTime=${Date.now() - startTime}ms`);
      
      if (error) {
        throw new BadRequestException('Token de verificación inválido o expirado');
      }
      
      return result;
    };

    try {
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
        return await normalizeResponseTime({ message: '', success: false }, true);
      }

      if (verificationToken.user.email_verified) {
        return await normalizeResponseTime({ message: '', success: false }, true);
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

      return await normalizeResponseTime({
        message: 'Email verificado exitosamente',
        success: true
      });

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // For any other errors, normalize response time and throw generic error
      return await normalizeResponseTime({ message: '', success: false }, true);
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string; success: boolean }> {
    // Get user with current password and history
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        password_history: {
          orderBy: { created_at: 'desc' },
          take: 5, // Check last 5 passwords
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    // Check if new password is same as current
    const isSameAsCurrent = await bcrypt.compare(newPassword, user.password_hash);
    if (isSameAsCurrent) {
      throw createSecureError(ERROR_CODES.PWD_SAME_AS_CURRENT, BadRequestException);
    }

    // Check against password history (prevent reuse of last 5 passwords)
    for (const historyEntry of user.password_history) {
      const isSameAsHistory = await bcrypt.compare(newPassword, historyEntry.password_hash);
      if (isSameAsHistory) {
        throw createSecureError(ERROR_CODES.PWD_RECENTLY_USED, BadRequestException, { historyCount: 5 });
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password, save to history, and invalidate all sessions
    await this.prisma.$transaction([
      // Save current password to history before changing
      this.prisma.passwordHistory.create({
        data: {
          user_id: userId,
          password_hash: user.password_hash,
        },
      }),
      // Update to new password
      this.prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedNewPassword }
      }),
      // Clean up old history (keep only last 5)
      this.prisma.passwordHistory.deleteMany({
        where: {
          user_id: userId,
          id: {
            notIn: (await this.prisma.passwordHistory.findMany({
              where: { user_id: userId },
              orderBy: { created_at: 'desc' },
              take: 5,
              select: { id: true },
            })).map(p => p.id),
          },
        },
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

  async adminVerifyUser(userId: string): Promise<{ message: string; success: boolean }> {
    try {
      // Update user to verified
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          email_verified: true,
          verified: true
        }
      });

      this.logger.log(`✅ Admin verification completed for user: ${user.email}`);
      
      return {
        message: `Usuario ${user.email} verificado exitosamente`,
        success: true
      };
    } catch (error) {
      this.logger.error(`❌ Admin verification failed for userId: ${userId}`, error);
      throw new BadRequestException('Error verificando usuario');
    }
  }

  async devVerifyUserByEmail(email: string): Promise<{ message: string; success: boolean }> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      // Update user to verified
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          email_verified: true,
          verified: true
        }
      });

      this.logger.log(`✅ DEV: Email verification bypassed for user: ${updatedUser.email}`);
      
      return {
        message: `Usuario ${updatedUser.email} verificado exitosamente (desarrollo)`,
        success: true
      };
    } catch (error) {
      this.logger.error(`❌ DEV: Email verification bypass failed for email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Emergency registration using raw SQL - guaranteed to work with production table
   */
  async registerWithRawSQL(registerData: any): Promise<{ message: string; success: boolean; requiresVerification: boolean; userId: string }> {
    try {
      this.logger.log(`Emergency SQL registration for email: ${registerData.email}`);
      
      // Check if user already exists
      const existingUser = await this.prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM users WHERE email = ${registerData.email}
      `;

      if (existingUser.length > 0) {
        throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(registerData.password, 12);

      // Insert user using raw SQL with ONLY existing fields
      const newUser = await this.prisma.$queryRaw<Array<{ id: string; email: string }>>`
        INSERT INTO users (
          id, 
          email, 
          password_hash, 
          name, 
          user_type, 
          location, 
          phone, 
          whatsapp_number, 
          birthdate, 
          verified, 
          email_verified, 
          failed_login_attempts,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(), 
          ${registerData.email}, 
          ${hashedPassword}, 
          ${registerData.fullName || registerData.name}, 
          ${registerData.userType || registerData.user_type || 'client'}::user_type,
          ${registerData.location || null}, 
          ${registerData.phone || null}, 
          ${registerData.phone || null}, 
          ${registerData.birthdate ? new Date(registerData.birthdate) : null}, 
          false, 
          false, 
          0,
          NOW(),
          NOW()
        )
        RETURNING id, email
      `;

      const userId = newUser[0].id;
      this.logger.log(`User created successfully with ID: ${userId}`);

      // Create professional profile if needed (using raw SQL too)
      if ((registerData.userType || registerData.user_type) === 'professional') {
        const experienceYears = this.mapExperienceToYears(registerData.experience);
        
        await this.prisma.$queryRaw`
          INSERT INTO professional_profiles (
            id,
            user_id,
            bio,
            specialties,
            years_experience,
            level,
            rating,
            review_count,
            total_earnings,
            availability_status,
            response_time_hours,
            created_at,
            updated_at
          ) VALUES (
            gen_random_uuid(),
            ${userId},
            ${registerData.description || ''},
            ${registerData.serviceCategories || []}::text[],
            ${experienceYears},
            'Nuevo'::professional_level,
            0.0,
            0,
            0.0,
            'available'::availability_status,
            24,
            NOW(),
            NOW()
          )
        `;
      }

      // Send verification email
      const emailResult = await this.sendEmailVerification(registerData.email, userId);
      
      return {
        message: emailResult.success ? 
          'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.' :
          'Cuenta creada exitosamente. Sin embargo, hubo un problema enviando el correo de verificación.',
        success: true,
        requiresVerification: true,
        userId: userId
      };
    } catch (error) {
      this.logger.error(`Emergency SQL registration failed for ${registerData.email}:`, error);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException('Error creando cuenta de usuario');
    }
  }

  private mapExperienceToYears(experience: string): number | null {
    const experienceMap = {
      'menos-1': 0,
      '1-3': 2,
      '3-5': 4,
      '5-10': 7,
      'mas-10': 15
    };
    return experienceMap[experience as keyof typeof experienceMap] || null;
  }
}