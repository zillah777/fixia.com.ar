import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsEnum, 
  IsOptional,
  IsPhoneNumber,
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
    example: 'Juan Carlos',
    description: 'Nombre completo del usuario',
    minLength: 2
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ 
    example: 'professional',
    description: 'Tipo de usuario',
    enum: ['client', 'professional']
  })
  @IsEnum(['client', 'professional'])
  user_type: 'client' | 'professional';

  @ApiProperty({ 
    example: 'Rawson, Chubut',
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
    example: '+542804567890',
    description: 'Número de WhatsApp',
    required: false
  })
  @IsOptional()
  @IsString()
  whatsapp_number?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token JWT'
  })
  @IsString()
  refresh_token: string;
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