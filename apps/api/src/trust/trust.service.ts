import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JobStatus, ReviewModerationStatus, TrustScore } from '@prisma/client';

@Injectable()
export class TrustService {
  private readonly logger = new Logger(TrustService.name);

  constructor(private prisma: PrismaService) {}

  async calculateTrustScore(userId: string): Promise<TrustScore> {
    this.logger.log(`Calculating trust score for user: ${userId}`);

    // Get user's data for calculations
    const [
      jobs,
      reviews,
      professionalProfile,
      existingTrustScore
    ] = await Promise.all([
      this.getJobMetrics(userId),
      this.getReviewMetrics(userId),
      this.getProfessionalProfile(userId),
      this.prisma.trustScore.findUnique({ where: { user_id: userId } })
    ]);

    // Calculate component scores
    const reviewScore = this.calculateReviewScore(reviews);
    const completionScore = this.calculateCompletionScore(jobs);
    const communicationScore = this.calculateCommunicationScore(reviews);
    const reliabilityScore = this.calculateReliabilityScore(jobs, reviews);
    const verificationScore = await this.calculateVerificationScore(userId);

    // Calculate overall score (weighted average)
    const overallScore = this.calculateOverallScore({
      reviewScore,
      completionScore,
      communicationScore,
      reliabilityScore,
      verificationScore
    });

    // Calculate metrics
    const totalJobsCompleted = jobs.filter(job => job.status === JobStatus.completed).length;
    const totalReviewsReceived = reviews.length;
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    const responseTimeHours = professionalProfile?.response_time_hours || 24;
    const completionRate = jobs.length > 0 
      ? (totalJobsCompleted / jobs.length) * 100 
      : 0;

    // Get verification status
    const verificationRequests = await this.prisma.verificationRequest.findMany({
      where: { 
        user_id: userId,
        status: 'approved'
      }
    });

    const verifiedIdentity = verificationRequests.some(req => req.verification_type === 'identity');
    const verifiedSkills = verificationRequests.some(req => req.verification_type === 'skills');
    const verifiedBusiness = verificationRequests.some(req => req.verification_type === 'business');
    const backgroundChecked = verificationRequests.some(req => req.verification_type === 'background_check');

    const trustScoreData = {
      user_id: userId,
      overall_score: overallScore,
      review_score: reviewScore,
      completion_score: completionScore,
      communication_score: communicationScore,
      reliability_score: reliabilityScore,
      verification_score: verificationScore,
      total_jobs_completed: totalJobsCompleted,
      total_reviews_received: totalReviewsReceived,
      average_rating: averageRating,
      response_time_hours: responseTimeHours,
      completion_rate: completionRate,
      verified_identity: verifiedIdentity,
      verified_skills: verifiedSkills,
      verified_business: verifiedBusiness,
      background_checked: backgroundChecked,
      last_calculated_at: new Date()
    };

    // Upsert trust score
    const trustScore = await this.prisma.trustScore.upsert({
      where: { user_id: userId },
      update: trustScoreData,
      create: trustScoreData
    });

    this.logger.log(`Trust score calculated: ${overallScore.toFixed(2)} for user: ${userId}`);
    return trustScore;
  }

  async getTrustScore(userId: string): Promise<TrustScore | null> {
    return this.prisma.trustScore.findUnique({
      where: { user_id: userId }
    });
  }

  async updateAllTrustScores(): Promise<void> {
    this.logger.log('Starting bulk trust score update');

    // Get all professional users
    const professionals = await this.prisma.user.findMany({
      where: { user_type: 'professional' },
      select: { id: true }
    });

    let updated = 0;
    for (const professional of professionals) {
      try {
        await this.calculateTrustScore(professional.id);
        updated++;
      } catch (error) {
        this.logger.error(`Failed to update trust score for user ${professional.id}:`, error);
      }
    }

    this.logger.log(`Updated trust scores for ${updated}/${professionals.length} professionals`);
  }

  private async getJobMetrics(userId: string) {
    return this.prisma.job.findMany({
      where: { professional_id: userId },
      select: {
        id: true,
        status: true,
        created_at: true,
        started_at: true,
        completed_at: true,
        delivery_date: true
      }
    });
  }

  private async getReviewMetrics(userId: string) {
    return this.prisma.review.findMany({
      where: { 
        professional_id: userId,
        moderation_status: ReviewModerationStatus.approved
      },
      select: {
        rating: true,
        communication_rating: true,
        quality_rating: true,
        timeliness_rating: true,
        professionalism_rating: true,
        verified_purchase: true,
        created_at: true
      }
    });
  }

  private async getProfessionalProfile(userId: string) {
    return this.prisma.professionalProfile.findUnique({
      where: { user_id: userId },
      select: {
        response_time_hours: true,
        rating: true,
        review_count: true
      }
    });
  }

