import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsDateString,
  Matches,
  Length,
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
    example: 'MySecureP@ssw0rd2024',
    description: 'Contraseña del usuario (mínimo 12 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)',
    minLength: 12
  })
  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
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
    example: 'MySecureP@ssw0rd2024',
    description: 'Contraseña del usuario (mínimo 12 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)',
    minLength: 12
  })
  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  password: string;

  @ApiProperty({
    example: 'Juan Carlos Pérez',
    description: 'Nombre completo del usuario',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  name: string;

  // Support both name and fullName from frontend
  @ApiProperty({
    example: 'Juan Carlos Pérez',
    description: 'Nombre completo del usuario (alias de name)',
    required: false
  })
  @IsOptional()
  @IsString()
  fullName?: string;

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

  @ApiProperty({
    example: '12345678',
    description: 'Número de DNI (7-8 dígitos)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Length(7, 8, { message: 'El DNI debe tener entre 7 y 8 dígitos' })
  @Matches(/^\d{7,8}$/, { message: 'El DNI debe contener solo números' })
  dni?: string;

  @ApiProperty({
    example: 'masculino',
    description: 'Género del usuario',
    enum: ['masculino', 'femenino', 'prefiero_no_decirlo'],
    required: false
  })
  @IsOptional()
  @IsString()
  gender?: string;

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
    example: 'MyNewSecureP@ssw0rd2024',
    description: 'Nueva contraseña (mínimo 12 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)',
    minLength: 12
  })
  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
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
    example: 'MyNewSecureP@ssw0rd2024',
    description: 'Nueva contraseña del usuario (mínimo 12 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)',
    minLength: 12
  })
  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  new_password: string;
}

export class DevVerifyUserDto {
  @ApiProperty({
    example: 'usuario@fixia.com.ar',
    description: 'Email del usuario a verificar (solo desarrollo)'
  })
  @IsEmail()
  email: string;
}