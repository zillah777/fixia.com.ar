import { Module } from '@nestjs/common';
import { MatchService } from './match.service';
import { PhoneRevealService } from './phone-reveal.service';
import { ReviewService } from './review.service';
import { NotificationService } from './notification.service';
import { ReviewModerationService } from './review-moderation.service';
import { MatchController } from './match.controller';
import { NotificationController } from './notification.controller';
import { ReviewModerationController } from './review-moderation.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  providers: [MatchService, PhoneRevealService, ReviewService, NotificationService, ReviewModerationService, PrismaService],
  controllers: [MatchController, NotificationController, ReviewModerationController],
  exports: [MatchService, PhoneRevealService, ReviewService, NotificationService, ReviewModerationService],
})
export class MatchingModule {}
