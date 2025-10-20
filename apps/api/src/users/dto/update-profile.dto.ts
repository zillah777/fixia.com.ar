import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
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
  @IsString()
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

  // Social Networks
  @ApiProperty({ 
    example: 'https://linkedin.com/in/usuario',
    description: 'Perfil de LinkedIn',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  social_linkedin?: string;

  @ApiProperty({ 
    example: 'https://twitter.com/usuario',
    description: 'Perfil de Twitter',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  social_twitter?: string;

  @ApiProperty({ 
    example: 'https://github.com/usuario',
    description: 'Perfil de GitHub',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  social_github?: string;

  @ApiProperty({ 
    example: 'https://instagram.com/usuario',
    description: 'Perfil de Instagram',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  social_instagram?: string;

  // Notification Preferences
  @ApiProperty({
    example: true,
    description: 'Recibir notificaciones de mensajes',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  notifications_messages?: boolean;

  @ApiProperty({
    example: true,
    description: 'Recibir notificaciones de pedidos',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  notifications_orders?: boolean;

  @ApiProperty({
    example: true,
    description: 'Recibir notificaciones de proyectos',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  notifications_projects?: boolean;

  @ApiProperty({
    example: false,
    description: 'Recibir newsletter semanal',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  notifications_newsletter?: boolean;

  // Timezone
  @ApiProperty({ 
    example: 'buenos-aires',
    description: 'Zona horaria del usuario',
    required: false
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}