import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MercadoPagoWebhookDto {
  @ApiProperty({
    description: 'ID del recurso de MercadoPago',
    example: '12345678',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Acción del webhook (payment.created, payment.updated, etc.)',
    example: 'payment.updated',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Tipo de notificación',
    example: 'payment',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Datos adicionales de MercadoPago',
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: any;

  @ApiProperty({
    description: 'Fecha de creación del evento',
    required: false,
  })
  @IsOptional()
  @IsString()
  date_created?: string;

  @ApiProperty({
    description: 'ID de la aplicación de MercadoPago',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  application_id?: number;

  @ApiProperty({
    description: 'ID del usuario de MercadoPago',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({
    description: 'Versión de la API',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  api_version?: number;

  @ApiProperty({
    description: 'Live mode flag',
    required: false,
  })
  @IsOptional()
  live_mode?: boolean;
}
