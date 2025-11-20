import { Module } from '@nestjs/common';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceRequestsService } from './service-requests.service';
import { PrismaService } from '../common/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

/**
 * Service Requests Module
 * 
 * Handles service request functionality for the Professional Circuit.
 * Enables clients to request services and professionals to respond.
 */
@Module({
    imports: [NotificationsModule],
    controllers: [ServiceRequestsController],
    providers: [ServiceRequestsService, PrismaService],
    exports: [ServiceRequestsService],
})
export class ServiceRequestsModule { }
