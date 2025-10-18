import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  HttpStatus, 
  HttpException,
  ParseIntPipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  NotificationFiltersDto,
  BulkActionDto,
  BulkNotificationDto
} from './dto/notification.dto';
import { User } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(
    @CurrentUser() user: User,
    @Body() createNotificationDto: CreateNotificationDto
  ) {
    try {
      // Only allow users to create notifications for themselves or add admin check
      if (createNotificationDto.userId !== user.id) {
        throw new HttpException('Unauthorized to create notification for other users', HttpStatus.FORBIDDEN);
      }

      const notification = await this.notificationsService.createNotification(createNotificationDto);
      
      return {
        message: 'Notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query() filters: NotificationFiltersDto
  ) {
    try {
      const result = await this.notificationsService.getUserNotifications(user.id, filters);
      return result;
    } catch (error) {
      // Graceful degradation: return empty array instead of throwing error
      console.error('Error fetching notifications:', error.message);
      return {
        notifications: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0
        }
      };
    }
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: User) {
    try {
      const count = await this.notificationsService.getUnreadCount(user.id);
      return { unreadCount: count };
    } catch (error) {
      // Graceful degradation: return 0 instead of throwing error
      console.error('Error fetching unread count:', error.message);
      return { unreadCount: 0 };
    }
  }

  @Get('stats')
  async getMyNotificationStats(@CurrentUser() user: User) {
    try {
      const stats = await this.notificationsService.getNotificationStats(user.id);
      return stats;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve notification statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async getNotification(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      // First check if the notification exists and belongs to the user
      const notifications = await this.notificationsService.getUserNotifications(user.id, {});
      const notification = notifications.notifications.find(n => n.id === id);
      
      if (!notification) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }

      return { notification };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async updateNotification(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    try {
      // For basic updates, we'll typically just mark as read/unread
      if (updateNotificationDto.read !== undefined) {
        if (updateNotificationDto.read) {
          const notification = await this.notificationsService.markAsRead(id, user.id);
          return {
            message: 'Notification marked as read',
            notification
          };
        }
        // If we want to mark as unread, we'd need to add that method to the service
      }

      return {
        message: 'Notification updated successfully'
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      const notification = await this.notificationsService.markAsRead(id, user.id);
      return {
        message: 'Notification marked as read',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to mark notification as read',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('mark-all-read')
  async markAllAsRead(@CurrentUser() user: User) {
    try {
      const result = await this.notificationsService.markAllAsRead(user.id);
      return {
        message: `${result.count} notifications marked as read`,
        count: result.count
      };
    } catch (error) {
      throw new HttpException(
        'Failed to mark all notifications as read',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string, @CurrentUser() user: User) {
    try {
      await this.notificationsService.deleteNotification(id, user.id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete()
  async deleteAllNotifications(@CurrentUser() user: User) {
    try {
      const result = await this.notificationsService.deleteAllNotifications(user.id);
      return {
        message: `${result.count} notifications deleted successfully`,
        count: result.count
      };
    } catch (error) {
      throw new HttpException(
        'Failed to delete all notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('bulk-action')
  async performBulkAction(
    @CurrentUser() user: User,
    @Body() bulkActionDto: BulkActionDto
  ) {
    try {
      let result;
      let message;

      switch (bulkActionDto.action) {
        case 'mark_read':
          // We'd need to implement bulk mark as read in the service
          result = await Promise.all(
            bulkActionDto.notificationIds.map(id => 
              this.notificationsService.markAsRead(id, user.id).catch(() => null)
            )
          );
          const readCount = result.filter(r => r !== null).length;
          message = `${readCount} notifications marked as read`;
          break;

        case 'delete':
          // We'd need to implement bulk delete in the service
          result = await Promise.all(
            bulkActionDto.notificationIds.map(id => 
              this.notificationsService.deleteNotification(id, user.id).catch(() => null)
            )
          );
          const deleteCount = bulkActionDto.notificationIds.length;
          message = `${deleteCount} notifications deleted`;
          break;

        default:
          throw new HttpException('Invalid bulk action', HttpStatus.BAD_REQUEST);
      }

      return { message, result };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to perform bulk action',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper endpoints for creating specific notification types
  @Post('job')
  async createJobNotification(
    @CurrentUser() user: User,
    @Body() jobData: {
      userId: string;
      type: 'job_started' | 'job_milestone' | 'job_completed';
      jobId: string;
      jobTitle: string;
      clientName?: string;
      professionalName?: string;
    }
  ) {
    try {
      // Basic permission check - users can create job notifications for themselves
      if (jobData.userId !== user.id) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      }

      const notification = await this.notificationsService.createJobNotification(
        jobData.userId,
        jobData.type,
        {
          jobId: jobData.jobId,
          jobTitle: jobData.jobTitle,
          clientName: jobData.clientName,
          professionalName: jobData.professionalName
        }
      );

      return {
        message: 'Job notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create job notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('review')
  async createReviewNotification(
    @CurrentUser() user: User,
    @Body() reviewData: {
      userId: string;
      reviewId: string;
      reviewerName: string;
      rating: number;
      professionalName?: string;
    }
  ) {
    try {
      const notification = await this.notificationsService.createReviewNotification(
        reviewData.userId,
        {
          reviewId: reviewData.reviewId,
          reviewerName: reviewData.reviewerName,
          rating: reviewData.rating,
          professionalName: reviewData.professionalName
        }
      );

      return {
        message: 'Review notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create review notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('verification')
  async createVerificationNotification(
    @CurrentUser() user: User,
    @Body() verificationData: {
      userId: string;
      status: 'approved' | 'rejected';
      verificationType: string;
    }
  ) {
    try {
      const notification = await this.notificationsService.createVerificationNotification(
        verificationData.userId,
        verificationData.status,
        verificationData.verificationType
      );

      return {
        message: 'Verification notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create verification notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('proposal')
  async createProposalNotification(
    @CurrentUser() user: User,
    @Body() proposalData: {
      userId: string;
      proposalId: string;
      projectTitle: string;
      professionalName: string;
      amount: number;
    }
  ) {
    try {
      const notification = await this.notificationsService.createProposalNotification(
        proposalData.userId,
        {
          proposalId: proposalData.proposalId,
          projectTitle: proposalData.projectTitle,
          professionalName: proposalData.professionalName,
          amount: proposalData.amount
        }
      );

      return {
        message: 'Proposal notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create proposal notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('message')
  async createMessageNotification(
    @CurrentUser() user: User,
    @Body() messageData: {
      userId: string;
      senderName: string;
      conversationId: string;
      preview: string;
    }
  ) {
    try {
      const notification = await this.notificationsService.createMessageNotification(
        messageData.userId,
        {
          senderName: messageData.senderName,
          conversationId: messageData.conversationId,
          preview: messageData.preview
        }
      );

      return {
        message: 'Message notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create message notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('payment')
  async createPaymentNotification(
    @CurrentUser() user: User,
    @Body() paymentData: {
      userId: string;
      amount: number;
      jobTitle: string;
      jobId: string;
    }
  ) {
    try {
      const notification = await this.notificationsService.createPaymentNotification(
        paymentData.userId,
        {
          amount: paymentData.amount,
          jobTitle: paymentData.jobTitle,
          jobId: paymentData.jobId
        }
      );

      return {
        message: 'Payment notification created successfully',
        notification
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create payment notification',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Admin endpoints (would need role-based access control in production)
  @Get('admin/all')
  async getAllNotifications(
    @CurrentUser() user: User,
    @Query() filters: NotificationFiltersDto
  ) {
    try {
      // TODO: Add admin role check
      const result = await this.notificationsService.getNotificationStats();
      return result;
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve all notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/bulk-notify')
  async sendBulkNotification(
    @CurrentUser() user: User,
    @Body() bulkNotificationDto: BulkNotificationDto
  ) {
    try {
      // TODO: Add admin role check
      const notifications = bulkNotificationDto.userIds.map(userId => ({
        userId,
        type: bulkNotificationDto.type,
        title: bulkNotificationDto.title,
        message: bulkNotificationDto.message,
        actionUrl: bulkNotificationDto.actionUrl
      }));

      const created = await this.notificationsService.createBulkNotifications(notifications);
      
      return {
        message: `${created.length} notifications sent successfully`,
        count: created.length
      };
    } catch (error) {
      throw new HttpException(
        'Failed to send bulk notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('admin/notify-professionals')
  async notifyAllProfessionals(
    @CurrentUser() user: User,
    @Body() notificationData: {
      title: string;
      message: string;
      actionUrl?: string;
    }
  ) {
    try {
      // TODO: Add admin role check
      const result = await this.notificationsService.notifyAllProfessionals(
        notificationData.title,
        notificationData.message,
        notificationData.actionUrl
      );

      return {
        message: `Notification sent to ${result.count} professionals`,
        count: result.count
      };
    } catch (error) {
      throw new HttpException(
        'Failed to notify professionals',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete('admin/cleanup')
  async cleanupOldNotifications(
    @CurrentUser() user: User,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ) {
    try {
      // TODO: Add admin role check
      const result = await this.notificationsService.cleanOldNotifications(days || 90);
      
      return {
        message: `${result.count} old notifications cleaned up`,
        count: result.count
      };
    } catch (error) {
      throw new HttpException(
        'Failed to cleanup old notifications',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}