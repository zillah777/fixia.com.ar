import { IsEnum, IsOptional, IsString, IsBoolean, IsNotEmpty, MaxLength, IsUrl, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsUrl()
  @IsOptional()
  actionUrl?: string;
}

export class UpdateNotificationDto {
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;

  @IsUrl()
  @IsOptional()
  actionUrl?: string;
}

export class NotificationFiltersDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @IsString()
  @IsOptional()
  sortBy?: 'newest' | 'oldest' | 'type' | 'unread';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class BulkActionDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  notificationIds: string[];

  @IsString()
  @IsNotEmpty()
  action: 'mark_read' | 'mark_unread' | 'delete';
}

export class BulkNotificationDto {
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  userIds: string[];

  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsUrl()
  @IsOptional()
  actionUrl?: string;
}