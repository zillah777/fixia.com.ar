import { IsString, IsIn, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Tipo de plan de suscripción',
    example: 'basic',
    enum: ['basic', 'premium', 'enterprise'],
  })
  @IsString()
  @IsIn(['basic', 'premium', 'enterprise'])
  subscriptionType: string;

  @ApiProperty({
    description: 'Precio de la suscripción en ARS',
    example: 2999,
  })
  @IsNumber()
  @Min(0)
  price: number;
}
