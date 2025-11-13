import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { ValidBudgetRangeConstraint } from '../validators/budget-range.validator';
import { FutureDeadline } from '../validators/future-deadline.validator';

// Note: Budget range validation is handled at the property level
export class CreateProjectDto {
  @ApiProperty({
    example: 'Desarrollo de aplicación móvil para delivery',
    description: 'Título del proyecto'
  })
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  title: string;

  @ApiProperty({ 
    example: 'Necesito desarrollar una aplicación móvil para delivery de comidas con sistema de pagos integrado, GPS tracking y panel administrativo.',
    description: 'Descripción detallada del proyecto'
  })
  @IsString()
  @MinLength(50)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la categoría del proyecto',
    required: false
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ 
    example: 50000,
    description: 'Presupuesto mínimo en pesos argentinos',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(10000000)
  budget_min?: number;

  @ApiProperty({ 
    example: 100000,
    description: 'Presupuesto máximo en pesos argentinos',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(10000000)
  budget_max?: number;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Fecha límite del proyecto (YYYY-MM-DD), debe ser en el futuro',
    required: false
  })
  @IsOptional()
  @IsDateString()
  @FutureDeadline({ message: 'Deadline must be in the future' })
  deadline?: string;

  @ApiProperty({ 
    example: 'Rawson, Chubut',
    description: 'Ubicación preferida para el proyecto',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({
    example: ['React Native', 'Node.js', 'PostgreSQL', 'Stripe'],
    description: 'Habilidades requeridas para el proyecto',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills_required?: string[];

  @ApiProperty({
    example: 'https://cdn.example.com/projects/main-image-123.jpg',
    description: 'URL de la imagen principal del proyecto',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  main_image_url?: string;

  @ApiProperty({
    example: [
      'https://cdn.example.com/projects/gallery-1.jpg',
      'https://cdn.example.com/projects/gallery-2.jpg',
      'https://cdn.example.com/projects/gallery-3.jpg'
    ],
    description: 'URLs de imágenes de galería del proyecto (máximo 5 imágenes)',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  gallery_urls?: string[];
}