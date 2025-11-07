import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewModerationService } from './review-moderation.service';
import { ModerateReviewDto } from './dto/review-moderation.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

// TODO: Implement admin role checking
// For now, this is accessible to all authenticated users
// In production, add @UseRoles('admin') or similar decorator

@Controller('admin/reviews')
@ApiTags('Admin - Review Moderation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewModerationController {
  constructor(private reviewModerationService: ReviewModerationService) {}

  /**
   * GET /admin/reviews - Get pending reviews for moderation
   */
  @Get()
  @ApiOperation({ summary: 'Get pending reviews for moderation (admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Default: 20' })
  @ApiQuery({ name: 'offset', required: false, type: 'number', description: 'Default: 0' })
  async getPendingReviews(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    // TODO: Add admin role check
    return await this.reviewModerationService.getPendingReviews(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * GET /admin/reviews/flagged - Get flagged reviews
   */
  @Get('flagged')
  @ApiOperation({ summary: 'Get flagged reviews for moderation (admin only)' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Default: 20' })
  @ApiQuery({ name: 'offset', required: false, type: 'number', description: 'Default: 0' })
  async getFlaggedReviews(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    // TODO: Add admin role check
    return await this.reviewModerationService.getFlaggedReviews(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * GET /admin/reviews/stats - Get moderation statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get review moderation statistics (admin only)' })
  async getModerationStats(@Request() req) {
    // TODO: Add admin role check
    return await this.reviewModerationService.getModerationStats();
  }

  /**
   * GET /admin/reviews/:reviewId - Get review details for moderation
   */
  @Get(':reviewId')
  @ApiOperation({ summary: 'Get review details for moderation (admin only)' })
  @ApiParam({ name: 'reviewId', type: 'string' })
  async getReviewDetail(
    @Request() req,
    @Param('reviewId') reviewId: string,
  ) {
    // TODO: Add admin role check
    return await this.reviewModerationService.getReviewDetail(reviewId);
  }

  /**
   * PUT /admin/reviews/:reviewId/moderate - Approve or reject a review
   */
  @Put(':reviewId/moderate')
  @ApiOperation({ summary: 'Approve or reject a review (admin only)' })
  @ApiParam({ name: 'reviewId', type: 'string' })
  async moderateReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() dto: ModerateReviewDto,
  ) {
    // TODO: Add admin role check
    if (dto.action === 'approve') {
      return await this.reviewModerationService.approveReview(reviewId, req.user.id);
    } else if (dto.action === 'reject') {
      return await this.reviewModerationService.rejectReview(
        reviewId,
        req.user.id,
        dto.reason || '',
      );
    } else {
      throw new ForbiddenException('Invalid moderation action');
    }
  }
}
