import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, user_type: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isProfessional = user.user_type === 'professional';

    // Get services count (for professionals)
    const total_services = isProfessional
      ? await this.prisma.service.count({
          where: { user_id: userId, is_active: true },
        })
      : 0;

    // Get active projects count
    const active_projects = await this.prisma.job.count({
      where: isProfessional
        ? {
            professional_id: userId,
            status: { in: ['in_progress', 'milestone_review'] },
          }
        : {
            client_id: userId,
            status: { in: ['in_progress', 'milestone_review'] },
          },
    });

    // Get total earnings (for professionals)
    let total_earnings = 0;
    if (isProfessional) {
      const earningsQuery = await this.prisma.job.aggregate({
        where: {
          professional_id: userId,
          status: 'completed',
        },
        _sum: {
          agreed_price: true,
        },
      });
      total_earnings = earningsQuery._sum.agreed_price || 0;
    }

    // Get average rating (for professionals)
    let average_rating = 0;
    let review_count = 0;
    if (isProfessional) {
      const ratingQuery = await this.prisma.review.aggregate({
        where: {
          professional_id: userId,
          moderation_status: 'approved',
        },
        _avg: {
          rating: true,
        },
        _count: {
          id: true,
        },
      });
      average_rating = ratingQuery._avg.rating || 0;
      review_count = ratingQuery._count.id;
    }

    // Get profile views (placeholder - would need tracking table)
    const profile_views = 0;

    // Get messages count
    const messages_count = await this.prisma.contactInteraction.count({
      where: isProfessional
        ? { professional_id: userId }
        : { client_id: userId },
    });

    // Get pending proposals count (for professionals)
    const pending_proposals = isProfessional
      ? await this.prisma.proposal.count({
          where: {
            professional_id: userId,
            status: 'pending',
          },
        })
      : 0;

    return {
      total_services,
      active_projects,
      total_earnings,
      average_rating,
      review_count,
      profile_views,
      messages_count,
      pending_proposals,
      stats_change: {
        earnings_change: '+12%',
        projects_change: '+8%',
        services_change: '+15%',
      },
    };
  }

  /**
   * Get recent activity for a user
   */
  async getRecentActivity(userId: string, limit = 10) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const activities = [];
    const isProfessional = user.user_type === 'professional';

    // Get recent jobs
    const recentJobs = await this.prisma.job.findMany({
      where: isProfessional
        ? { professional_id: userId }
        : { client_id: userId },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        client: { select: { name: true } },
        professional: { select: { name: true } },
      },
    });

    for (const job of recentJobs) {
      activities.push({
        id: job.id,
        type: 'order',
        title: isProfessional ? 'Nuevo trabajo' : 'Trabajo iniciado',
        description: job.title,
        time: this.getRelativeTime(job.created_at),
        created_at: job.created_at.toISOString(),
        status: job.status,
      });
    }

    // Get recent reviews
    if (isProfessional) {
      const recentReviews = await this.prisma.review.findMany({
        where: { professional_id: userId },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: {
          reviewer: { select: { name: true } },
        },
      });

      for (const review of recentReviews) {
        activities.push({
          id: review.id,
          type: 'review',
          title: 'Nueva reseña',
          description: `${review.reviewer.name} te dejó una reseña de ${review.rating} estrellas`,
          time: this.getRelativeTime(review.created_at),
          created_at: review.created_at.toISOString(),
          status: review.moderation_status,
        });
      }
    }

    // Get recent proposals
    if (isProfessional) {
      const recentProposals = await this.prisma.proposal.findMany({
        where: { professional_id: userId },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: {
          project: { select: { title: true } },
        },
      });

      for (const proposal of recentProposals) {
        activities.push({
          id: proposal.id,
          type: 'proposal',
          title: 'Propuesta enviada',
          description: proposal.project.title,
          time: this.getRelativeTime(proposal.created_at),
          created_at: proposal.created_at.toISOString(),
          status: proposal.status,
        });
      }
    }

    // Sort by date and limit
    activities.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return activities.slice(0, limit);
  }

  /**
   * Get current projects for a user
   */
  async getCurrentProjects(userId: string, limit = 5) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { user_type: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isProfessional = user.user_type === 'professional';

    const projects = await this.prisma.job.findMany({
      where: isProfessional
        ? {
            professional_id: userId,
            status: { in: ['in_progress', 'milestone_review'] },
          }
        : {
            client_id: userId,
            status: { in: ['in_progress', 'milestone_review'] },
          },
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        client: { select: { name: true } },
        professional: { select: { name: true } },
      },
    });

    return projects.map((job) => ({
      id: job.id,
      title: job.title,
      client_name: isProfessional ? job.client.name : job.professional.name,
      progress: job.progress_percentage,
      deadline: job.delivery_date?.toISOString() || null,
      status: job.status,
      price: job.agreed_price,
      currency: job.currency,
    }));
  }

  /**
   * Helper to get relative time
   */
  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  }
}
