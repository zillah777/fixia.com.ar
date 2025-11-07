import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('notifications')
@ApiTags('Notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  /**
   * GET /notifications - Get user notifications
   */
  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Default: 20' })
  @ApiQuery({ name: 'offset', required: false, type: 'number', description: 'Default: 0' })
  async getUserNotifications(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.notificationService.getUserNotifications(
      req.user.id,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * GET /notifications/unread - Get unread notification count
   */
  @Get('unread')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req) {
    return await this.notificationService.getUnreadCount(req.user.id);
  }

  /**
   * PUT /notifications/:notificationId/read - Mark notification as read
   */
  @Put(':notificationId/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'notificationId', type: 'string' })
  async markAsRead(@Param('notificationId') notificationId: string) {
    return await this.notificationService.markAsRead(notificationId);
  }

  /**
   * PUT /notifications/mark-all-read - Mark all notifications as read
   */
  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all user notifications as read' })
  async markAllAsRead(@Request() req) {
    return await this.notificationService.markAllAsRead(req.user.id);
  }

  /**
   * DELETE /notifications/:notificationId - Delete notification
   */
  @Delete(':notificationId')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'notificationId', type: 'string' })
  async deleteNotification(@Param('notificationId') notificationId: string) {
    return await this.notificationService.deleteNotification(notificationId);
  }
}
