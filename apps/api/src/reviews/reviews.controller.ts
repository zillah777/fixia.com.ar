import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto, FlagReviewDto, ModerateReviewDto, HelpfulVoteDto, ReviewFiltersDto } from './dto/review.dto';

@ApiTags('Reviews & Trust System')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Review created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid review data' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Review already exists' })
  async createReview(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.createReview(req.user.sub, createReviewDto);
  }

  @Get('professional/:professionalId')
  @ApiOperation({ summary: 'Get reviews for a professional' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reviews retrieved successfully' })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'verifiedOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReviewsByProfessional(
    @Param('professionalId') professionalId: string,
    @Query() filters: ReviewFiltersDto
  ) {
    return this.reviewsService.getReviewsByProfessional(professionalId, filters);
  }

  @Get('professional/:professionalId/stats')
  @ApiOperation({ summary: 'Get review statistics for a professional' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Statistics retrieved successfully' })
  async getProfessionalReviewStats(@Param('professionalId') professionalId: string) {
    return this.reviewsService.getProfessionalReviewStats(professionalId);
  }

  @Get('my-reviews')
  @ApiOperation({ summary: 'Get reviews written by current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reviews retrieved successfully' })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyReviews(@Request() req, @Query() filters: ReviewFiltersDto) {
    return this.reviewsService.getReviewsByUser(req.user.sub, filters);
  }

  @Put(':reviewId')
  @ApiOperation({ summary: 'Update a review' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to update this review' })
  async updateReview(
    @Param('reviewId') reviewId: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req
  ) {
    return this.reviewsService.updateReview(reviewId, req.user.sub, updateReviewDto);
  }

  @Delete(':reviewId')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Review deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to delete this review' })
  async deleteReview(@Param('reviewId') reviewId: string, @Request() req) {
    await this.reviewsService.deleteReview(reviewId, req.user.sub);
    return { message: 'Review deleted successfully' };
  }

  @Post(':reviewId/flag')
  @ApiOperation({ summary: 'Flag a review for moderation' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Review flagged successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Review already flagged by user' })
  async flagReview(
    @Param('reviewId') reviewId: string,
    @Body() flagReviewDto: FlagReviewDto,
    @Request() req
  ) {
    return this.reviewsService.flagReview(reviewId, req.user.sub, flagReviewDto);
  }

  @Post(':reviewId/helpful')
  @ApiOperation({ summary: 'Vote on review helpfulness' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Vote recorded successfully' })
  async voteHelpful(
    @Param('reviewId') reviewId: string,
    @Body() helpfulVoteDto: HelpfulVoteDto,
    @Request() req
  ) {
    return this.reviewsService.voteHelpful(reviewId, req.user.sub, helpfulVoteDto);
  }

  // Admin/Moderator endpoints
  @Get('moderation/queue')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Get reviews pending moderation (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Moderation queue retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getModerationQueue(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    return this.reviewsService.getReviewsForModeration(page, limit);
  }

  @Put(':reviewId/moderate')
  @UseGuards(RolesGuard)
  @Roles('admin', 'moderator')
  @ApiOperation({ summary: 'Moderate a review (Admin only)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Review moderated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Review not found' })
  async moderateReview(
    @Param('reviewId') reviewId: string,
    @Body() moderateReviewDto: ModerateReviewDto,
    @Request() req
  ) {
    return this.reviewsService.moderateReview(reviewId, req.user.sub, moderateReviewDto);
  }
}