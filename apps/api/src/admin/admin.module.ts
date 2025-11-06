import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { MigrationController } from './migration.controller';
import { MigrationCleanupController } from './migration-cleanup.controller';
import { PrismaService } from '../common/prisma.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [CategoriesModule],
  controllers: [AdminController, MigrationController, MigrationCleanupController],
  providers: [PrismaService],
})
export class AdminModule {}