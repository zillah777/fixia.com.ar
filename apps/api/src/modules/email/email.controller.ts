import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus, 
  UseGuards,
  BadRequestException 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

// DTOs for request validation
class SendTestEmailDto {
  to: string;
  subject?: string;
  message?: string;
}

class SendVerificationEmailDto {
  to: string;
  userName: string;
  verificationUrl: string;
}

class SendWelcomeEmailDto {
  to: string;
  userName: string;
  userType: 'cliente' | 'profesional';
  isProfessional?: boolean;
}

class SendPasswordResetDto {
  to: string;
  userName: string;
  resetUrl: string;
}

@ApiTags('Email')
@Controller('email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email format or missing data' })
  async sendTestEmail(@Body() data: SendTestEmailDto) {
    if (!this.emailService.isValidEmail(data.to)) {
      throw new BadRequestException('Invalid email format');
    }

    const success = await this.emailService.sendPlainEmail(
      data.to,
      data.subject || 'Test Email from Fixia',
      data.message || 'This is a test email from your Fixia application.'
    );

    return {
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
    };
  }

  @Post('verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send account verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  async sendVerificationEmail(@Body() data: SendVerificationEmailDto) {
    if (!this.emailService.isValidEmail(data.to)) {
      throw new BadRequestException('Invalid email format');
    }

    const success = await this.emailService.sendAccountVerification(
      data.to,
      data.userName,
      data.verificationUrl
    );

    return {
      success,
      message: success ? 'Verification email sent successfully' : 'Failed to send verification email',
    };
  }

  @Post('welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  async sendWelcomeEmail(@Body() data: SendWelcomeEmailDto) {
    if (!this.emailService.isValidEmail(data.to)) {
      throw new BadRequestException('Invalid email format');
    }

    const success = await this.emailService.sendWelcomeEmail(
      data.to,
      data.userName,
      data.userType,
      data.isProfessional || false
    );

    return {
      success,
      message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
    };
  }

  @Post('password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  async sendPasswordResetEmail(@Body() data: SendPasswordResetDto) {
    if (!this.emailService.isValidEmail(data.to)) {
      throw new BadRequestException('Invalid email format');
    }

    const success = await this.emailService.sendPasswordReset(
      data.to,
      data.userName,
      data.resetUrl
    );

    return {
      success,
      message: success ? 'Password reset email sent successfully' : 'Failed to send password reset email',
    };
  }
}