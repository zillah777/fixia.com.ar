import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMatchReviewDto, UpdateMatchReviewDto, ReviewStatsDto } from './dto/review.dto';
import { NotificationService } from './notification.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create a review for a match
   * Only available after both parties confirm service completion
   */
  async createReview(
    matchId: string,
    reviewerId: string,
    dto: CreateMatchReviewDto,
  ) {
    // Verify match exists and both parties confirmed completion
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        client: true,
        professional: true,
      },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    // Check reviewer is part of the match
    const isClient = match.client_id === reviewerId;
    const isProfessional = match.professional_id === reviewerId;

    if (!isClient && !isProfessional) {
      throw new ForbiddenException('You are not part of this match');
    }

    // Determine reviewed user (opposite party)
    const reviewed_user_id = isClient ? match.professional_id : match.client_id;

    // Check if reviewer already left a review
    const existingReview = await this.prisma.matchReview.findUnique({
      where: {
        match_id_reviewer_id: {
          match_id: matchId,
          reviewer_id: reviewerId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You already left a review for this match');
    }

    // Verify completion status in job
    // IMPORTANTE: Si el match fue creado con job_id, DEBE validarse la completación
    // Si no hay job_id, es un match antiguo y no se puede validar completación
    if (match.job_id) {
      const job = await this.prisma.job.findUnique({
        where: { id: match.job_id },
      });

      if (!job) {
        throw new NotFoundException(`Associated job ${match.job_id} not found`);
      }

      // Require BOTH completion confirmation fields to be set
      if (!job.completion_confirmed_by || !job.completion_confirmed_at) {
        throw new BadRequestException(
          'Both parties must confirm service completion before leaving reviews. ' +
          'Wait for the opposite party to confirm completion.'
        );
      }
    } else {
      // Match sin job_id: validar que match.status sea 'completed'
      if (match.status !== 'completed') {
        throw new BadRequestException(
          'Match must be marked as completed before leaving reviews'
        );
      }
    }

    // Validate ratings are between 1-5
    if (
      dto.overall_rating < 1 ||
      dto.overall_rating > 5 ||
      (dto.communication_rating && (dto.communication_rating < 1 || dto.communication_rating > 5)) ||
      (dto.quality_rating && (dto.quality_rating < 1 || dto.quality_rating > 5)) ||
      (dto.professionalism_rating &&
        (dto.professionalism_rating < 1 || dto.professionalism_rating > 5)) ||
      (dto.timeliness_rating && (dto.timeliness_rating < 1 || dto.timeliness_rating > 5))
    ) {
      throw new BadRequestException('All ratings must be between 1 and 5');
    }

    // Create review
    const review = await this.prisma.matchReview.create({
      data: {
        match_id: matchId,
        reviewer_id: reviewerId,
        reviewed_user_id,
        overall_rating: dto.overall_rating,
        communication_rating: dto.communication_rating,
        quality_rating: dto.quality_rating,
        professionalism_rating: dto.professionalism_rating,
        timeliness_rating: dto.timeliness_rating,
        comment: dto.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviewed_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update professional profile rating if reviewed user is a professional
    await this.updateProfessionalRating(reviewed_user_id);

    // Send notification to reviewed user
    try {
      await this.notificationService.notifyReviewReceived(
        reviewed_user_id,
        review.reviewer?.name || 'Un usuario',
        matchId,
      );
    } catch (err) {
      // Log but don't fail review creation if notification fails
      console.error('Failed to send review notification:', err);
    }

    return review;
  }

  /**
   * Get all reviews for a user (as reviewed user)
   */
  async getUserReviews(userId: string, limit = 10, offset = 0) {
    const [reviews, total] = await Promise.all([
      this.prisma.matchReview.findMany({
        where: {
          reviewed_user_id: userId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          match: {
            select: {
              id: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      this.prisma.matchReview.count({
        where: {
          reviewed_user_id: userId,
        },
      }),
    ]);

    return {
      reviews,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get reviews for a specific match
   */
  async getMatchReviews(matchId: string) {
    return this.prisma.matchReview.findMany({
      where: {
        match_id: matchId,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reviewed_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  /**
   * Get review statistics for a user
   */
  async getReviewStats(userId: string): Promise<ReviewStatsDto> {
    const reviews = await this.prisma.matchReview.findMany({
      where: {
        reviewed_user_id: userId,
      },
    });

    if (reviews.length === 0) {
      return {
        total_reviews: 0,
        average_overall_rating: 0,
        average_communication_rating: 0,
        average_quality_rating: 0,
        average_professionalism_rating: 0,
        average_timeliness_rating: 0,
        rating_distribution: {
          five_star: 0,
          four_star: 0,
          three_star: 0,
          two_star: 0,
          one_star: 0,
        },
      };
    }

    const totalReviews = reviews.length;
    const sumOverall = reviews.reduce((sum, r) => sum + r.overall_rating, 0);
    const sumCommunication = reviews
      .filter((r) => r.communication_rating !== null)
      .reduce((sum, r) => sum + (r.communication_rating || 0), 0);
    const sumQuality = reviews
      .filter((r) => r.quality_rating !== null)
      .reduce((sum, r) => sum + (r.quality_rating || 0), 0);
    const sumProfessionalism = reviews
      .filter((r) => r.professionalism_rating !== null)
      .reduce((sum, r) => sum + (r.professionalism_rating || 0), 0);
    const sumTimeliness = reviews
      .filter((r) => r.timeliness_rating !== null)
      .reduce((sum, r) => sum + (r.timeliness_rating || 0), 0);

    const communicationCount = reviews.filter((r) => r.communication_rating !== null).length;
    const qualityCount = reviews.filter((r) => r.quality_rating !== null).length;
    const professionalisCount = reviews.filter((r) => r.professionalism_rating !== null).length;
    const timelinessCount = reviews.filter((r) => r.timeliness_rating !== null).length;

    const ratingDistribution = {
      five_star: reviews.filter((r) => r.overall_rating === 5).length,
      four_star: reviews.filter((r) => r.overall_rating === 4).length,
      three_star: reviews.filter((r) => r.overall_rating === 3).length,
      two_star: reviews.filter((r) => r.overall_rating === 2).length,
      one_star: reviews.filter((r) => r.overall_rating === 1).length,
    };

    return {
      total_reviews: totalReviews,
      average_overall_rating: Math.round((sumOverall / totalReviews) * 10) / 10,
      average_communication_rating:
        communicationCount > 0
          ? Math.round((sumCommunication / communicationCount) * 10) / 10
          : 0,
      average_quality_rating:
        qualityCount > 0 ? Math.round((sumQuality / qualityCount) * 10) / 10 : 0,
      average_professionalism_rating:
        professionalisCount > 0
          ? Math.round((sumProfessionalism / professionalisCount) * 10) / 10
          : 0,
      average_timeliness_rating:
        timelinessCount > 0 ? Math.round((sumTimeliness / timelinessCount) * 10) / 10 : 0,
      rating_distribution: ratingDistribution,
    };
  }

  /**
   * Check if a user can leave a review for a specific match
   */
  async canLeaveReview(matchId: string, userId: string): Promise<boolean> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return false;
    }

    // User must be part of the match
    if (match.client_id !== userId && match.professional_id !== userId) {
      return false;
    }

    // Match must be completed (both parties confirmed)
    if (match.job_id) {
      const job = await this.prisma.job.findUnique({
        where: { id: match.job_id },
      });

      if (!job || !job.completion_confirmed_by || !job.completion_confirmed_at) {
        return false;
      }
    }

    // User must not have already left a review
    const existingReview = await this.prisma.matchReview.findUnique({
      where: {
        match_id_reviewer_id: {
          match_id: matchId,
          reviewer_id: userId,
        },
      },
    });

    return !existingReview;
  }

  /**
   * Update professional profile rating based on reviews
   */
  private async updateProfessionalRating(userId: string) {
    const stats = await this.getReviewStats(userId);

    await this.prisma.professionalProfile.update({
      where: { user_id: userId },
      data: {
        rating: stats.average_overall_rating,
        review_count: stats.total_reviews,
      },
    });
  }

  /**
   * Get bidirectional review status for a match
   */
  async getReviewStatus(matchId: string) {
    const reviews = await this.prisma.matchReview.findMany({
      where: { match_id: matchId },
      select: {
        reviewer_id: true,
        reviewed_user_id: true,
        overall_rating: true,
        created_at: true,
      },
    });

    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    const clientReview = reviews.find((r) => r.reviewer_id === match.client_id);
    const professionalReview = reviews.find((r) => r.reviewer_id === match.professional_id);

    return {
      match_id: matchId,
      client_reviewed: !!clientReview,
      professional_reviewed: !!professionalReview,
      both_reviewed: clientReview && professionalReview,
      client_review: clientReview || null,
      professional_review: professionalReview || null,
    };
  }

  /**
   * Update a review (only before opposite party reviews, within 24h of creation)
   */
  async updateReview(reviewId: string, userId: string, dto: UpdateMatchReviewDto) {
    const review = await this.prisma.matchReview.findUnique({
      where: { id: reviewId },
      include: { match: true },
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    if (review.reviewer_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // NUEVA VALIDACIÓN: Check if 24 hours have passed since creation
    const now = new Date();
    const reviewCreatedAt = new Date(review.created_at);
    const hoursElapsed = (now.getTime() - reviewCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      throw new BadRequestException(
        'You can only update your review within 24 hours of creation'
      );
    }

    // Check if opposite party has already reviewed
    const reviewStatus = await this.getReviewStatus(review.match_id);
    if (review.reviewer_id === review.match.client_id && reviewStatus.professional_reviewed) {
      throw new BadRequestException(
        'Cannot update review after the opposite party has already reviewed',
      );
    }
    if (review.reviewer_id === review.match.professional_id && reviewStatus.client_reviewed) {
      throw new BadRequestException(
        'Cannot update review after the opposite party has already reviewed',
      );
    }

    // Validate ratings
    if (
      dto.overall_rating &&
      (dto.overall_rating < 1 || dto.overall_rating > 5)
    ) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const updated = await this.prisma.matchReview.update({
      where: { id: reviewId },
      data: {
        overall_rating: dto.overall_rating || review.overall_rating,
        communication_rating: dto.communication_rating ?? review.communication_rating,
        quality_rating: dto.quality_rating ?? review.quality_rating,
        professionalism_rating: dto.professionalism_rating ?? review.professionalism_rating,
        timeliness_rating: dto.timeliness_rating ?? review.timeliness_rating,
        comment: dto.comment ?? review.comment,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Recalculate professional rating
    await this.updateProfessionalRating(review.reviewed_user_id);

    return updated;
  }

  /**
   * Delete a review (soft delete for audit trail)
   * Only before opposite party reviews or within reasonable period
   */
  async deleteReview(reviewId: string, userId: string, reason?: string) {
    const review = await this.prisma.matchReview.findUnique({
      where: { id: reviewId },
      include: { match: true },
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    if (review.deleted_at !== null) {
      throw new BadRequestException('This review has already been deleted');
    }

    if (review.reviewer_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Check if opposite party has already reviewed
    const reviewStatus = await this.getReviewStatus(review.match_id);
    if (review.reviewer_id === review.match.client_id && reviewStatus.professional_reviewed) {
      throw new BadRequestException(
        'Cannot delete review after the opposite party has already reviewed',
      );
    }
    if (review.reviewer_id === review.match.professional_id && reviewStatus.client_reviewed) {
      throw new BadRequestException(
        'Cannot delete review after the opposite party has already reviewed',
      );
    }

    // Soft delete: Mark as deleted with audit trail
    const deletedReview = await this.prisma.matchReview.update({
      where: { id: reviewId },
      data: {
        deleted_at: new Date(),
        deleted_by_user_id: userId,
        deleted_reason: reason || 'User requested deletion',
      },
    });

    // Recalculate professional rating (exclude deleted reviews)
    await this.updateProfessionalRating(review.reviewed_user_id);

    return {
      message: 'Review deleted successfully',
      deletedReview,
    };
  }
}
