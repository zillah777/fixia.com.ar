import { PartialType } from '@nestjs/swagger';
import { CreateFeedbackDto } from './create-feedback.dto';
import { IsString, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFeedbackDto {
  @ApiPropertyOptional({
    description: 'Actualizar comentario',
    example: 'Comentario actualizado sobre el profesional.',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({
    description: 'Actualizar like (confiabilidad)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  hasLike?: boolean;
}
