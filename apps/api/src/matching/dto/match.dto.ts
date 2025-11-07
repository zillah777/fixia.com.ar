import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';

export enum MatchStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export class UpdateMatchStatusDto {
  @IsEnum(MatchStatus)
  status: MatchStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RequestCompletionDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class ConfirmCompletionDto {
  @IsOptional()
  @IsString()
  comment?: string;
}

export class GeneratePhoneRevealTokenDto {
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}

export class RevealPhoneDto {
  @IsString()
  token: string;
}

export class MatchResponseDto {
  id: string;
  proposalId: string;
  clientId: string;
  professionalId: string;
  projectId: string;
  jobId?: string;
  status: string;
  phoneRevealedAt?: Date;
  phoneRevealCount: number;
  createdAt: Date;
  updatedAt: Date;

  client: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
  };

  professional: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    rating?: number;
    reviewCount?: number;
  };

  proposal: {
    id: string;
    message: string;
    quotedPrice: number;
    deliveryTimeDays: number;
    status: string;
    acceptedAt?: Date;
  };
}

export class CompletionStatusDto {
  matchId: string;
  matchStatus: string;
  jobId?: string;
  completionRequestedBy?: string;
  completionRequestedAt?: Date;
  completionConfirmedBy?: string;
  completionConfirmedAt?: Date;
  isCompleted: boolean;
  canLeaveReview: boolean;
}

export class PhoneRevealResponseDto {
  token: string;
  expiresAt: Date;
  message: string;
}

export class PhoneMaskedDto {
  maskedNumber: string;
  revealed: boolean;
}

export class PhoneRevealedDto {
  phoneNumber: string;
  maskedNumber: string;
}
