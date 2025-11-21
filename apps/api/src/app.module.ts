import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { CommonModule } from './common/common.module';
import { RedisModule } from './common/redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
// REMOVED: ReviewsModule - replaced with new Feedback system
// import { ReviewsModule } from './reviews/reviews.module';
import { FeedbackModule } from './feedback/feedback.module';
import { TrustModule } from './trust/trust.module';
import { VerificationModule } from './verification/verification.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { MatchingModule } from './matching/matching.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module'; // NEW
import { PortfolioModule } from './portfolio/portfolio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Global rate limiting - production-ready configuration
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 3,  // 3 requests per second (burst protection)
        },
        {
          name: 'medium',
          ttl: 60000, // 1 minute
          limit: 20,  // 20 requests per minute (general API)
        },
        {
          name: 'long',
          ttl: 900000, // 15 minutes
          limit: 100, // 100 requests per 15 minutes (sustained usage)
        },
      ],
    }),
    RedisModule, // Redis for distributed rate limiting and caching
    CommonModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    MatchingModule, // NEW: Matchmaking and phone reveal system
    ServiceRequestsModule, // NEW: Service requests for Professional Circuit
    PortfolioModule,
    ProjectsModule,
    ContactModule,
    EmailModule,
    AdminModule,
    JobsModule,
    FeedbackModule, // NEW: Mutual feedback system replacing reviews
    TrustModule,
    VerificationModule,
    NotificationsModule,
    PaymentsModule,
    UploadModule,
    DashboardModule,
    CategoriesModule,
    FavoritesModule,
    SubscriptionModule, // NEW: Subscription and dual roles system
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }