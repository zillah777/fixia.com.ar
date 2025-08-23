import { IsEmail, IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SendTestEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'Recipient email address' })
  @IsEmail()
  to: string;

  @ApiPropertyOptional({ example: 'Test Email', description: 'Email subject' })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional({ example: 'This is a test message', description: 'Email message content' })
  @IsOptional()
  @IsString()
  message?: string;
}

export class SendVerificationEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'User full name' })
  @IsString()
  userName: string;

  @ApiProperty({ 
    example: 'https://fixia.com.ar/verify?token=abc123', 
    description: 'Email verification URL with token' 
  })
  @IsString()
  verificationUrl: string;
}

export class SendWelcomeEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'User full name' })
  @IsString()
  userName: string;

  @ApiProperty({ 
    example: 'cliente', 
    description: 'User type',
    enum: ['cliente', 'profesional']
  })
  @IsString()
  userType: 'cliente' | 'profesional';

  @ApiPropertyOptional({ 
    example: false, 
    description: 'Whether user is a professional' 
  })
  @IsOptional()
  @IsBoolean()
  isProfessional?: boolean;
}

export class SendPasswordResetDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'User full name' })
  @IsString()
  userName: string;

  @ApiProperty({ 
    example: 'https://fixia.com.ar/reset-password?token=abc123', 
    description: 'Password reset URL with token' 
  })
  @IsString()
  resetUrl: string;
}

export class SendAccountDeletionDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'User full name' })
  @IsString()
  userName: string;

  @ApiProperty({ 
    example: '2024-01-15', 
    description: 'Account deletion date' 
  })
  @IsString()
  deletionDate: string;
}

export class ClientDataDto {
  @ApiProperty({ example: 'María González', description: 'Client full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'MG', description: 'Client initials' })
  @IsString()
  initials: string;

  @ApiProperty({ example: 'Trelew, Chubut', description: 'Client location' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Enero 2023', description: 'When client joined' })
  @IsString()
  memberSince: string;

  @ApiProperty({ example: 5, description: 'Number of completed projects' })
  @IsNumber()
  projectsCount: number;

  @ApiPropertyOptional({ example: 4.8, description: 'Client rating' })
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiProperty({ example: true, description: 'Whether client is verified' })
  @IsBoolean()
  isVerified: boolean;
}

export class ProjectDataDto {
  @ApiProperty({ 
    example: 'Necesito renovar la cocina de mi casa, cambiar mesadas y pintar paredes.',
    description: 'Project description' 
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Renovación y Construcción', description: 'Service category' })
  @IsString()
  category: string;

  @ApiProperty({ example: '$50,000 - $80,000', description: 'Budget range' })
  @IsString()
  budget: string;

  @ApiProperty({ example: 'Próximas 2 semanas', description: 'Preferred project date' })
  @IsString()
  preferredDate: string;

  @ApiProperty({ example: 'Media', description: 'Project urgency level' })
  @IsString()
  urgency: string;

  @ApiProperty({ example: false, description: 'Whether project is high urgency' })
  @IsBoolean()
  isHighUrgency: boolean;

  @ApiPropertyOptional({ 
    example: 'sus excelentes calificaciones y experiencia en proyectos similares',
    description: 'Reason why client chose this professional' 
  })
  @IsOptional()
  @IsString()
  reasonForContact?: string;
}

export class SendProfessionalContactDto {
  @ApiProperty({ example: 'professional@example.com', description: 'Professional email address' })
  @IsEmail()
  professionalEmail: string;

  @ApiProperty({ example: 'Carlos Martínez', description: 'Professional full name' })
  @IsString()
  professionalName: string;

  @ApiProperty({ description: 'Client information' })
  @ValidateNested()
  @Type(() => ClientDataDto)
  clientData: ClientDataDto;

  @ApiProperty({ description: 'Project information' })
  @ValidateNested()
  @Type(() => ProjectDataDto)
  projectData: ProjectDataDto;
}

export class InquiryDataDto {
  @ApiProperty({ example: 'Ana López', description: 'Client full name' })
  @IsString()
  clientName: string;

  @ApiProperty({ example: 'Puerto Madryn, Chubut', description: 'Client location' })
  @IsString()
  clientLocation: string;

  @ApiProperty({ example: 3, description: 'Number of completed projects' })
  @IsNumber()
  clientProjectsCompleted: number;

  @ApiPropertyOptional({ example: 4.5, description: 'Client average rating' })
  @IsOptional()
  @IsNumber()
  clientRating?: number;

  @ApiProperty({ example: 'Marzo 2023', description: 'When client joined' })
  @IsString()
  clientMemberSince: string;

  @ApiProperty({ 
    example: 'Hola, me interesa tu servicio de plomería. ¿Podrías darme más detalles sobre los precios?',
    description: 'Client inquiry message' 
  })
  @IsString()
  message: string;

  @ApiProperty({ example: '15 de Enero, 2024', description: 'When inquiry was sent' })
  @IsString()
  inquiryDate: string;

  @ApiProperty({ example: false, description: 'Whether inquiry is marked as urgent' })
  @IsBoolean()
  isUrgent: boolean;

  @ApiProperty({ example: 48, description: 'Hours remaining to respond' })
  @IsNumber()
  responseWindow: number;

  @ApiPropertyOptional({ 
    example: 'El cliente encontró tu servicio a través de una búsqueda específica de plomería',
    description: 'Reason why client made this inquiry' 
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ServiceDataDto {
  @ApiProperty({ example: 'Reparación de Plomería Residencial', description: 'Service name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '$2,500', description: 'Service price' })
  @IsString()
  price: string;

  @ApiProperty({ example: '2-3 horas', description: 'Estimated time to complete' })
  @IsString()
  estimatedTime: string;

  @ApiProperty({ example: 'A domicilio en Trelew', description: 'Service location' })
  @IsString()
  location: string;
}

export class SendServiceInquiryDto {
  @ApiProperty({ example: 'professional@example.com', description: 'Professional email address' })
  @IsEmail()
  professionalEmail: string;

  @ApiProperty({ example: 'Roberto Silva', description: 'Professional full name' })
  @IsString()
  professionalName: string;

  @ApiProperty({ description: 'Inquiry information' })
  @ValidateNested()
  @Type(() => InquiryDataDto)
  inquiryData: InquiryDataDto;

  @ApiProperty({ description: 'Service information' })
  @ValidateNested()
  @Type(() => ServiceDataDto)
  serviceData: ServiceDataDto;
}

export class EmailResponseDto {
  @ApiProperty({ example: true, description: 'Whether email was sent successfully' })
  success: boolean;

  @ApiProperty({ 
    example: 'Email sent successfully',
    description: 'Response message' 
  })
  message: string;
}