import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ModerateReviewDto, ReviewModerationAction } from './dto/review-moderation.dto';

@Injectable()
export class ReviewModerationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get pending reviews for moderation
   */
  async getPendingReviews(limit = 20, offset = 0) {
    const [reviews, total] = await Promise.all([
      this.prisma.matchReview.findMany({
        // In a real scenario, you'd have a moderation_status field
        // For now, we return all recent reviews
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              avatar: true,
              verified: true,
            },
          },
          reviewed_user: {
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
      this.prisma.matchReview.count(),
    ]);

    return {
      reviews,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get reviews flagged for inappropriate content
   */
  async getFlaggedReviews(limit = 20, offset = 0) {
    const [reviews, total] = await Promise.all([
      this.prisma.matchReview.findMany({
        where: {
          // Filter by reviews that have been flagged
          // This would require a moderation_status or flagged_count field
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
        take: limit,
        skip: offset,
      }),
      this.prisma.matchReview.count(),
    ]);

    return {
      reviews,
      total,
      limit,
      offset,
    };
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats() {
    const totalReviews = await this.prisma.matchReview.count();
    const reviewsThisMonth = await this.prisma.matchReview.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Average rating distribution
    const avgRating = await this.prisma.matchReview.aggregate({
      _avg: {
        overall_rating: true,
      },
    });

    return {
      total_reviews: totalReviews,
      reviews_this_month: reviewsThisMonth,
      average_rating: avgRating._avg.overall_rating || 0,
      pending_moderation: 0, // Would be calculated if moderation_status field exists
      flagged_reviews: 0, // Would be calculated if flagged field exists
    };
  }

  /**
   * Approve a review (make it visible)
   */
  async approveReview(reviewId: string, adminId: string) {
    const review = await this.prisma.matchReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    // In a real scenario, we'd update a moderation_status field
    // For now, we just confirm it exists and is valid
    return {
      message: 'Review approved',
      review_id: reviewId,
      approved_at: new Date(),
      approved_by: adminId,
    };
  }

  /**
   * Reject a review (hide/remove it)
   */
  async rejectReview(reviewId: string, adminId: string, reason: string) {
    const review = await this.prisma.matchReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    // Delete the review
    await this.prisma.matchReview.delete({
      where: { id: reviewId },
    });

    // Recalculate professional rating
    await this.recalculateProfessionalRating(review.reviewed_user_id);

    return {
      message: 'Review rejected and removed',
      review_id: reviewId,
      reason,
      rejected_at: new Date(),
      rejected_by: adminId,
    };
  }

  /**
   * Recalculate professional profile rating
   */
  private async recalculateProfessionalRating(userId: string) {
    const reviews = await this.prisma.matchReview.findMany({
      where: { reviewed_user_id: userId },
    });

    if (reviews.length === 0) {
      await this.prisma.professionalProfile.update({
        where: { user_id: userId },
        data: {
          rating: 0,
          review_count: 0,
        },
      });
      return;
    }

    const avgRating =
      reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length;

    await this.prisma.professionalProfile.update({
      where: { user_id: userId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        review_count: reviews.length,
      },
    });
  }

  /**
   * Get review details for moderation
   */
  async getReviewDetail(reviewId: string) {
    const review = await this.prisma.matchReview.findUnique({
      where: { id: reviewId },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            email: true,
          },
        },
        reviewed_user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
          },
        },
        match: {
          select: {
            id: true,
            status: true,
            created_at: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review ${reviewId} not found`);
    }

    return review;
  }
}
