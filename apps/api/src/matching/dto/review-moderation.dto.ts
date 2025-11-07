import { IsString, IsEnum } from 'class-validator';

export enum ReviewModerationAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  FLAG_SPAM = 'flag_spam',
  FLAG_INAPPROPRIATE = 'flag_inappropriate',
}

export class ModerateReviewDto {
  @IsEnum(ReviewModerationAction)
  action: ReviewModerationAction;

  @IsString()
  reason?: string;
}

export class ReviewModerationResponseDto {
  id: string;
  review_id: string;
  action: ReviewModerationAction;
  reason?: string;
  moderated_at: Date;
  moderated_by: string;
}
