import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchService } from './match.service';
import { PhoneRevealService } from './phone-reveal.service';
import { ReviewService } from './review.service';
import {
  UpdateMatchStatusDto,
  RequestCompletionDto,
  ConfirmCompletionDto,
  GeneratePhoneRevealTokenDto,
  RevealPhoneDto,
} from './dto/match.dto';
import { CreateMatchReviewDto, UpdateMatchReviewDto } from './dto/review.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller('matches')
@ApiTags('Matches, Phone Reveal & Reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchController {
  constructor(
    private matchService: MatchService,
    private phoneRevealService: PhoneRevealService,
    private reviewService: ReviewService,
  ) {}

  /**
   * GET /matches - Get all matches for current user
   */
  @Get()
  @ApiOperation({ summary: 'Get all matches for current user' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role: client or professional' })
  async getUserMatches(
    @Request() req,
    @Query('role') role?: 'client' | 'professional',
  ) {
    return await this.matchService.getUserMatches(req.user.id, role);
  }

  /**
   * GET /matches/:matchId - Get match details
   */
  @Get(':matchId')
  @ApiOperation({ summary: 'Get match details' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async getMatch(@Request() req, @Param('matchId') matchId: string) {
    return await this.matchService.getMatch(matchId, req.user.id);
  }

  /**
   * PUT /matches/:matchId/status - Update match status
   */
  @Put(':matchId/status')
  @ApiOperation({ summary: 'Update match status' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async updateMatchStatus(
    @Request() req,
    @Param('matchId') matchId: string,
    @Body() dto: UpdateMatchStatusDto,
  ) {
    return await this.matchService.updateMatchStatus(matchId, req.user.id, dto.status);
  }

  /**
   * POST /matches/:matchId/request-completion - Mark service as completed (one party)
   */
  @Post(':matchId/request-completion')
  @ApiOperation({ summary: 'Request completion of service' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async requestCompletion(
    @Request() req,
    @Param('matchId') matchId: string,
    @Body() dto: RequestCompletionDto,
  ) {
    return await this.matchService.requestCompletion(matchId, req.user.id, dto.comment);
  }

  /**
   * PUT /matches/:matchId/confirm-completion - Confirm completion by opposite party
   */
  @Put(':matchId/confirm-completion')
  @ApiOperation({ summary: 'Confirm service completion (enables reviews)' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async confirmCompletion(
    @Request() req,
    @Param('matchId') matchId: string,
    @Body() dto: ConfirmCompletionDto,
  ) {
    return await this.matchService.confirmCompletion(matchId, req.user.id);
  }

  /**
   * GET /matches/:matchId/completion-status - Get completion status
   */
  @Get(':matchId/completion-status')
  @ApiOperation({ summary: 'Get completion status and review eligibility' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async getCompletionStatus(
    @Request() req,
    @Param('matchId') matchId: string,
  ) {
    return await this.matchService.getCompletionStatus(matchId);
  }

  /**
   * POST /matches/:matchId/request-phone-reveal - Generate one-time token for phone reveal
   */
  @Post(':matchId/request-phone-reveal')
  @ApiOperation({ summary: 'Generate one-time token to reveal phone number' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async generatePhoneRevealToken(
    @Request() req,
    @Param('matchId') matchId: string,
    @Body() dto: GeneratePhoneRevealTokenDto,
  ) {
    return await this.phoneRevealService.generatePhoneRevealToken(
      matchId,
      req.user.id,
      dto.ipAddress,
      dto.userAgent,
    );
  }

  /**
   * GET /matches/:matchId/phone-masked - Get masked phone number (always available)
   */
  @Get(':matchId/phone-masked')
  @ApiOperation({ summary: 'Get masked phone number' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async getMaskedPhone(
    @Request() req,
    @Param('matchId') matchId: string,
  ) {
    return await this.phoneRevealService.getMaskedPhoneNumber(matchId, req.user.id);
  }

  /**
   * GET /matches/:matchId/reveal-phone?token=xxx - Reveal phone with token
   * IMPORTANT: This is a GET endpoint that must be protected and rate-limited
   */
  @Get(':matchId/reveal-phone')
  @ApiOperation({ summary: 'Reveal phone number using one-time token' })
  @ApiParam({ name: 'matchId', type: 'string' })
  @ApiQuery({ name: 'token', type: 'string', description: 'One-time reveal token' })
  async revealPhone(
    @Request() req,
    @Param('matchId') matchId: string,
    @Query('token') token?: string,
  ) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return await this.phoneRevealService.revealPhone(matchId, token, req.user.id);
  }

  /**
   * GET /matches/:matchId/reveal-history - Get phone reveal history (admin only)
   */
  @Get(':matchId/reveal-history')
  @ApiOperation({ summary: 'Get phone reveal history (audit log)' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async getRevealHistory(
    @Request() req,
    @Param('matchId') matchId: string,
  ) {
    // TODO: Add admin check
    return await this.phoneRevealService.getRevealHistory(matchId);
  }

  /**
   * POST /matches/:matchId/reviews - Create a review for a match
   */
  @Post(':matchId/reviews')
  @ApiOperation({ summary: 'Create a review for a completed match' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async createReview(
    @Request() req,
    @Param('matchId') matchId: string,
    @Body() dto: CreateMatchReviewDto,
  ) {
    return await this.reviewService.createReview(matchId, req.user.id, dto);
  }

  /**
   * GET /matches/:matchId/reviews - Get all reviews for a match
   */
  @Get(':matchId/reviews')
  @ApiOperation({ summary: 'Get all reviews for a match' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async getMatchReviews(@Param('matchId') matchId: string) {
    return await this.reviewService.getMatchReviews(matchId);
  }

  /**
   * GET /matches/:matchId/reviews/status - Get review status for a match
   */
  @Get(':matchId/reviews/status')
  @ApiOperation({ summary: 'Get review status (who has reviewed)' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async getReviewStatus(@Param('matchId') matchId: string) {
    return await this.reviewService.getReviewStatus(matchId);
  }

  /**
   * GET /matches/:matchId/reviews/can-review - Check if user can review this match
   */
  @Get(':matchId/reviews/can-review')
  @ApiOperation({ summary: 'Check if current user can leave a review' })
  @ApiParam({ name: 'matchId', type: 'string' })
  async canLeaveReview(
    @Request() req,
    @Param('matchId') matchId: string,
  ) {
    const canReview = await this.reviewService.canLeaveReview(matchId, req.user.id);
    return { can_review: canReview };
  }

  /**
   * PUT /matches/reviews/:reviewId - Update a review
   */
  @Put('reviews/:reviewId')
  @ApiOperation({ summary: 'Update your review for a match' })
  @ApiParam({ name: 'reviewId', type: 'string' })
  async updateReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateMatchReviewDto,
  ) {
    return await this.reviewService.updateReview(reviewId, req.user.id, dto);
  }

  /**
   * DELETE /matches/reviews/:reviewId - Delete a review
   */
  @Delete('reviews/:reviewId')
  @ApiOperation({ summary: 'Delete your review for a match' })
  @ApiParam({ name: 'reviewId', type: 'string' })
  async deleteReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
  ) {
    return await this.reviewService.deleteReview(reviewId, req.user.id);
  }

  /**
   * GET /matches/users/:userId/reviews - Get reviews for a user
   */
  @Get('users/:userId/reviews')
  @ApiOperation({ summary: 'Get all reviews for a specific user' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Default: 10' })
  @ApiQuery({ name: 'offset', required: false, type: 'number', description: 'Default: 0' })
  async getUserReviews(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return await this.reviewService.getUserReviews(
      userId,
      limit ? parseInt(limit, 10) : 10,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  /**
   * GET /matches/users/:userId/reviews/stats - Get review statistics for a user
   */
  @Get('users/:userId/reviews/stats')
  @ApiOperation({ summary: 'Get review statistics for a user (ratings, counts, etc)' })
  @ApiParam({ name: 'userId', type: 'string' })
  async getReviewStats(@Param('userId') userId: string) {
    return await this.reviewService.getReviewStats(userId);
  }
}
