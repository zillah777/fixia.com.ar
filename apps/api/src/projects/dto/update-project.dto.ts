import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({ 
    example: 'in_progress',
    description: 'Estado del proyecto',
    required: false,
    enum: ['open', 'in_progress', 'completed', 'cancelled']
  })
  @IsOptional()
  @IsEnum(['open', 'in_progress', 'completed', 'cancelled'])
  status?: ProjectStatus;
}