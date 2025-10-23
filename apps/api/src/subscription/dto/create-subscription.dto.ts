import { IsString, IsIn, IsNumber, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Tipo de plan de suscripción',
    example: 'basic',
    enum: ['basic', 'premium'],
  })
  @IsNotEmpty({ message: 'El tipo de suscripción es requerido' })
  @IsString({ message: 'El tipo de suscripción debe ser un string' })
  @IsIn(['basic', 'premium'], { message: 'El tipo de suscripción debe ser "basic" o "premium"' })
  subscriptionType: string;

  @ApiProperty({
    description: 'Precio de la suscripción en ARS',
    example: 2999,
  })
  @IsNotEmpty({ message: 'El precio es requerido' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
  price: number;
}
