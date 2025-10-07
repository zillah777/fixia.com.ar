import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsUUID, Min, Max } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ description: 'Project ID this job is based on' })
  @IsUUID()
  projectId: string;

  @ApiProperty({ description: 'Client user ID' })
  @IsUUID()
  clientId: string;

  @ApiProperty({ description: 'Professional user ID' })
  @IsUUID()
  professionalId: string;

  @ApiProperty({ description: 'Accepted proposal ID' })
  @IsUUID()
  proposalId: string;

  @ApiProperty({ description: 'Job title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Job description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Agreed price in ARS' })
  @IsNumber()
  @Min(0)
  agreedPrice: number;

  @ApiProperty({ description: 'Currency', default: 'ARS' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Expected delivery date', required: false })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;
}

export class UpdateJobStatusDto {
  @ApiProperty({ description: 'New job status', enum: JobStatus })
  @IsEnum(JobStatus)
  status: JobStatus;

  @ApiProperty({ description: 'Progress percentage (0-100)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage?: number;

  @ApiProperty({ description: 'Status update message', required: false })
  @IsOptional()
  @IsString()
  message?: string;
}

export class CreateMilestoneDto {
  @ApiProperty({ description: 'Milestone title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Milestone description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Milestone amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}

export class CreateContactInteractionDto {
  @ApiProperty({ description: 'Professional user ID' })
  @IsUUID()
  professionalId: string;

  @ApiProperty({ description: 'Service ID if contact is about a service', required: false })
  @IsOptional()
  @IsUUID()
  serviceId?: string;

  @ApiProperty({ description: 'Project ID if contact is about a project', required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Contact method used', enum: ['whatsapp', 'email', 'phone', 'platform'] })
  @IsString()
  contactMethod: string;

  @ApiProperty({ description: 'Contact message', required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'Additional contact metadata', required: false })
  @IsOptional()
  contactData?: any;
}