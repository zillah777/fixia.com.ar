import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @ApiProperty({ 
    example: true,
    description: 'Si el servicio está activo',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ 
    example: false,
    description: 'Si el servicio está destacado',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}