import { IsEnum, IsOptional, IsArray, IsString, IsObject, IsNotEmpty, MaxLength, IsUUID } from 'class-validator';
import { VerificationType, VerificationStatus } from '@prisma/client';

export class CreateVerificationRequestDto {
  @IsEnum(VerificationType)
  @IsNotEmpty()
  verificationType: VerificationType;

  @IsArray()
  @IsOptional()
  documents?: string[];

  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class UpdateVerificationRequestDto {
  @IsArray()
  @IsOptional()
  documents?: string[];

  @IsObject()
  @IsOptional()
  additionalInfo?: Record<string, any>;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class ReviewVerificationDto {
  @IsEnum(VerificationStatus)
  @IsNotEmpty()
  status: 'approved' | 'rejected';

  @IsString()
  @IsOptional()
  @MaxLength(500)
  rejectionReason?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}

export class VerificationFiltersDto {
  @IsEnum(VerificationType)
  @IsOptional()
  verificationType?: VerificationType;

  @IsEnum(VerificationStatus)
  @IsOptional()
  status?: VerificationStatus;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sortBy?: 'newest' | 'oldest' | 'type' | 'status';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

export class PhoneVerificationDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  verificationCode: string;
}

export class EmailVerificationDto {
  @IsString()
  @IsNotEmpty()
  verificationToken: string;
}

export class AddressVerificationDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsArray()
  @IsOptional()
  documents?: string[];
}