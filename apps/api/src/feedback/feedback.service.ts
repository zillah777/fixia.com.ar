import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { FeedbackResponseDto, TrustScoreDto } from './dto/feedback-response.dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Give feedback to another user
   */
  async giveFeedback(
    fromUserId: string,
    dto: CreateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    // Validate: Cannot give feedback to yourself
    if (fromUserId === dto.toUserId) {
      throw new BadRequestException('No puedes dar feedback a ti mismo');
    }

    // Validate: Target user exists
    const toUser = await this.prisma.user.findUnique({
      where: { id: dto.toUserId },
    });

    if (!toUser) {
      throw new NotFoundException('Usuario destinatario no encontrado');
    }

    // Validate: If job_id provided, check user is part of that job
    if (dto.jobId) {
      const job = await this.prisma.job.findUnique({
        where: { id: dto.jobId },
        select: {
          client_id: true,
          professional_id: true,
        },
      });

      if (!job) {
        throw new NotFoundException('Trabajo no encontrado');
      }

      const isPartOfJob =
        job.client_id === fromUserId || job.professional_id === fromUserId;
      const targetIsPartOfJob =
        job.client_id === dto.toUserId || job.professional_id === dto.toUserId;

      if (!isPartOfJob || !targetIsPartOfJob) {
        throw new ForbiddenException(
          'Solo puedes dar feedback sobre trabajos en los que participaste',
        );
      }

      // Check if feedback already exists for this job
      const existingFeedback = await this.prisma.feedback.findFirst({
        where: {
          from_user_id: fromUserId,
          to_user_id: dto.toUserId,
          job_id: dto.jobId,
        },
      });

      if (existingFeedback) {
        throw new ConflictException(
          'Ya has dado feedback para este trabajo y usuario',
        );
      }
    }

    // Create feedback
    const feedback = await this.prisma.feedback.create({
      data: {
        from_user_id: fromUserId,
        to_user_id: dto.toUserId,
        comment: dto.comment,
        has_like: dto.hasLike,
        job_id: dto.jobId,
        service_id: dto.serviceId,
      },
      include: {
        from_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
        to_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
      },
    });

    this.logger.log(
      `Feedback created: ${feedback.id} from ${fromUserId} to ${dto.toUserId}`,
    );

    return this.mapToResponseDto(feedback);
  }

  /**
   * Update existing feedback
   */
  async updateFeedback(
    feedbackId: string,
    userId: string,
    dto: UpdateFeedbackDto,
  ): Promise<FeedbackResponseDto> {
    // Find feedback
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback no encontrado');
    }

    // Validate: Only the author can update
    if (feedback.from_user_id !== userId) {
      throw new ForbiddenException('Solo puedes editar tu propio feedback');
    }

    // Update feedback
    const updated = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        comment: dto.comment !== undefined ? dto.comment : feedback.comment,
        has_like: dto.hasLike !== undefined ? dto.hasLike : feedback.has_like,
      },
      include: {
        from_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
        to_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
      },
    });

    this.logger.log(`Feedback updated: ${feedbackId} by ${userId}`);

    return this.mapToResponseDto(updated);
  }

  /**
   * Get all feedback received by a user
   */
  async getFeedbackReceived(userId: string): Promise<FeedbackResponseDto[]> {
    const feedbackList = await this.prisma.feedback.findMany({
      where: { to_user_id: userId },
      include: {
        from_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
        to_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return feedbackList.map((fb) => this.mapToResponseDto(fb));
  }

  /**
   * Get all feedback given by a user
   */
  async getFeedbackGiven(userId: string): Promise<FeedbackResponseDto[]> {
    const feedbackList = await this.prisma.feedback.findMany({
      where: { from_user_id: userId },
      include: {
        from_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
        to_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return feedbackList.map((fb) => this.mapToResponseDto(fb));
  }

  /**
   * Get feedback for a specific job
   */
  async getFeedbackForJob(jobId: string, userId: string): Promise<FeedbackResponseDto[]> {
    // Validate: User is part of the job
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        client_id: true,
        professional_id: true,
      },
    });

    if (!job) {
      throw new NotFoundException('Trabajo no encontrado');
    }

    const isPartOfJob =
      job.client_id === userId || job.professional_id === userId;

    if (!isPartOfJob) {
      throw new ForbiddenException(
        'Solo puedes ver feedback de trabajos en los que participaste',
      );
    }

    const feedbackList = await this.prisma.feedback.findMany({
      where: { job_id: jobId },
      include: {
        from_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
        to_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            user_type: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return feedbackList.map((fb) => this.mapToResponseDto(fb));
  }

  /**
   * Calculate trust score for a user
   */
  async calculateTrustScore(userId: string): Promise<TrustScoreDto> {
    const feedbackStats = await this.prisma.feedback.aggregate({
      where: { to_user_id: userId },
      _count: {
        id: true,
      },
      _sum: {
        has_like: true,
      },
    });

    const totalFeedback = feedbackStats._count.id || 0;
    const totalLikes = feedbackStats._sum.has_like || 0;
    const trustPercentage =
      totalFeedback > 0 ? (totalLikes / totalFeedback) * 100 : 0;

    return {
      userId,
      totalLikes,
      totalFeedback,
      trustPercentage: Number(trustPercentage.toFixed(1)),
    };
  }

  /**
   * Delete feedback
   */
  async deleteFeedback(feedbackId: string, userId: string): Promise<void> {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback no encontrado');
    }

    // Only the author can delete
    if (feedback.from_user_id !== userId) {
      throw new ForbiddenException('Solo puedes eliminar tu propio feedback');
    }

    await this.prisma.feedback.delete({
      where: { id: feedbackId },
    });

    this.logger.log(`Feedback deleted: ${feedbackId} by ${userId}`);
  }

  /**
   * Map Prisma feedback to response DTO
   */
  private mapToResponseDto(feedback: any): FeedbackResponseDto {
    return {
      id: feedback.id,
      fromUser: {
        id: feedback.from_user.id,
        name: feedback.from_user.name,
        avatar: feedback.from_user.avatar,
        userType: feedback.from_user.user_type,
      },
      toUser: {
        id: feedback.to_user.id,
        name: feedback.to_user.name,
        avatar: feedback.to_user.avatar,
        userType: feedback.to_user.user_type,
      },
      comment: feedback.comment,
      hasLike: feedback.has_like,
      jobId: feedback.job_id,
      serviceId: feedback.service_id,
      createdAt: feedback.created_at,
      updatedAt: feedback.updated_at,
    };
  }
}
