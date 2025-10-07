import { Controller, Get, Post, Param, UseGuards, Query, HttpStatus, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrustService } from './trust.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('trust')
@UseGuards(JwtAuthGuard)
export class TrustController {
  constructor(private readonly trustService: TrustService) {}

  @Get('score/:userId')
  async getTrustScore(@Param('userId') userId: string) {
    try {
      const trustScore = await this.trustService.getTrustScore(userId);
      
      if (!trustScore) {
        throw new HttpException('Trust score not found', HttpStatus.NOT_FOUND);
      }

      // Add trust badge information
      const badge = this.trustService.getTrustBadge(trustScore.overall_score);
      const badgeColor = this.trustService.getTrustBadgeColor(trustScore.overall_score);

      return {
        ...trustScore,
        trust_badge: badge,
        badge_color: badgeColor,
        score_breakdown: {
          review_score: trustScore.review_score,
          completion_score: trustScore.completion_score,
          communication_score: trustScore.communication_score,
          reliability_score: trustScore.reliability_score,
          verification_score: trustScore.verification_score
        }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve trust score', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-score')
  async getMyTrustScore(@CurrentUser() user: User) {
    try {
      const trustScore = await this.trustService.getTrustScore(user.id);
      
      if (!trustScore) {
        // Calculate trust score if it doesn't exist
        const newTrustScore = await this.trustService.calculateTrustScore(user.id);
        const badge = this.trustService.getTrustBadge(newTrustScore.overall_score);
        const badgeColor = this.trustService.getTrustBadgeColor(newTrustScore.overall_score);

        return {
          ...newTrustScore,
          trust_badge: badge,
          badge_color: badgeColor,
          score_breakdown: {
            review_score: newTrustScore.review_score,
            completion_score: newTrustScore.completion_score,
            communication_score: newTrustScore.communication_score,
            reliability_score: newTrustScore.reliability_score,
            verification_score: newTrustScore.verification_score
          }
        };
      }

      const badge = this.trustService.getTrustBadge(trustScore.overall_score);
      const badgeColor = this.trustService.getTrustBadgeColor(trustScore.overall_score);

      return {
        ...trustScore,
        trust_badge: badge,
        badge_color: badgeColor,
        score_breakdown: {
          review_score: trustScore.review_score,
          completion_score: trustScore.completion_score,
          communication_score: trustScore.communication_score,
          reliability_score: trustScore.reliability_score,
          verification_score: trustScore.verification_score
        }
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve your trust score', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('calculate/:userId')
  async calculateTrustScore(@Param('userId') userId: string, @CurrentUser() user: User) {
    try {
      // Only allow users to calculate their own trust score
      if (userId !== user.id) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const trustScore = await this.trustService.calculateTrustScore(userId);
      const badge = this.trustService.getTrustBadge(trustScore.overall_score);
      const badgeColor = this.trustService.getTrustBadgeColor(trustScore.overall_score);

      return {
        ...trustScore,
        trust_badge: badge,
        badge_color: badgeColor,
        message: 'Trust score calculated successfully'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to calculate trust score', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('recalculate-all')
  async recalculateAllTrustScores(@CurrentUser() user: User) {
    try {
      // For now, this endpoint is disabled - would need admin role implementation
      throw new HttpException('Feature not available', HttpStatus.NOT_IMPLEMENTED);
      
      // await this.trustService.updateAllTrustScores();
      // return {
      //   message: 'All trust scores have been recalculated successfully'
      // };
    } catch (error) {
      throw new HttpException(
        'Failed to recalculate all trust scores', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('leaderboard')
  async getTrustLeaderboard(
    @Query('limit') limit?: string,
    @Query('userType') userType?: 'professional' | 'client'
  ) {
    try {
      const limitNumber = limit ? parseInt(limit, 10) : 50;
      
      if (limitNumber > 100) {
        throw new HttpException('Limit cannot exceed 100', HttpStatus.BAD_REQUEST);
      }

      // This would require additional implementation in TrustService
      // For now, return a placeholder response
      return {
        message: 'Trust leaderboard feature coming soon',
        limit: limitNumber,
        userType: userType || 'all'
      };
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve trust leaderboard', 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('badges')
  getBadgeInformation() {
    return {
      badges: [
        {
          name: 'Top Rated Plus',
          minScore: 95,
          color: 'text-purple-600 bg-purple-100',
          description: 'Elite professionals with exceptional performance'
        },
        {
          name: 'Highly Trusted',
          minScore: 85,
          color: 'text-green-600 bg-green-100',
          description: 'Highly trusted professionals with proven track record'
        },
        {
          name: 'Trusted Professional',
          minScore: 75,
          color: 'text-blue-600 bg-blue-100',
          description: 'Trusted professionals with good performance'
        },
        {
          name: 'Verified Professional',
          minScore: 65,
          color: 'text-orange-600 bg-orange-100',
          description: 'Verified professionals with decent performance'
        },
        {
          name: 'Professional',
          minScore: 50,
          color: 'text-gray-600 bg-gray-100',
          description: 'Registered professionals'
        },
        {
          name: 'New Professional',
          minScore: 0,
          color: 'text-slate-600 bg-slate-100',
          description: 'New professionals building their reputation'
        }
      ],
      scoreComponents: {
        reviewScore: { weight: 30, description: 'Based on client reviews and ratings' },
        completionScore: { weight: 25, description: 'Job completion rate and history' },
        reliabilityScore: { weight: 20, description: 'On-time delivery and reliability' },
        communicationScore: { weight: 15, description: 'Communication quality with clients' },
        verificationScore: { weight: 10, description: 'Identity and skill verification' }
      }
    };
  }
}