import { IsString, IsBoolean, IsOptional, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedbackDto {
  @ApiProperty({
    description: 'ID del usuario que recibe el feedback',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  toUserId: string;

  @ApiPropertyOptional({
    description: 'Comentario opcional sobre el usuario',
    example: 'Excelente profesional, muy confiable y cumplidor.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiProperty({
    description: 'Like = +1 al Trust Score (confiabilidad)',
    example: true,
    default: false,
  })
  @IsBoolean()
  hasLike: boolean;

  @ApiPropertyOptional({
    description: 'ID del trabajo relacionado (opcional)',
    example: '660e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({
    description: 'ID del servicio relacionado (opcional)',
    example: '770e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  serviceId?: string;
}
