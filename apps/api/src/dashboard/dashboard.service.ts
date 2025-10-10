import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Job } from '../jobs/entities/job.entity';
import { Review } from '../reviews/entities/review.entity';
import { ContactRequest } from '../contact/entities/contact-request.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(ContactRequest)
    private readonly contactRequestRepository: Repository<ContactRequest>,
  ) {}

  /**
   * Get dashboard statistics for a user
   */
  async getDashboardStats(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'user_type'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isProfessional = user.user_type === 'professional';

    // Get services count (for professionals)
    const total_services = isProfessional
      ? await this.serviceRepository.count({
          where: { user: { id: userId }, is_active: true },
        })
      : 0;

    // Get active projects count
    const active_projects = await this.jobRepository.count({
      where: isProfessional
        ? {
            professional: { id: userId },
            status: 'in_progress' as any,
          }
        : {
            client: { id: userId },
            status: 'in_progress' as any,
          },
    });

    // Get total earnings (for professionals)
    const earningsQuery = isProfessional
      ? await this.jobRepository
          .createQueryBuilder('job')
          .select('SUM(job.agreed_price)', 'total')
          .where('job.professional_id = :userId', { userId })
          .andWhere('job.status = :status', { status: 'completed' })
          .getRawOne()
      : { total: 0 };

    const total_earnings = parseFloat(earningsQuery?.total || '0');

    // Get average rating (for professionals)
    let average_rating = 0;
    let review_count = 0;

    if (isProfessional) {
      const ratingQuery = await this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'average')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.professional_id = :userId', { userId })
        .getRawOne();

      average_rating = parseFloat(ratingQuery?.average || '0');
      review_count = parseInt(ratingQuery?.count || '0', 10);
    }

    // Get profile views (mock for now - would need analytics table)
    const profile_views = 0;

    // Get messages count (pending contact requests)
    const messages_count = await this.contactRequestRepository.count({
      where: {
        professional: { id: userId },
        status: 'pending' as any,
      },
    });

    // Get pending proposals (for professionals)
    const pending_proposals = 0; // TODO: Implement proposals table

    return {
      total_services,
      active_projects,
      total_earnings,
      average_rating: Math.round(average_rating * 10) / 10,
      review_count,
      profile_views,
      messages_count,
      pending_proposals,
      stats_change: {
        earnings_change: '+12.3%', // TODO: Calculate real change
        projects_change: '+2',
        views_change: '+8',
        rating_change: '+0.2',
      },
    };
  }

  /**
   * Get recent activity for a user
   */
  async getRecentActivity(userId: string, limit: number = 10) {
    const activities: any[] = [];

    // Get recent jobs
    const recentJobs = await this.jobRepository.find({
      where: [
        { professional: { id: userId } },
        { client: { id: userId } },
      ],
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['professional', 'client'],
    });

    for (const job of recentJobs) {
      const isProfessional = job.professional.id === userId;

      activities.push({
        id: `job_${job.id}`,
        type: 'order',
        title: isProfessional ? 'Nuevo trabajo asignado' : 'Trabajo contratado',
        description: `${job.title} - ${isProfessional ? `Cliente: ${job.client.name}` : `Profesional: ${job.professional.name}`}`,
        time: job.created_at.toISOString(),
        created_at: job.created_at.toISOString(),
        status: job.status === 'not_started' ? 'new' : undefined,
        metadata: { jobId: job.id },
      });
    }

    // Get recent reviews
    const recentReviews = await this.reviewRepository.find({
      where: { professional: { id: userId } },
      order: { created_at: 'DESC' },
      take: Math.min(limit, 5),
      relations: ['client'],
    });

    for (const review of recentReviews) {
      activities.push({
        id: `review_${review.id}`,
        type: 'review',
        title: 'Nueva reseña recibida',
        description: `${review.rating} estrellas - "${review.comment?.substring(0, 50)}${review.comment && review.comment.length > 50 ? '...' : ''}"`,
        time: review.created_at.toISOString(),
        created_at: review.created_at.toISOString(),
        status: undefined,
        metadata: { reviewId: review.id },
      });
    }

    // Get recent contact requests
    const recentContacts = await this.contactRequestRepository.find({
      where: { professional: { id: userId } },
      order: { created_at: 'DESC' },
      take: Math.min(limit, 5),
      relations: ['client'],
    });

    for (const contact of recentContacts) {
      activities.push({
        id: `contact_${contact.id}`,
        type: 'message',
        title: 'Nueva solicitud de contacto',
        description: `${contact.client.name} te ha enviado una solicitud`,
        time: contact.created_at.toISOString(),
        created_at: contact.created_at.toISOString(),
        status: contact.status === 'pending' ? 'new' : undefined,
        metadata: { contactId: contact.id },
      });
    }

    // Sort all activities by date and limit
    activities.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return activities.slice(0, limit);
  }

  /**
   * Get current active projects for a user
   */
  async getCurrentProjects(userId: string, limit: number = 5) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'user_type'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isProfessional = user.user_type === 'professional';

    const jobs = await this.jobRepository.find({
      where: isProfessional
        ? {
            professional: { id: userId },
            status: 'in_progress' as any,
          }
        : {
            client: { id: userId },
            status: 'in_progress' as any,
          },
      order: { created_at: 'DESC' },
      take: limit,
      relations: ['professional', 'client', 'milestones'],
    });

    return jobs.map((job) => {
      // Calculate progress based on milestones
      const totalMilestones = job.milestones?.length || 0;
      const completedMilestones = job.milestones?.filter((m) => m.completed).length || 0;
      const progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : job.progress_percentage || 0;

      return {
        id: job.id,
        title: job.title,
        client_name: isProfessional ? job.client.name : job.professional.name,
        progress,
        deadline: job.delivery_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: job.status,
        price: job.agreed_price,
        currency: job.currency || 'ARS',
      };
    });
  }
}
