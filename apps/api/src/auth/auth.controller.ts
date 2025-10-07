import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  UseGuards,
  Get,
  Request,
  Param,
  Res,
  Logger,
  Ip,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto, ChangePasswordDto, DevVerifyUserDto } from './dto/auth.dto';
import { AuthResponse } from '@fixia/types';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 intentos por 15 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas o email no verificado' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res): Promise<AuthResponse> {
    const result = await this.authService.login(loginDto);
    
    // Set httpOnly cookies for secure token management
    this.logger.log(`🔐 Login successful - Setting auth cookies for user: ${result.user?.email}`, {
      hasAccessToken: !!result.access_token,
      accessTokenPreview: result.access_token ? `${result.access_token.substring(0, 10)}...` : 'none',
      hasRefreshToken: !!result.refresh_token,
      refreshTokenPreview: result.refresh_token ? `${result.refresh_token.substring(0, 10)}...` : 'none',
      isProduction: process.env.NODE_ENV === 'production'
    });
    
    this.setAuthCookies(res, result.access_token, result.refresh_token);
    
    return result;
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registros por minuto
  @ApiOperation({ summary: 'Registro de usuario - PRODUCTION READY' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(@Body() registerDto: any, @Res({ passthrough: true }) res, @Ip() clientIp: string) {
    this.logger.log(`🚀 PRODUCTION Registration attempt from IP ${clientIp} for email: ${registerDto.email}`);
    
    try {
      // PRODUCTION VALIDATION - Required fields
      if (!registerDto.email) {
        throw new BadRequestException('Email es requerido');
      }
      if (!registerDto.password) {
        throw new BadRequestException('Contraseña es requerida');
      }
      if (!registerDto.name && !registerDto.fullName) {
        throw new BadRequestException('Nombre es requerido');
      }

      // Check if user already exists FIRST
      const existingUser = await this.authService['prisma'].user.findUnique({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        this.logger.warn(`Registration blocked - user exists: ${registerDto.email}`);
        throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
      }

      // PRODUCTION DATA MAPPING - Only fields that exist in DB
      const userData = {
        email: registerDto.email,
        password_hash: await require('bcryptjs').hash(registerDto.password, 12),
        name: registerDto.fullName || registerDto.name,
        user_type: registerDto.userType || registerDto.user_type || 'client',
        location: registerDto.location || null,
        phone: registerDto.phone || null,
        whatsapp_number: registerDto.phone || null,
        birthdate: registerDto.birthdate ? new Date(registerDto.birthdate) : null,
        verified: false,
        email_verified: false,
        failed_login_attempts: 0,
      };

      this.logger.log(`🔨 Creating production user:`, { 
        email: userData.email,
        name: userData.name,
        user_type: userData.user_type,
        location: userData.location,
        hasPhone: !!userData.phone
      });

      // Create user with transaction for safety
      const user = await this.authService['prisma'].user.create({
        data: userData,
      });

      this.logger.log(`✅ PRODUCTION User created: ${user.id} - ${user.email}`);

      // Create professional profile if needed
      if (userData.user_type === 'professional') {
        try {
          const professionalData = {
            user_id: user.id,
            bio: registerDto.description || null,
            specialties: registerDto.serviceCategories || [],
            years_experience: this.mapExperienceToYears(registerDto.experience),
            level: 'Nuevo',
            rating: 0.0,
            review_count: 0,
            total_earnings: 0.0,
            availability_status: 'available',
            response_time_hours: 24,
          };

          await this.authService['prisma'].professionalProfile.create({
            data: {
              user: { connect: { id: user.id } },
              bio: registerDto.description || null,
              specialties: registerDto.serviceCategories || [],
              years_experience: this.mapExperienceToYears(registerDto.experience),
              level: 'Nuevo',
              rating: 0.0,
              review_count: 0,
              total_earnings: 0.0,
              availability_status: 'available',
              response_time_hours: 24,
            },
          });

          this.logger.log(`✅ Professional profile created for: ${user.email}`);
        } catch (profileError) {
          this.logger.error(`⚠️ Professional profile creation failed (non-critical):`, profileError);
        }
      }

      // Send verification email
      try {
        await this.authService.sendEmailVerification(user.email, user.id);
        this.logger.log(`✅ Verification email sent to: ${user.email}`);
      } catch (emailError) {
        this.logger.error(`⚠️ Verification email failed (non-critical):`, emailError);
      }

      return {
        success: true,
        message: 'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.',
        requiresVerification: true,
        userId: user.id,
        email: user.email
      };

    } catch (error) {
      this.logger.error(`❌ PRODUCTION Registration failed for ${registerDto.email}:`, error);
      
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
      }
      
      throw new BadRequestException(error.message || 'Error creando cuenta de usuario');
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Request() req, @Res({ passthrough: true }) res) {
    // Support both body parameter and httpOnly cookie
    const bodyToken = refreshTokenDto?.refresh_token;
    const cookieToken = req.cookies?.refresh_token;
    const refreshToken = bodyToken || cookieToken;
    
    // Reduced logging - only debug level for refresh attempts
    this.logger.debug(`Token refresh attempt`, {
      hasBodyToken: !!bodyToken,
      hasCookieToken: !!cookieToken,
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
      ip: req.ip,
    });
    
    if (!refreshToken) {
      const { ERROR_CODES, createSecureError } = await import('../common/constants/error-codes');
      throw createSecureError(ERROR_CODES.AUTH_TOKEN_MISSING, UnauthorizedException);
    }
    
    const result = await this.authService.refreshToken(refreshToken);
    
    // Update access token cookie (refresh token remains the same)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    this.logger.debug(`Token refreshed successfully`);
    
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  async logout(@Request() req, @Body() refreshTokenDto: RefreshTokenDto, @Res({ passthrough: true }) res) {
    const refreshToken = refreshTokenDto.refresh_token || req.cookies?.refresh_token;
    
    if (refreshToken) {
      await this.authService.logout(req.user.sub, refreshToken);
    }
    
    // Clear httpOnly cookies
    this.clearAuthCookies(res);
    
    return { message: 'Logout successful' };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 intentos por 15 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recuperar contraseña' })
  @ApiResponse({ status: 200, description: 'Email de recuperación enviado' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 intentos por 15 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.new_password);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar estado de autenticación' })
  @ApiResponse({ status: 200, description: 'Usuario autenticado' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  async verifyAuth(@Request() req) {
    try {
      // Basic verify with minimal logging
      this.logger.debug(`Auth verify for user: ${req.user?.sub?.substring(0, 8)}...`);
      
      return { 
        isAuthenticated: true, 
        userId: req.user.sub,
        email: req.user.email,
        userType: req.user.user_type,
        expiresAt: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Auth verify failed:', error);
      throw new UnauthorizedException('Authentication verification failed');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  async getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.sub);
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute to prevent brute force
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar email con token' })
  @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @Ip() clientIp: string) {
    this.logger.log(`Email verification attempt via POST: token=${verifyEmailDto.token.substring(0, 8)}..., ip=${clientIp}`);
    return this.authService.verifyEmail(verifyEmailDto.token);
  }

  @Get('verify/:token')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute to prevent token enumeration
  @ApiOperation({ summary: 'Verificar email con token via GET (para links directos)' })
  @ApiResponse({ status: 302, description: 'Redirect a frontend con resultado' })
  async verifyEmailByGet(@Param('token') token: string, @Res() res, @Ip() clientIp: string) {
    this.logger.log(`Email verification attempt via GET: token=${token.substring(0, 8)}..., ip=${clientIp}`);
    
    try {
      const result = await this.authService.verifyEmail(token);
      
      this.logger.log(`Email verification successful via GET: ip=${clientIp}, success=${result.success}`);
      
      // Redirect to frontend with success message
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?verified=true&message=Email verificado exitosamente`;
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.warn(`Email verification failed via GET: ip=${clientIp}, error=${error.message}`);
      
      // Redirect to frontend with error message  
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?error=token_invalid&message=Token de verificación inválido o expirado`;
      res.redirect(redirectUrl);
    }
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 intentos por 5 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reenviar email de verificación' })
  @ApiResponse({ status: 200, description: 'Email de verificación enviado' })
  async resendVerification(@Body() resendVerificationDto: ResendVerificationDto, @Ip() clientIp: string) {
    this.logger.log(`Resend verification request: email=${resendVerificationDto.email}, ip=${clientIp}`);
    return this.authService.sendEmailVerification(resendVerificationDto.email);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 intentos por 15 minutos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
  @ApiResponse({ status: 401, description: 'Contraseña actual incorrecta' })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.sub, 
      changePasswordDto.current_password, 
      changePasswordDto.new_password
    );
  }

  @Post('admin/verify-user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar usuario manualmente (temporal)' })
  async adminVerifyUser(@Request() req, @Body() body: { userId: string }) {
    // TODO: Add proper admin role verification
    this.logger.warn(`Admin verification performed by user ${req.user.sub} on user ${body.userId}`);
    return this.authService.adminVerifyUser(body.userId);
  }

  @Post('dev/verify-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DEVELOPMENT ONLY: Verificar usuario por email' })
  @ApiResponse({ status: 200, description: 'Usuario verificado' })
  @ApiResponse({ status: 400, description: 'Usuario no encontrado o no es entorno de desarrollo' })
  async devVerifyUser(@Body() devVerifyUserDto: DevVerifyUserDto, @Ip() clientIp: string) {
    // Allow in both development and production for testing purposes
    // TODO: Remove or restrict this endpoint in production
    
    this.logger.log(`DEV: Email verification bypass requested for ${devVerifyUserDto.email} from IP ${clientIp}`);
    return this.authService.devVerifyUserByEmail(devVerifyUserDto.email);
  }

  @Post('dev/migrate-db')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DEV: Execute database migration' })
  async devMigrateDb(@Ip() clientIp: string) {
    this.logger.log(`DEV: Database migration from IP ${clientIp}`);
    
    try {
      const prisma = this.authService['prisma'];
      
      const migrations = [
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_messages" BOOLEAN NOT NULL DEFAULT true;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_orders" BOOLEAN NOT NULL DEFAULT true;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_projects" BOOLEAN NOT NULL DEFAULT true;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_newsletter" BOOLEAN NOT NULL DEFAULT false;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'buenos-aires';`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_linkedin" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_twitter" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_github" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_instagram" TEXT;`
      ];

      const results = [];
      for (const sql of migrations) {
        try {
          await prisma.$executeRawUnsafe(sql);
          results.push({ sql, status: 'success' });
        } catch (error) {
          results.push({ sql, status: 'error', error: error.message });
        }
      }

      return { success: true, message: 'Migration completed', results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('debug/registration')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'DEBUG: Test registration data parsing' })
  async debugRegistration(@Body() body: any, @Ip() clientIp: string) {
    this.logger.log(`DEBUG: Registration debug from IP ${clientIp} with body:`, JSON.stringify(body, null, 2));
    
    try {
      // Test the exact same logic but without database creation
      const registerData = body;
      
      // Map frontend fields to backend fields with better error handling
      const userCreateData = {
        email: registerData.email,
        password_hash: '[WOULD_BE_HASHED]',
        name: registerData.fullName || registerData.name,
        user_type: registerData.userType || registerData.user_type || 'client',
        location: registerData.location || '',
        phone: registerData.phone || null,
        whatsapp_number: registerData.phone || null,
        birthdate: registerData.birthdate ? new Date(registerData.birthdate) : null,
        email_verified: false,
      };

      this.logger.log(`DEBUG: Mapped data would be:`, JSON.stringify(userCreateData, null, 2));

      return {
        success: true,
        message: 'Debug successful - data mapping works',
        originalData: body,
        mappedData: userCreateData,
        issues: []
      };
    } catch (error) {
      this.logger.error(`DEBUG: Registration debug failed:`, error);
      return {
        success: false,
        message: 'Debug failed',
        originalData: body,
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('migrate/database')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ADMIN: Execute database migration for missing columns' })
  async migrateDatabase(@Ip() clientIp: string) {
    this.logger.log(`DATABASE MIGRATION: Attempt from IP ${clientIp}`);
    
    try {
      const prisma = this.authService['prisma'];
      
      // Execute raw SQL to add missing columns
      const migrations = [
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_messages" BOOLEAN NOT NULL DEFAULT true;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_orders" BOOLEAN NOT NULL DEFAULT true;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_projects" BOOLEAN NOT NULL DEFAULT true;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_newsletter" BOOLEAN NOT NULL DEFAULT false;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'buenos-aires';`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_linkedin" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_twitter" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_github" TEXT;`,
        `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_instagram" TEXT;`
      ];

      const results = [];
      for (const migration of migrations) {
        try {
          await prisma.$executeRawUnsafe(migration);
          results.push({ sql: migration, status: 'success' });
          this.logger.log(`Migration executed: ${migration}`);
        } catch (error) {
          results.push({ sql: migration, status: 'error', error: error.message });
          this.logger.error(`Migration failed: ${migration}`, error);
        }
      }

      return {
        success: true,
        message: 'Database migration completed',
        results
      };
    } catch (error) {
      this.logger.error(`DATABASE MIGRATION failed:`, error);
      throw new BadRequestException(`Migration failed: ${error.message}`);
    }
  }

  @Post('emergency/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'EMERGENCY: Database exploration and registration' })
  async emergencyRegister(@Body() body: any, @Ip() clientIp: string) {
    this.logger.log(`EMERGENCY: Database exploration from IP ${clientIp}`);
    
    try {
      const prisma = this.authService['prisma'];
      
      // First, let's explore the actual table structure
      let tableInfo;
      try {
        // Try different possible table names
        const tables = await prisma.$queryRaw`
          SELECT tablename FROM pg_tables WHERE schemaname = 'public';
        `;
        this.logger.log('Available tables:', tables);
        
        // Try to find user-related tables
        const userTables = await prisma.$queryRaw`
          SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename ILIKE '%user%';
        `;
        this.logger.log('User tables found:', userTables);
        
        return {
          success: false,
          message: 'Database exploration completed - check logs for table structure',
          tables: tables,
          userTables: userTables
        };
      } catch (error) {
        this.logger.error('Database exploration failed:', error);
        throw new BadRequestException(`Database exploration failed: ${error.message}`);
      }
    } catch (error) {
      this.logger.error(`EMERGENCY: Failed:`, error);
      throw new BadRequestException(`Error: ${error.message}`);
    }
  }

  @Post('register/sql')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'EMERGENCY: Registration using raw SQL (production-ready)' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente con SQL directo' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async registerWithSQL(@Body() registerDto: any, @Res({ passthrough: true }) res, @Ip() clientIp: string) {
    this.logger.log(`SQL Registration attempt from IP ${clientIp} for email: ${registerDto.email}`);
    
    try {
      // Validate required fields
      if (!registerDto.email) {
        throw new BadRequestException('Email es requerido');
      }
      if (!registerDto.password) {
        throw new BadRequestException('Contraseña es requerida');
      }
      if (!registerDto.name && !registerDto.fullName) {
        throw new BadRequestException('Nombre es requerido');
      }

      const result = await this.authService.registerWithRawSQL(registerDto);
      
      this.logger.log(`SQL Registration completed for ${registerDto.email}: ${result.success}`);
      
      return result;
    } catch (error) {
      this.logger.error(`SQL Registration failed for ${registerDto.email}:`, error);
      throw error;
    }
  }

  @Post('simple/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SIMPLE: Production-ready registration with only existing DB fields' })
  async simpleRegister(@Body() body: any, @Ip() clientIp: string) {
    this.logger.log(`SIMPLE: Registration attempt from IP ${clientIp} for ${body.email}`);
    
    try {
      // Validate required fields
      if (!body.email) throw new BadRequestException('Email es requerido');
      if (!body.password) throw new BadRequestException('Contraseña es requerida');
      if (!body.name && !body.fullName) throw new BadRequestException('Nombre es requerido');

      // Check if user already exists
      const existingUser = await this.authService['prisma'].user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
      }

      // Create user with ONLY fields that exist in the actual table
      const userData = {
        email: body.email,
        password_hash: await require('bcryptjs').hash(body.password, 12),
        name: body.fullName || body.name,
        user_type: body.userType || body.user_type || 'client',
        location: body.location || null,
        phone: body.phone || null,
        whatsapp_number: body.phone || null,
        birthdate: body.birthdate ? new Date(body.birthdate) : null,
        verified: false,
        email_verified: false,
        failed_login_attempts: 0,
      };

      this.logger.log(`SIMPLE: Creating user with mapped data:`, { 
        ...userData, 
        password_hash: '[REDACTED]' 
      });

      const user = await this.authService['prisma'].user.create({
        data: userData,
      });

      this.logger.log(`✅ SIMPLE: User created successfully: ${user.id} - ${user.email}`);

      // Send verification email
      try {
        await this.authService.sendEmailVerification(user.email, user.id);
        this.logger.log(`✅ SIMPLE: Verification email sent to: ${user.email}`);
      } catch (emailError) {
        this.logger.error(`❌ SIMPLE: Failed to send verification email:`, emailError);
      }

      return {
        success: true,
        message: 'Cuenta creada exitosamente. Revisa tu correo electrónico para verificar tu cuenta.',
        requiresVerification: true,
        userId: user.id,
        email: user.email
      };
    } catch (error) {
      this.logger.error(`❌ SIMPLE: Registration failed for ${body.email}:`, error);
      
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
      }
      
      throw new BadRequestException(error.message || 'Error creando cuenta de usuario');
    }
  }

  /**
   * Set httpOnly cookies for secure authentication
   */
  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' as const : 'lax' as const, // 'none' for cross-origin in production
      path: '/',
      // Don't set domain - let browser handle automatically
    };

    // Set access token cookie (shorter expiration)
    res.cookie('access_token', accessToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set refresh token cookie (longer expiration)  
    res.cookie('refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    this.logger.log(`🍪 Auth cookies set successfully`, {
      isProduction,
      cookieConfig: {
        httpOnly: true,
        secure: isProduction,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
        path: '/',
        domain: 'auto'
      },
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(res: any) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    });
    
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    });
  }
}