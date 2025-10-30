import { IsString, IsArray, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpgradeToProfessionalDto {
  @ApiProperty({
    description: 'Biografía profesional del usuario',
    example: 'Especialista en desarrollo web con más de 5 años de experiencia.',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  bio: string;

  @ApiProperty({
    description: 'Especialidades del profesional',
    example: ['Desarrollo Web', 'React', 'Node.js'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  specialties: string[];

  @ApiPropertyOptional({
    description: 'Años de experiencia',
    example: 5,
    minimum: 0,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  years_experience?: number;
}
