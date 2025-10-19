import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ServicesModule } from './services/services.module';
import { ProjectsModule } from './projects/projects.module';
import { ContactModule } from './contact/contact.module';
import { CommonModule } from './common/common.module';
import { EmailModule } from './modules/email/email.module';
import { AdminModule } from './admin/admin.module';
import { JobsModule } from './jobs/jobs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TrustModule } from './trust/trust.module';
import { VerificationModule } from './verification/verification.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoriesModule } from './categories/categories.module';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minuto
          limit: 100, // 100 requests por minuto (general)
        },
      ],
    }),
    CommonModule,
    AuthModule,
    UsersModule,
    ServicesModule,
    ProjectsModule,
    ContactModule,
    EmailModule,
    AdminModule,
    JobsModule,
    ReviewsModule,
    TrustModule,
    VerificationModule,
    NotificationsModule,
    PaymentsModule,
    UploadModule,
    DashboardModule,
    CategoriesModule,
    FavoritesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}