import { 
  IsOptional, 
  IsString, 
  IsNumber, 
  IsBoolean,
  IsEnum,
  IsUUID,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class ServiceFiltersDto {
  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filtrar por categoría (UUID)',
    required: false
  })
  @IsOptional()
  @ValidateIf((o) => o.category_id && !o.category)
  @IsUUID()
  category_id?: string;

  @ApiProperty({ 
    example: 'Desarrollo Web',
    description: 'Filtrar por nombre de categoría',
    required: false
  })
  @IsOptional()
  @ValidateIf((o) => o.category && !o.category_id)
  @IsString()
  category?: string;

  @ApiProperty({ 
    example: 'Rawson, Chubut',
    description: 'Filtrar por ubicación',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    example: 1000,
    description: 'Precio mínimo (snake_case)',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiProperty({ 
    example: 1000,
    description: 'Precio mínimo (camelCase)',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ 
    example: 50000,
    description: 'Precio máximo (snake_case)',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  @ApiProperty({ 
    example: 50000,
    description: 'Precio máximo (camelCase)',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ 
    example: 4.0,
    description: 'Calificación mínima',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  rating_min?: number;

  @ApiProperty({ 
    example: 'ProfesionalVerificado',
    description: 'Nivel del profesional',
    required: false,
    enum: ['Nuevo', 'ProfesionalVerificado', 'TopRatedPlus', 'TecnicoCertificado']
  })
  @IsOptional()
  @IsEnum(['Nuevo', 'ProfesionalVerificado', 'TopRatedPlus', 'TecnicoCertificado'])
  professional_level?: string;

  @ApiProperty({ 
    example: 'desarrollo web',
    description: 'Búsqueda por texto en título y descripción',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    example: 'price',
    description: 'Campo por el que ordenar (snake_case)',
    required: false,
    enum: ['price', 'rating', 'created_at', 'view_count', 'popular']
  })
  @IsOptional()
  @IsEnum(['price', 'rating', 'created_at', 'view_count', 'popular'])
  sort_by?: 'price' | 'rating' | 'created_at' | 'view_count' | 'popular';

  @ApiProperty({ 
    example: 'price',
    description: 'Campo por el que ordenar (camelCase)',
    required: false,
    enum: ['price', 'rating', 'newest', 'reviews', 'popular']
  })
  @IsOptional()
  @IsEnum(['price', 'rating', 'newest', 'reviews', 'popular'])
  sortBy?: 'price' | 'rating' | 'newest' | 'reviews' | 'popular';

  @ApiProperty({ 
    example: 'asc',
    description: 'Orden de clasificación',
    required: false,
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sort_order?: 'asc' | 'desc';

  @ApiProperty({ 
    example: true,
    description: 'Filtrar solo servicios de profesionales verificados',
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  verified?: boolean;

  @ApiProperty({ 
    example: true,
    description: 'Filtrar solo servicios destacados',
    required: false
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @ApiProperty({ 
    example: 1,
    description: 'Número de página',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ 
    example: 20,
    description: 'Elementos por página',
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}