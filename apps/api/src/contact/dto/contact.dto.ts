import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContactDto {
  @ApiProperty({ 
    example: 'Juan Pérez',
    description: 'Nombre completo del remitente'
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    example: 'juan.perez@email.com',
    description: 'Email del remitente'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'Consulta sobre servicios de desarrollo',
    description: 'Asunto del mensaje'
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  subject: string;

  @ApiProperty({ 
    example: 'Hola, me interesa conocer más sobre los servicios de desarrollo web disponibles en la plataforma...',
    description: 'Mensaje de contacto'
  })
  @IsString()
  @MinLength(20)
  @MaxLength(2000)
  message: string;
}