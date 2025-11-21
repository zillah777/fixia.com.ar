import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserStatsService } from './user-stats.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserStatsService, PrismaService],
  exports: [UsersService, UserStatsService],
})
export class UsersModule { }