  private calculateReviewScore(reviews: any[]): number {
    if (reviews.length === 0) return 0;

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const verifiedReviewsBonus = reviews.filter(r => r.verified_purchase).length / reviews.length * 10;
    const volumeBonus = Math.min(reviews.length / 50 * 10, 10); // Up to 10 points for 50+ reviews

    return Math.min(averageRating * 15 + verifiedReviewsBonus + volumeBonus, 100);
  }

  private calculateCompletionScore(jobs: any[]): number {
    if (jobs.length === 0) return 0;

    const completedJobs = jobs.filter(job => job.status === JobStatus.completed).length;
    const completionRate = completedJobs / jobs.length;
    const volumeBonus = Math.min(completedJobs / 20 * 10, 20); // Up to 20 points for 20+ completed jobs

    return Math.min(completionRate * 80 + volumeBonus, 100);
  }

  private calculateCommunicationScore(reviews: any[]): number {
    const communicationReviews = reviews.filter(r => r.communication_rating);
    if (communicationReviews.length === 0) return 75; // Default score

    const averageCommunication = communicationReviews.reduce((sum, r) => sum + r.communication_rating, 0) / communicationReviews.length;
    return averageCommunication * 20; // Scale to 100
  }

  private calculateReliabilityScore(jobs: any[], reviews: any[]): number {
    let score = 50; // Base score

    // On-time delivery bonus
    const completedJobs = jobs.filter(job => job.status === JobStatus.completed);
    if (completedJobs.length > 0) {
      const onTimeJobs = completedJobs.filter(job => {
        if (!job.delivery_date || !job.completed_at) return true;
        return new Date(job.completed_at) <= new Date(job.delivery_date);
      });
      const onTimeRate = onTimeJobs.length / completedJobs.length;
      score += onTimeRate * 30;
    }

    // Timeliness reviews bonus
    const timelinessReviews = reviews.filter(r => r.timeliness_rating);
    if (timelinessReviews.length > 0) {
      const averageTimeliness = timelinessReviews.reduce((sum, r) => sum + r.timeliness_rating, 0) / timelinessReviews.length;
      score += (averageTimeliness - 3) * 5; // Bonus for above average (3) timeliness
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private async calculateVerificationScore(userId: string): Promise<number> {
    const verifications = await this.prisma.verificationRequest.findMany({
      where: { 
        user_id: userId,
        status: 'approved'
      }
    });

    let score = 0;
    const verificationWeights = {
      identity: 25,
      skills: 20,
      business: 20,
      background_check: 25,
      phone: 5,
      email: 3,
      address: 2
    };

    verifications.forEach(verification => {
      score += verificationWeights[verification.verification_type] || 0;
    });

    return Math.min(score, 100);
  }

  private calculateOverallScore(scores: {
    reviewScore: number;
    completionScore: number;
    communicationScore: number;
    reliabilityScore: number;
    verificationScore: number;
  }): number {
    // Weighted average of component scores
    const weights = {
      reviewScore: 0.3,      // 30% - Most important for trust
      completionScore: 0.25,  // 25% - Job completion rate
      reliabilityScore: 0.2,  // 20% - On-time delivery and reliability
      communicationScore: 0.15, // 15% - Communication quality
      verificationScore: 0.1   // 10% - Identity and skill verification
    };

    return (
      scores.reviewScore * weights.reviewScore +
      scores.completionScore * weights.completionScore +
      scores.reliabilityScore * weights.reliabilityScore +
      scores.communicationScore * weights.communicationScore +
      scores.verificationScore * weights.verificationScore
    );
  }

  // Trust badges based on score
  getTrustBadge(score: number): string {
    if (score >= 95) return 'Top Rated Plus';
    if (score >= 85) return 'Highly Trusted';
    if (score >= 75) return 'Trusted Professional';
    if (score >= 65) return 'Verified Professional';
    if (score >= 50) return 'Professional';
    return 'New Professional';
  }

  getTrustBadgeColor(score: number): string {
    if (score >= 95) return 'text-purple-600 bg-purple-100';
    if (score >= 85) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 65) return 'text-orange-600 bg-orange-100';
    if (score >= 50) return 'text-gray-600 bg-gray-100';
    return 'text-slate-600 bg-slate-100';
  }

  // Helper method to trigger trust score calculation after certain events
  async triggerTrustScoreUpdate(userId: string, event: 'job_completed' | 'review_received' | 'verification_approved') {
    this.logger.log(`Trust score update triggered for user ${userId} due to: ${event}`);
    
    // Schedule async calculation (don't block the main flow)
    setImmediate(async () => {
      try {
        await this.calculateTrustScore(userId);
      } catch (error) {
        this.logger.error(`Failed to update trust score for user ${userId}:`, error);
      }
    });
  }
}