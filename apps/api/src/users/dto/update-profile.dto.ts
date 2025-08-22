import { 
  IsString, 
  IsOptional,
  IsArray,
  IsUrl,
  IsPhoneNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ 
    example: 'Juan Carlos Rodríguez',
    description: 'Nombre completo del usuario',
    required: false
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ 
    example: 'https://example.com/avatar.jpg',
    description: 'URL del avatar del usuario',
    required: false
  })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiProperty({ 
    example: 'Rawson, Chubut',
    description: 'Ubicación del usuario',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ 
    example: 'Desarrollador full-stack especializado en React y Node.js con 5 años de experiencia...',
    description: 'Biografía profesional (solo para profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({ 
    example: ['Desarrollo Web', 'React', 'Node.js', 'PostgreSQL'],
    description: 'Especialidades del profesional',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({ 
    example: '+542804567890',
    description: 'Número de WhatsApp',
    required: false
  })
  @IsOptional()
  @IsString()
  whatsapp_number?: string;
}