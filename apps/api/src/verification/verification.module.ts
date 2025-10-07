import { Module, forwardRef } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { TrustModule } from '../trust/trust.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    CommonModule, 
    AuthModule, 
    forwardRef(() => TrustModule),
    NotificationsModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/verification',
        filename: (req, file, cb) => {
          // Generate unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Allow images and PDFs
        const allowedMimes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'application/pdf'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only images and PDF files are allowed'), false);
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10 // Maximum 10 files per request
      }
    })
  ],
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}