import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  HttpStatus, 
  HttpException,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerificationService } from './verification.service';
import { 
  CreateVerificationRequestDto, 
  UpdateVerificationRequestDto, 
  ReviewVerificationDto,
  VerificationFiltersDto,
  PhoneVerificationDto,
  EmailVerificationDto,
  AddressVerificationDto
} from './dto/verification.dto';
import { User, VerificationType, VerificationStatus } from '@prisma/client';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request')
  @UseInterceptors(FilesInterceptor('documents', 10))
  async createVerificationRequest(
    @CurrentUser() user: User,
    @Body() createVerificationDto: CreateVerificationRequestDto,
    @UploadedFiles() files?: any[]
  ) {
    try {
      // Handle file uploads if provided
      let documentUrls: string[] = [];
      if (files && files.length > 0) {
        // TODO: Implement file upload to cloud storage (AWS S3, Cloudinary, etc.)
        // For now, we'll simulate with local file paths
        documentUrls = files.map(file => `/uploads/verification/${file.filename}`);
      }

      const verificationRequest = await this.verificationService.createVerificationRequest(
        user.id,
        {
          ...createVerificationDto,
          documents: [...(createVerificationDto.documents || []), ...documentUrls]
        }
      );

      return {
        message: 'Verification request created successfully',
        request: verificationRequest
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create verification request',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-requests')
  async getMyVerificationRequests(@CurrentUser() user: User) {
    try {
      const requests = await this.verificationService.getMyVerificationRequests(user.id);
      return { requests };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve verification requests',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status')
  async getMyVerificationStatus(@CurrentUser() user: User) {
    try {
      const status = await this.verificationService.getUserVerificationStatus(user.id);
      return status;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve verification status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('guide/:type')
  async getVerificationGuide(@Param('type') type: VerificationType) {
    try {
      const guide = await this.verificationService.getVerificationGuide(type);
      return guide;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve verification guide',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('request/:id')
  async getVerificationRequest(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      const request = await this.verificationService.getVerificationRequestById(id);
      
      // Users can only view their own requests (admin access would need role check)
      if (request.user_id !== user.id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      return { request };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve verification request',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('request/:id')
  @UseInterceptors(FilesInterceptor('documents', 10))
  async updateVerificationRequest(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateVerificationDto: UpdateVerificationRequestDto,
    @UploadedFiles() files?: any[]
  ) {
    try {
      // Handle new file uploads if provided
      let newDocumentUrls: string[] = [];
      if (files && files.length > 0) {
        newDocumentUrls = files.map(file => `/uploads/verification/${file.filename}`);
      }

      const updatedRequest = await this.verificationService.updateVerificationRequest(
        id,
        user.id,
        {
          ...updateVerificationDto,
          documents: [...(updateVerificationDto.documents || []), ...newDocumentUrls]
        }
      );

      return {
        message: 'Verification request updated successfully',
        request: updatedRequest
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update verification request',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('request/:id')
  async cancelVerificationRequest(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      await this.verificationService.cancelVerificationRequest(id, user.id);
      return { message: 'Verification request cancelled successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to cancel verification request',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Instant verification endpoints
  @Post('phone')
  async initiatePhoneVerification(@CurrentUser() user: User, @Body() phoneDto: { phoneNumber: string }) {
    try {
      // TODO: Implement SMS verification service (Twilio, AWS SNS, etc.)
      // For now, return a mock verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      return {
        message: 'Verification code sent to your phone',
        // In production, don't return the code in the response
        verificationCode: verificationCode // Remove this in production
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send verification code',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('phone/verify')
  async verifyPhone(@CurrentUser() user: User, @Body() phoneVerificationDto: PhoneVerificationDto) {
    try {
      // TODO: Implement actual phone verification logic
      // For demo purposes, accept any 6-digit code
      if (phoneVerificationDto.verificationCode.length === 6) {
        // Create verification request automatically
        await this.verificationService.createVerificationRequest(user.id, {
          verificationType: VerificationType.phone,
          additionalInfo: {
            phoneNumber: phoneVerificationDto.phoneNumber,
            verifiedAt: new Date().toISOString()
          }
        });

        return {
          message: 'Phone number verified successfully',
          verified: true
        };
      } else {
        throw new HttpException('Invalid verification code', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to verify phone number',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('email/send')
  async sendEmailVerification(@CurrentUser() user: User) {
    try {
      // TODO: Implement email verification service
      // For now, return a mock token
      const verificationToken = `email_${user.id}_${Date.now()}`;
      
      return {
        message: 'Verification email sent',
        // In production, send this via email
        verificationToken: verificationToken // Remove this in production
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send verification email',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('email/verify')
  async verifyEmail(@CurrentUser() user: User, @Body() emailVerificationDto: EmailVerificationDto) {
    try {
      // TODO: Implement actual email verification logic
      if (emailVerificationDto.verificationToken.startsWith(`email_${user.id}`)) {
        // Create verification request automatically
        await this.verificationService.createVerificationRequest(user.id, {
          verificationType: VerificationType.email,
          additionalInfo: {
            email: user.email,
            verifiedAt: new Date().toISOString()
          }
        });

        return {
          message: 'Email verified successfully',
          verified: true
        };
      } else {
        throw new HttpException('Invalid verification token', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to verify email',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('address')
  async submitAddressVerification(
    @CurrentUser() user: User,
    @Body() addressVerificationDto: AddressVerificationDto
  ) {
    try {
      const verificationRequest = await this.verificationService.createVerificationRequest(user.id, {
        verificationType: VerificationType.address,
        documents: addressVerificationDto.documents || [],
        additionalInfo: {
          address: {
            street: addressVerificationDto.street,
            city: addressVerificationDto.city,
            state: addressVerificationDto.state,
            postalCode: addressVerificationDto.postalCode,
            country: addressVerificationDto.country
          }
        }
      });

      return {
        message: 'Address verification request submitted successfully',
        request: verificationRequest
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to submit address verification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin endpoints (would need role-based access control in production)
  @Get('admin/pending')
  async getPendingVerificationRequests(
    @CurrentUser() user: User,
    @Query() filters: VerificationFiltersDto
  ) {
    try {
      // TODO: Add admin role check
      const result = await this.verificationService.getPendingVerificationRequests(
        filters.page || 1,
        filters.limit || 20,
        filters.verificationType
      );

      return result;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve pending verification requests',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/review/:id')
  async reviewVerificationRequest(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() reviewDto: ReviewVerificationDto
  ) {
    try {
      // TODO: Add admin role check
      const reviewedRequest = await this.verificationService.reviewVerificationRequest(
        id,
        user.id,
        reviewDto
      );

      return {
        message: `Verification request ${reviewDto.status}`,
        request: reviewedRequest
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to review verification request',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('admin/stats')
  async getVerificationStats(@CurrentUser() user: User) {
    try {
      // TODO: Add admin role check
      const stats = await this.verificationService.getVerificationStats();
      return stats;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve verification statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}