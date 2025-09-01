import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsEnum, 
  IsOptional,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';

export class LoginDto {
  @ApiProperty({ 
    example: 'usuario@fixia.com.ar',
    description: 'Email del usuario' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'miPassword123',
    description: 'Contraseña del usuario',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ 
    example: 'usuario@fixia.com.ar',
    description: 'Email del usuario' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'miPassword123',
    description: 'Contraseña del usuario',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    example: 'Juan Carlos Pérez',
    description: 'Nombre completo del usuario',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty({ 
    example: 'professional',
    description: 'Tipo de usuario',
    enum: ['client', 'professional']
  })
  @IsEnum(['client', 'professional'])
  userType: 'client' | 'professional';

  @ApiProperty({ 
    example: 'Rawson',
    description: 'Ubicación del usuario',
    required: false
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    example: '+542804567890',
    description: 'Número de teléfono',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ 
    example: '1990-03-15',
    description: 'Fecha de nacimiento (YYYY-MM-DD)',
    required: false
  })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  // Professional-only fields
  @ApiProperty({ 
    example: ['Peluquería', 'Manicura'],
    description: 'Categorías de servicios (solo profesionales)',
    required: false
  })
  @IsOptional()
  serviceCategories?: string[];

  @ApiProperty({ 
    example: 'Especialista en cortes modernos y tratamientos capilares',
    description: 'Descripción de servicios (solo profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: '5-10',
    description: 'Años de experiencia (solo profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  experience?: string;

  @ApiProperty({ 
    example: 'intermedio',
    description: 'Rango de precios (solo profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  pricing?: string;

  @ApiProperty({ 
    example: 'tiempo-completo',
    description: 'Disponibilidad (solo profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiProperty({ 
    example: 'https://mi-portfolio.com',
    description: 'Portfolio o trabajos anteriores (solo profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiProperty({ 
    example: 'Técnico en Peluquería, Certificado ANMAT',
    description: 'Certificaciones o títulos (solo profesionales)',
    required: false
  })
  @IsOptional()
  @IsString()
  certifications?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token JWT (optional if using httpOnly cookies)',
    required: false
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ 
    example: 'usuario@fixia.com.ar',
    description: 'Email del usuario para recuperación'
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de reset de contraseña'
  })
  @IsString()
  token: string;

  @ApiProperty({ 
    example: 'nuevaPassword123',
    description: 'Nueva contraseña',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  new_password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de verificación de email'
  })
  @IsString()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ 
    example: 'usuario@fixia.com.ar',
    description: 'Email del usuario para reenvío de verificación'
  })
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({ 
    example: 'miPasswordActual123',
    description: 'Contraseña actual del usuario',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  current_password: string;

  @ApiProperty({ 
    example: 'miNuevaPassword123',
    description: 'Nueva contraseña del usuario',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  new_password: string;
}