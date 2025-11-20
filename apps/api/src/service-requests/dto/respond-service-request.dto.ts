import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for responding to a service request (accept/reject)
 */
export class RespondServiceRequestDto {
    @ApiPropertyOptional({
        description: 'Optional message when responding to request',
        example: 'Gracias por tu solicitud, acepto el proyecto',
        maxLength: 500,
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    message?: string;
}
