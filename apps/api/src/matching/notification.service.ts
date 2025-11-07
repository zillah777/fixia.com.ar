import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface CreateNotificationPayload {
  user_id: string;
  type: 'match_created' | 'match_completed' | 'phone_revealed' | 'review_requested' | 'review_received';
  title: string;
  message: string;
  action_url?: string;
}

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a notification for a user
   */
  async createNotification(payload: CreateNotificationPayload) {
    return this.prisma.notification.create({
      data: {
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        action_url: payload.action_url,
        read: false,
      },
    });
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ) {
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({
        where: { user_id: userId },
      }),
    ]);

    return {
      notifications,
      total,
      limit,
      offset,
      unread_count: notifications.filter((n) => !n.read).length,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { user_id: userId, read: false },
      data: { read: true },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId },
    });
  }

  /**
   * Send review notification
   */
  async notifyReviewReceived(reviewedUserId: string, reviewerName: string, matchId: string) {
    return this.createNotification({
      user_id: reviewedUserId,
      type: 'review_received',
      title: `${reviewerName} te dejó una calificación`,
      message: `Revisa la reseña que te dejó en tu último match`,
      action_url: `/match/${matchId}`,
    });
  }

  /**
   * Send match created notification
   */
  async notifyMatchCreated(userId: string, oppositePartyName: string, matchId: string) {
    return this.createNotification({
      user_id: userId,
      type: 'match_created',
      title: '¡Nuevo Match!',
      message: `Conectaste con ${oppositePartyName}. Ya puedes revelar el WhatsApp.`,
      action_url: `/match/${matchId}`,
    });
  }

  /**
   * Send completion request notification
   */
  async notifyCompletionRequested(
    userId: string,
    requesterName: string,
    matchId: string,
  ) {
    return this.createNotification({
      user_id: userId,
      type: 'match_completed',
      title: `${requesterName} marcó el servicio como completado`,
      message: 'Confirma que el trabajo está completo para habilitar calificaciones',
      action_url: `/match/${matchId}`,
    });
  }

  /**
   * Send both parties notifications when match is completed
   */
  async notifyMatchCompleted(
    clientId: string,
    professionalId: string,
    clientName: string,
    professionalName: string,
    matchId: string,
  ) {
    await Promise.all([
      this.createNotification({
        user_id: clientId,
        type: 'match_completed',
        title: '¡Servicio Completado!',
        message: `Ambos confirmaron que el trabajo con ${professionalName} está completo. Ahora puedes dejar una calificación.`,
        action_url: `/match/${matchId}`,
      }),
      this.createNotification({
        user_id: professionalId,
        type: 'match_completed',
        title: '¡Servicio Completado!',
        message: `Ambos confirmaron que el trabajo con ${clientName} está completo. Ahora puedes dejar una calificación.`,
        action_url: `/match/${matchId}`,
      }),
    ]);
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: {
        user_id: userId,
        read: false,
      },
    });

    return { unread_count: count };
  }
}
