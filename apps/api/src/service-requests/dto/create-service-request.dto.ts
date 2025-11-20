import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a service request
 * Client requests a service from a professional
 */
export class CreateServiceRequestDto {
    @ApiProperty({
        description: 'ID of the service being requested',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    service_id: string;

    @ApiProperty({
        description: 'Message from client to professional',
        example: 'Necesito ayuda con un proyecto de diseño web...',
        minLength: 20,
        maxLength: 500,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    message: string;

    @ApiPropertyOptional({
        description: 'Estimated budget for the service',
        example: 5000,
        minimum: 0,
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    budget?: number;

    @ApiPropertyOptional({
        description: 'Deadline for the service (ISO 8601 date)',
        example: '2025-12-31T23:59:59Z',
    })
    @IsDateString()
    @IsOptional()
    deadline?: string;
}
