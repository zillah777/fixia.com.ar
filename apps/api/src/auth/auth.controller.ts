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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ResendVerificationDto, ChangePasswordDto } from './dto/auth.dto';
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
    this.setAuthCookies(res, result.access_token, result.refresh_token);
    
    return result;
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 registros por minuto
  @ApiOperation({ summary: 'Registro de usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email ya registrado' })
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res): Promise<AuthResponse> {
    const result = await this.authService.register(registerDto);
    
    // Set httpOnly cookies for secure token management
    this.setAuthCookies(res, result.access_token, result.refresh_token);
    
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar token de acceso' })
  @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Request() req, @Res({ passthrough: true }) res) {
    // Support both body parameter and httpOnly cookie with detailed logging
    const bodyToken = refreshTokenDto?.refresh_token;
    const cookieToken = req.cookies?.refresh_token;
    const refreshToken = bodyToken || cookieToken;
    
    // Enhanced logging for debugging
    this.logger.debug(`Refresh token request:`, {
      hasBodyToken: !!bodyToken,
      bodyTokenPreview: bodyToken ? `${bodyToken.substring(0, 10)}...` : null,
      hasCookieToken: !!cookieToken,
      cookieTokenPreview: cookieToken ? `${cookieToken.substring(0, 10)}...` : null,
      cookiesAvailable: !!req.cookies,
      allCookieKeys: req.cookies ? Object.keys(req.cookies) : [],
      hasRefreshToken: !!refreshToken
    });
    
    if (!refreshToken) {
      this.logger.warn('Refresh token missing from both body and cookies', {
        requestBody: refreshTokenDto,
        cookiesAvailable: !!req.cookies,
        cookieKeys: req.cookies ? Object.keys(req.cookies) : []
      });
      throw new UnauthorizedException('Refresh token is required');
    }
    
    const result = await this.authService.refreshToken(refreshToken);
    
    // Update access token cookie (refresh token remains the same)
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    this.logger.log(`Token refreshed successfully for token: ${refreshToken.substring(0, 10)}...`);
    
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
    return { 
      isAuthenticated: true, 
      userId: req.user.sub,
      expiresAt: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null
    };
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

  /**
   * Set httpOnly cookies for secure authentication
   */
  private setAuthCookies(res: any, accessToken: string, refreshToken: string) {
    // Set access token cookie (shorter expiration)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set refresh token cookie (longer expiration)  
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  /**
   * Clear authentication cookies
   */
  private clearAuthCookies(res: any) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }
}