import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Job } from '../jobs/entities/job.entity';
import { Review } from '../reviews/entities/review.entity';
import { ContactRequest } from '../contact/entities/contact-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Service,
      Job,
      Review,
      ContactRequest,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
