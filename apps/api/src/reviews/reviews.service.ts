import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateReviewDto, UpdateReviewDto, FlagReviewDto, ModerateReviewDto, HelpfulVoteDto, ReviewFiltersDto } from './dto/review.dto';
import { Review, ReviewModerationStatus, Prisma, JobStatus } from '@prisma/client';
import { TrustService } from '../trust/trust.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TrustService))
    private trustService: TrustService
  ) {}

  async createReview(reviewerId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    // Validate that either serviceId or jobId is provided
    if (!createReviewDto.serviceId && !createReviewDto.jobId) {
      throw new BadRequestException('Either serviceId or jobId must be provided');
    }

    // Check if user has already reviewed this service/job
    const existingReview = await this.prisma.review.findFirst({
      where: {
        reviewer_id: reviewerId,
        professional_id: createReviewDto.professionalId,
        service_id: createReviewDto.serviceId || undefined,
        job_id: createReviewDto.jobId || undefined,
      }
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this service/job');
    }

    // If reviewing a job, verify it's completed and the user was the client
    let verifiedPurchase = false;
    if (createReviewDto.jobId) {
      const job = await this.prisma.job.findUnique({
        where: { id: createReviewDto.jobId },
        include: { project: true }
      });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (job.client_id !== reviewerId) {
        throw new ForbiddenException('You can only review jobs you were the client for');
      }

      if (job.status !== JobStatus.completed) {
        throw new BadRequestException('You can only review completed jobs');
      }

      verifiedPurchase = true;
    }

    // If reviewing a service, check if user has hired this professional
    if (createReviewDto.serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: createReviewDto.serviceId }
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }

      if (service.professional_id !== createReviewDto.professionalId) {
        throw new BadRequestException('Service does not belong to the specified professional');
      }

      // Check if user has completed jobs with this professional
      const completedJob = await this.prisma.job.findFirst({
        where: {
          client_id: reviewerId,
          professional_id: createReviewDto.professionalId,
          status: JobStatus.completed
        }
      });

      verifiedPurchase = !!completedJob;
    }

    // Create the review
    const review = await this.prisma.review.create({
      data: {
        service_id: createReviewDto.serviceId,
        job_id: createReviewDto.jobId,
        reviewer_id: reviewerId,
        professional_id: createReviewDto.professionalId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        communication_rating: createReviewDto.communicationRating,
        quality_rating: createReviewDto.qualityRating,
        timeliness_rating: createReviewDto.timelinessRating,
        professionalism_rating: createReviewDto.professionalismRating,
        verified_purchase: verifiedPurchase,
        moderation_status: ReviewModerationStatus.pending,
        trust_score: this.calculateTrustScore(createReviewDto.rating, verifiedPurchase)
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, title: true } },
        job: { select: { id: true, title: true } }
      }
    });

    // Update professional's rating statistics
    await this.updateProfessionalRating(createReviewDto.professionalId);

    // Auto-approve reviews that meet certain criteria
    if (verifiedPurchase && createReviewDto.comment && createReviewDto.comment.length > 20) {
      await this.moderateReview(review.id, 'system', {
        status: ReviewModerationStatus.approved,
        notes: 'Auto-approved: verified purchase with substantial comment'
      });
      
      // Trigger trust score update after auto-approval
      await this.trustService.triggerTrustScoreUpdate(
        createReviewDto.professionalId, 
        'review_received'
      );
    }

    return review;
  }

  async getReviewsByProfessional(professionalId: string, filters: ReviewFiltersDto = {}) {
    const {
      rating,
      verifiedOnly,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = filters;

    const where: Prisma.ReviewWhereInput = {
      professional_id: professionalId,
      moderation_status: ReviewModerationStatus.approved,
      ...(rating && { rating: rating }),
      ...(verifiedOnly && { verified_purchase: true })
    };

    const orderBy = this.getSortOrderBy(sortBy);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, title: true } },
          job: { select: { id: true, title: true } },
          helpful_votes: true
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({ where })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getReviewsByClient(clientId: string, filters: ReviewFiltersDto = {}) {
    const {
      rating,
      verifiedOnly,
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = filters;

    const where: Prisma.ReviewWhereInput = {
      reviewer_id: clientId,
      moderation_status: ReviewModerationStatus.approved,
      ...(rating && { rating: rating }),
      ...(verifiedOnly && { verified_purchase: true })
    };

    const orderBy = this.getSortOrderBy(sortBy);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          professional: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, title: true } },
          job: { select: { id: true, title: true } },
          helpful_votes: true
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({ where })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getReviewsByUser(userId: string, filters: ReviewFiltersDto = {}) {
    const {
      sortBy = 'newest',
      page = 1,
      limit = 10
    } = filters;

    const orderBy = this.getSortOrderBy(sortBy);

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reviewer_id: userId },
        include: {
          reviewer: { select: { id: true, name: true, avatar: true } },
          professional: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, title: true } },
          job: { select: { id: true, title: true } },
          helpful_votes: true
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({ where: { reviewer_id: userId } })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateReview(reviewId: string, userId: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewer_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Reset moderation status if content is changed
    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        ...updateReviewDto,
        moderation_status: ReviewModerationStatus.pending,
        trust_score: updateReviewDto.rating 
          ? this.calculateTrustScore(updateReviewDto.rating, review.verified_purchase)
          : review.trust_score
      },
      include: {
        reviewer: { select: { id: true, name: true, avatar: true } },
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, title: true } },
        job: { select: { id: true, title: true } }
      }
    });

    // Update professional's rating if rating changed
    if (updateReviewDto.rating) {
      await this.updateProfessionalRating(review.professional_id);
    }

    return updatedReview;
  }

  async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewer_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({
      where: { id: reviewId }
    });

    // Update professional's rating
    await this.updateProfessionalRating(review.professional_id);
  }

  async flagReview(reviewId: string, flaggerId: string, flagReviewDto: FlagReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.reviewer_id === flaggerId) {
      throw new BadRequestException('You cannot flag your own review');
    }

    // Check if user has already flagged this review
    const existingFlag = await this.prisma.reviewFlag.findUnique({
      where: {
        review_id_flagger_id: {
          review_id: reviewId,
          flagger_id: flaggerId
        }
      }
    });

    if (existingFlag) {
      throw new ConflictException('You have already flagged this review');
    }

    const flag = await this.prisma.reviewFlag.create({
      data: {
        review_id: reviewId,
        flagger_id: flaggerId,
        reason: flagReviewDto.reason,
        description: flagReviewDto.description
      }
    });

    // Increment flagged count on review
    await this.prisma.review.update({
      where: { id: reviewId },
      data: { flagged_count: { increment: 1 } }
    });

    // Auto-hide review if it gets too many flags
    const updatedReview = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { flagged_count: true }
    });

    if (updatedReview && updatedReview.flagged_count >= 5) {
      await this.prisma.review.update({
        where: { id: reviewId },
        data: { moderation_status: ReviewModerationStatus.flagged }
      });
    }

    return flag;
  }

  async voteHelpful(reviewId: string, userId: string, helpfulVoteDto: HelpfulVoteDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Upsert helpful vote
    const vote = await this.prisma.reviewHelpfulVote.upsert({
      where: {
        review_id_user_id: {
          review_id: reviewId,
          user_id: userId
        }
      },
      update: {
        is_helpful: helpfulVoteDto.isHelpful
      },
      create: {
        review_id: reviewId,
        user_id: userId,
        is_helpful: helpfulVoteDto.isHelpful
      }
    });

    // Update helpful count on review
    const helpfulCount = await this.prisma.reviewHelpfulVote.count({
      where: {
        review_id: reviewId,
        is_helpful: true
      }
    });

    await this.prisma.review.update({
      where: { id: reviewId },
      data: { helpful_count: helpfulCount }
    });

    return vote;
  }

  async moderateReview(reviewId: string, moderatorId: string, moderateReviewDto: ModerateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        moderation_status: moderateReviewDto.status,
        moderated_by: moderatorId === 'system' ? null : moderatorId,
        moderated_at: new Date()
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } }
      }
    });

    // Update professional rating if review was approved/rejected
    if (moderateReviewDto.status === ReviewModerationStatus.approved || 
        moderateReviewDto.status === ReviewModerationStatus.rejected) {
      await this.updateProfessionalRating(review.professional_id);
      
      // Trigger trust score update when review is approved
      if (moderateReviewDto.status === ReviewModerationStatus.approved) {
        await this.trustService.triggerTrustScoreUpdate(
          review.professional_id, 
          'review_received'
        );
      }
    }

    return updatedReview;
  }

  async getProfessionalReviewStats(professionalId: string) {
    const stats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: {
        professional_id: professionalId,
        moderation_status: ReviewModerationStatus.approved
      },
      _count: { rating: true }
    });

    const total = stats.reduce((sum, stat) => sum + stat._count.rating, 0);
    const average = total > 0 
      ? stats.reduce((sum, stat) => sum + (stat.rating * stat._count.rating), 0) / total 
      : 0;

    const distribution = [1, 2, 3, 4, 5].map(rating => {
      const stat = stats.find(s => s.rating === rating);
      return {
        rating,
        count: stat?._count.rating || 0,
        percentage: total > 0 ? ((stat?._count.rating || 0) / total) * 100 : 0
      };
    });

    return {
      total,
      average: Math.round(average * 10) / 10,
      distribution
    };
  }

  private calculateTrustScore(rating: number, verifiedPurchase: boolean): number {
    let score = (rating / 5) * 100; // Base score from rating
    
    if (verifiedPurchase) {
      score *= 1.2; // 20% bonus for verified purchases
    }
    
    return Math.min(score, 100); // Cap at 100
  }

  private getSortOrderBy(sortBy: string): Prisma.ReviewOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'oldest':
        return [{ created_at: 'asc' }];
      case 'rating_high':
        return [{ rating: 'desc' }, { created_at: 'desc' }];
      case 'rating_low':
        return [{ rating: 'asc' }, { created_at: 'desc' }];
      case 'helpful':
        return [{ helpful_count: 'desc' }, { created_at: 'desc' }];
      case 'newest':
      default:
        return [{ created_at: 'desc' }];
    }
  }

  private async updateProfessionalRating(professionalId: string) {
    const stats = await this.prisma.review.aggregate({
      where: {
        professional_id: professionalId,
        moderation_status: ReviewModerationStatus.approved
      },
      _avg: { rating: true },
      _count: { id: true }
    });

    await this.prisma.professionalProfile.update({
      where: { user_id: professionalId },
      data: {
        rating: stats._avg.rating || 0,
        review_count: stats._count.id || 0
      }
    });
  }

  async getReviewsForModeration(page = 1, limit = 20) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: {
          OR: [
            { moderation_status: ReviewModerationStatus.pending },
            { moderation_status: ReviewModerationStatus.flagged }
          ]
        },
        include: {
          reviewer: { select: { id: true, name: true, email: true } },
          professional: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, title: true } },
          job: { select: { id: true, title: true } },
          review_flags: {
            include: {
              flagger: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: [
          { flagged_count: 'desc' },
          { created_at: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      this.prisma.review.count({
        where: {
          OR: [
            { moderation_status: ReviewModerationStatus.pending },
            { moderation_status: ReviewModerationStatus.flagged }
          ]
        }
      })
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}