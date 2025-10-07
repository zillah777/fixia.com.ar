import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, Min, Max, IsBoolean } from 'class-validator';
import { ReviewModerationStatus, ReviewFlagReason } from '@prisma/client';

export class CreateReviewDto {
  @ApiProperty({ description: 'Service ID (optional if reviewing a job)' })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({ description: 'Job ID (optional if reviewing a service)' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ description: 'Professional user ID being reviewed' })
  @IsUUID()
  professionalId: string;

  @ApiProperty({ description: 'Overall rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Communication rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  @ApiProperty({ description: 'Quality rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiProperty({ description: 'Timeliness rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  timelinessRating?: number;

  @ApiProperty({ description: 'Professionalism rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalismRating?: number;
}

export class UpdateReviewDto {
  @ApiProperty({ description: 'Overall rating (1-5)', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ description: 'Communication rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  communicationRating?: number;

  @ApiProperty({ description: 'Quality rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @ApiProperty({ description: 'Timeliness rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  timelinessRating?: number;

  @ApiProperty({ description: 'Professionalism rating (1-5)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  professionalismRating?: number;
}

export class FlagReviewDto {
  @ApiProperty({ description: 'Reason for flagging', enum: ReviewFlagReason })
  @IsEnum(ReviewFlagReason)
  reason: ReviewFlagReason;

  @ApiProperty({ description: 'Additional description of the issue', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ModerateReviewDto {
  @ApiProperty({ description: 'Moderation decision', enum: ReviewModerationStatus })
  @IsEnum(ReviewModerationStatus)
  status: ReviewModerationStatus;

  @ApiProperty({ description: 'Moderation notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class HelpfulVoteDto {
  @ApiProperty({ description: 'Whether the review was helpful' })
  @IsBoolean()
  isHelpful: boolean;
}

export class ReviewFiltersDto {
  @ApiProperty({ description: 'Filter by rating', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ description: 'Filter by verified purchase only', required: false })
  @IsOptional()
  @IsBoolean()
  verifiedOnly?: boolean;

  @ApiProperty({ description: 'Sort by (newest, oldest, rating_high, rating_low, helpful)', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: 'Page number for pagination', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;
}