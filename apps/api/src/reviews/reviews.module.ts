import { Module, forwardRef } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';
import { TrustModule } from '../trust/trust.module';

@Module({
  imports: [CommonModule, AuthModule, forwardRef(() => TrustModule)],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}