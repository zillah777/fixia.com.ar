import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  BadRequestException,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload an image to Cloudinary' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload error' })
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file
    this.uploadService.validateImageFile(file);

    // Upload to Cloudinary
    const result = await this.uploadService.uploadImage(file, 'general');

    return {
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    };
  }

  @Post('avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload user avatar (optimized for profile pictures)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload error' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 avatar uploads per minute
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file
    this.uploadService.validateImageFile(file);

    // Upload avatar with specific transformations
    const result = await this.uploadService.uploadAvatar(file);

    return {
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    };
  }

  @Post('verification-document')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload verification document (DNI, passport, etc.)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Document uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or upload error' })
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 document uploads per minute
  @UseInterceptors(FileInterceptor('file'))
  async uploadVerificationDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file (images or PDFs for documents)
    this.uploadService.validateDocumentFile(file);

    // Upload to Cloudinary in verification folder (private/secure)
    const result = await this.uploadService.uploadImage(file, 'verification');

    return {
      success: true,
      message: 'Verification document uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        size: result.bytes,
      },
    };
  }

  @Delete('image/:publicId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an image from Cloudinary' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 400, description: 'Delete error' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async deleteImage(@Param('publicId') publicId: string) {
    // Decode public_id (it may contain forward slashes)
    const decodedPublicId = decodeURIComponent(publicId);

    await this.uploadService.deleteImage(decodedPublicId);

    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}
