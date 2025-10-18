import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get recent activity for a user
   */
  async getRecentActivity(userId: string, limit: number = 10) {
    try {
      // Query user_activity table
      const activities = await this.prisma.userActivity.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: limit,
      });

      // Transform to frontend format
      return activities.map(activity => ({
        id: activity.id,
        type: this.mapActivityType(activity.action), // 'action' is the correct field name
        title: this.getActivityTitle(activity.action, activity.metadata),
        description: this.getActivityDescription(activity.action),
        created_at: activity.created_at.toISOString(),
        time: activity.created_at.toISOString(),
        status: 'read',
        metadata: activity.metadata,
      }));
    } catch (error) {
      this.logger.error(`Error fetching recent activity for user ${userId}:`, error);
      // Return empty array instead of throwing to avoid breaking the dashboard
      return [];
    }
  }

  /**
   * Get current active projects for a user
   */
  async getCurrentProjects(userId: string, limit: number = 5) {
    try {
      // Get user type to determine which projects to show
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { user_type: true },
      });

      if (!user) {
        return [];
      }

      // Get active jobs based on user type
      const jobs = await this.prisma.job.findMany({
        where: {
          OR: [
            { client_id: userId },
            { professional_id: userId },
          ],
          status: {
            in: ['not_started', 'in_progress', 'milestone_review'],
          },
        },
        include: {
          project: {
            select: {
              title: true,
              description: true,
            },
          },
          client: {
            select: {
              name: true,
            },
          },
          professional: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: limit,
      });

      // Transform to frontend format
      return jobs.map(job => ({
        id: job.id,
        title: job.title, // Use job title directly
        client_name: user.user_type === 'professional' ? job.client.name : job.professional.name,
        progress: this.calculateProgress(job.status),
        deadline: job.delivery_date?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: job.status,
        price: Number(job.agreed_price),
        currency: job.currency || 'ARS',
      }));
    } catch (error) {
      this.logger.error(`Error fetching current projects for user ${userId}:`, error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Map activity type from database to frontend format
   */
  private mapActivityType(dbType: string): string {
    const typeMap: Record<string, string> = {
      service_created: 'service_created',
      service_viewed: 'profile_view',
      proposal_sent: 'proposal',
      proposal_received: 'proposal',
      job_started: 'order',
      job_completed: 'order',
      payment_sent: 'payment',
      payment_received: 'payment',
      review_given: 'review',
      review_received: 'review',
      message_sent: 'message',
      message_received: 'message',
    };

    return typeMap[dbType] || 'profile_view';
  }

  /**
   * Get activity title based on type
   */
  private getActivityTitle(type: string, _metadata?: any): string {
    const titles: Record<string, string> = {
      service_created: 'Nuevo servicio creado',
      service_viewed: 'Perfil visualizado',
      proposal_sent: 'Propuesta enviada',
      proposal_received: 'Nueva propuesta recibida',
      job_started: 'Trabajo iniciado',
      job_completed: 'Trabajo completado',
      payment_sent: 'Pago enviado',
      payment_received: 'Pago recibido',
      review_given: 'Reseña publicada',
      review_received: 'Nueva reseña recibida',
      message_sent: 'Mensaje enviado',
      message_received: 'Nuevo mensaje',
    };

    return titles[type] || 'Actividad reciente';
  }

  /**
   * Get activity description
   */
  private getActivityDescription(type: string): string {
    const descriptions: Record<string, string> = {
      service_created: 'Has creado un nuevo servicio',
      service_viewed: 'Alguien vio tu perfil',
      proposal_sent: 'Enviaste una propuesta a un cliente',
      proposal_received: 'Recibiste una nueva propuesta',
      job_started: 'Un trabajo ha comenzado',
      job_completed: 'Un trabajo ha sido completado',
      payment_sent: 'Realizaste un pago',
      payment_received: 'Recibiste un pago',
      review_given: 'Dejaste una reseña',
      review_received: 'Recibiste una nueva reseña',
      message_sent: 'Enviaste un mensaje',
      message_received: 'Tienes un nuevo mensaje',
    };

    return descriptions[type] || 'Actividad en tu cuenta';
  }

  /**
   * Calculate progress percentage based on job status
   */
  private calculateProgress(status: string): number {
    const progressMap: Record<string, number> = {
      not_started: 0,
      in_progress: 50,
      milestone_review: 75,
      completed: 100,
      cancelled: 0,
    };

    return progressMap[status] || 0;
  }
}
