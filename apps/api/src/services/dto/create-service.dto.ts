import { 
  IsString, 
  IsNumber, 
  IsOptional,
  IsArray,
  IsUrl,
  IsUUID,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ 
    example: 'Desarrollo de sitio web profesional',
    description: 'Título del servicio'
  })
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  title: string;

  @ApiProperty({ 
    example: 'Desarrollo completo de sitio web profesional con diseño responsivo, optimización SEO y panel de administración.',
    description: 'Descripción detallada del servicio'
  })
  @IsString()
  @MinLength(50)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ 
    example: 25000,
    description: 'Precio del servicio en pesos argentinos'
  })
  @IsNumber()
  @Min(100)
  @Max(1000000)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({ 
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la categoría del servicio'
  })
  @IsUUID()
  category_id: string;

  @ApiProperty({ 
    example: 'https://example.com/service-image.jpg',
    description: 'URL de la imagen principal del servicio',
    required: false
  })
  @IsOptional()
  @IsUrl()
  main_image?: string;

  @ApiProperty({ 
    example: ['https://example.com/gallery1.jpg', 'https://example.com/gallery2.jpg'],
    description: 'Array de URLs de imágenes de la galería',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  gallery?: string[];

  @ApiProperty({ 
    example: ['desarrollo web', 'react', 'nodejs', 'responsive'],
    description: 'Tags del servicio',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    example: 15,
    description: 'Tiempo de entrega en días',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => parseInt(value))
  delivery_time_days?: number;

  @ApiProperty({ 
    example: 3,
    description: 'Número de revisiones incluidas',
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  revisions_included?: number;
}