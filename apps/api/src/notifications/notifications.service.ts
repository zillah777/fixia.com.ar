import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { NotificationType, Notification, User } from '@prisma/client';
import { CreateNotificationDto, UpdateNotificationDto, NotificationFiltersDto } from './dto/notification.dto';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    this.logger.log(`Creating notification for user: ${createNotificationDto.userId}`);

    const notification = await this.prisma.notification.create({
      data: {
        user_id: createNotificationDto.userId,
        type: createNotificationDto.type,
        title: createNotificationDto.title,
        message: createNotificationDto.message,
        action_url: createNotificationDto.actionUrl,
        read: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    this.logger.log(`Notification created: ${notification.id}`);

    // TODO: Emit real-time notification via WebSocket/SSE
    this.emitRealTimeNotification(notification);

    return notification;
  }

  async getUserNotifications(
    userId: string,
    filters: NotificationFiltersDto = {}
  ): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    unreadCount: number;
  }> {
    const {
      type,
      read,
      sortBy = 'newest',
      page = 1,
      limit = 20
    } = filters;

    const where = {
      user_id: userId,
      ...(type && { type }),
      ...(read !== undefined && { read })
    };

    const orderBy = this.getSortOrder(sortBy);

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: {
          user_id: userId,
          read: false
        }
      })
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        user_id: userId,
        read: false
      }
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    // Verify the notification belongs to the user
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        user_id: userId,
        read: false
      },
      data: { read: true }
    });

    return { count: result.count };
  }

  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // Verify the notification belongs to the user
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        user_id: userId
      }
    });

    if (!notification) {
      throw new Error('Notification not found or access denied');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId }
    });
  }

  async deleteAllNotifications(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.deleteMany({
      where: { user_id: userId }
    });

    return { count: result.count };
  }

  // Helper methods for creating specific types of notifications
  async createJobNotification(
    userId: string,
    type: 'job_started' | 'job_milestone' | 'job_completed',
    jobData: {
      jobId: string;
      jobTitle: string;
      clientName?: string;
      professionalName?: string;
    }
  ): Promise<Notification> {
    const notificationTemplates = {
      job_started: {
        title: 'Trabajo iniciado',
        message: `El trabajo "${jobData.jobTitle}" ha sido iniciado`,
        actionUrl: `/jobs/${jobData.jobId}`
      },
      job_milestone: {
        title: 'Hito completado',
        message: `Se ha completado un hito en "${jobData.jobTitle}"`,
        actionUrl: `/jobs/${jobData.jobId}`
      },
      job_completed: {
        title: 'Trabajo completado',
        message: `El trabajo "${jobData.jobTitle}" ha sido completado`,
        actionUrl: `/jobs/${jobData.jobId}`
      }
    };

    const template = notificationTemplates[type];

    return this.createNotification({
      userId,
      type: type as NotificationType,
      title: template.title,
      message: template.message,
      actionUrl: template.actionUrl
    });
  }

  async createReviewNotification(
    userId: string,
    reviewData: {
      reviewId: string;
      reviewerName: string;
      rating: number;
      professionalName?: string;
    }
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.review_received,
      title: 'Nueva reseña recibida',
      message: `${reviewData.reviewerName} te ha dejado una reseña de ${reviewData.rating} estrellas`,
      actionUrl: `/reviews`
    });
  }

  async createVerificationNotification(
    userId: string,
    status: 'approved' | 'rejected',
    verificationType: string
  ): Promise<Notification> {
    const templates = {
      approved: {
        title: 'Verificación aprobada',
        message: `Tu verificación de ${verificationType} ha sido aprobada`,
        actionUrl: '/verification'
      },
      rejected: {
        title: 'Verificación rechazada',
        message: `Tu verificación de ${verificationType} ha sido rechazada`,
        actionUrl: '/verification'
      }
    };

    const template = templates[status];

    return this.createNotification({
      userId,
      type: NotificationType.system,
      title: template.title,
      message: template.message,
      actionUrl: template.actionUrl
    });
  }

  async createProposalNotification(
    userId: string,
    proposalData: {
      proposalId: string;
      projectTitle: string;
      professionalName: string;
      amount: number;
    }
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.proposal_received,
      title: 'Nueva propuesta recibida',
      message: `${proposalData.professionalName} ha enviado una propuesta de $${proposalData.amount} para "${proposalData.projectTitle}"`,
      actionUrl: `/projects/${proposalData.proposalId}`
    });
  }

  async createMessageNotification(
    userId: string,
    messageData: {
      senderName: string;
      conversationId: string;
      preview: string;
    }
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.message,
      title: `Mensaje de ${messageData.senderName}`,
      message: messageData.preview,
      actionUrl: `/conversations/${messageData.conversationId}`
    });
  }

  async createPaymentNotification(
    userId: string,
    paymentData: {
      amount: number;
      jobTitle: string;
      jobId: string;
    }
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.payment_received,
      title: 'Pago recibido',
      message: `Has recibido un pago de $${paymentData.amount} por "${paymentData.jobTitle}"`,
      actionUrl: `/jobs/${paymentData.jobId}`
    });
  }

  // Bulk notification methods
  async createBulkNotifications(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const createdNotifications = [];

    for (const notification of notifications) {
      try {
        const created = await this.createNotification(notification);
        createdNotifications.push(created);
      } catch (error) {
        this.logger.error(`Failed to create bulk notification for user ${notification.userId}:`, error);
      }
    }

    return createdNotifications;
  }

  async notifyAllProfessionals(
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<{ count: number }> {
    const professionals = await this.prisma.user.findMany({
      where: { user_type: 'professional' },
      select: { id: true }
    });

    const notifications = professionals.map(professional => ({
      userId: professional.id,
      type: NotificationType.system,
      title,
      message,
      actionUrl
    }));

    const created = await this.createBulkNotifications(notifications);
    return { count: created.length };
  }

  async cleanOldNotifications(daysOld = 90): Promise<{ count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        created_at: {
          lt: cutoffDate
        },
        read: true
      }
    });

    this.logger.log(`Cleaned ${result.count} old notifications older than ${daysOld} days`);
    return { count: result.count };
  }

  // Real-time notification via WebSocket (now fully implemented with Socket.io)
  private emitRealTimeNotification(notification: Notification): void {
    try {
      // Emit to connected WebSocket clients immediately
      this.notificationsGateway.emitToUser(notification.user_id, notification);
      this.logger.log(`✅ Real-time notification emitted via WebSocket: ${notification.id} to user ${notification.user_id}`);
    } catch (error) {
      // WebSocket error - notification is already in DB, will be fetched on next poll
      this.logger.warn(`⚠️ Failed to emit real-time notification: ${error.message} (will be fetched on poll)`);
    }
  }

  private getSortOrder(sortBy: string) {
    switch (sortBy) {
      case 'oldest':
        return { created_at: 'asc' as const };
      case 'type':
        return { type: 'asc' as const, created_at: 'desc' as const };
      case 'newest':
      default:
        return { created_at: 'desc' as const };
    }
  }

  // Analytics and statistics
  async getNotificationStats(userId?: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    last7Days: number;
    last30Days: number;
  }> {
    const where = userId ? { user_id: userId } : {};

    const [total, unread, byType, last7Days, last30Days] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, read: false } }),
      this.getNotificationsByType(where),
      this.getNotificationsInLastDays(7, where),
      this.getNotificationsInLastDays(30, where)
    ]);

    return {
      total,
      unread,
      byType,
      last7Days,
      last30Days
    };
  }

  private async getNotificationsByType(where: any): Promise<Record<string, number>> {
    const results = await this.prisma.notification.groupBy({
      by: ['type'],
      where,
      _count: { type: true }
    });

    const byType: Record<string, number> = {};
    results.forEach(result => {
      byType[result.type] = result._count.type;
    });

    return byType;
  }

  private async getNotificationsInLastDays(days: number, where: any): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.prisma.notification.count({
      where: {
        ...where,
        created_at: {
          gte: cutoffDate
        }
      }
    });
  }
}