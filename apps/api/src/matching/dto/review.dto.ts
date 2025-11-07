import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateMatchReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  overall_rating: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communication_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  quality_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  professionalism_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  timeliness_rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class UpdateMatchReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  overall_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  communication_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  quality_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  professionalism_rating?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  timeliness_rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}

export class ReviewStatsDto {
  total_reviews: number;
  average_overall_rating: number;
  average_communication_rating: number;
  average_quality_rating: number;
  average_professionalism_rating: number;
  average_timeliness_rating: number;
  rating_distribution: {
    five_star: number;
    four_star: number;
    three_star: number;
    two_star: number;
    one_star: number;
  };
}

export class MatchReviewResponseDto {
  id: string;
  match_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  overall_rating: number;
  communication_rating?: number;
  quality_rating?: number;
  professionalism_rating?: number;
  timeliness_rating?: number;
  comment?: string;
  verified_match: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ReviewStatusDto {
  match_id: string;
  client_reviewed: boolean;
  professional_reviewed: boolean;
  both_reviewed: boolean;
  client_review?: {
    reviewer_id: string;
    reviewed_user_id: string;
    overall_rating: number;
    created_at: Date;
  } | null;
  professional_review?: {
    reviewer_id: string;
    reviewed_user_id: string;
    overall_rating: number;
    created_at: Date;
  } | null;
}
