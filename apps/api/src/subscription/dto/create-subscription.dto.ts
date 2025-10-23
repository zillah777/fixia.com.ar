import { IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Tipo de plan de suscripción',
    example: 'basic',
    enum: ['basic', 'premium'],
  })
  @IsString()
  @IsIn(['basic', 'premium'])
  subscriptionType: string;

  @ApiProperty({
    description: 'Precio de la suscripción en ARS',
    example: 2999,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;
}
