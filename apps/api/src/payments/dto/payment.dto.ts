import { IsNotEmpty, IsNumber, IsEmail, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @Min(1)
  @Max(9999999) // Prevent unreasonably large amounts (max ~$100k USD equivalent)
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @IsEmail()
  payerEmail: string;

  @IsString()
  @IsOptional()
  payerName?: string;

  @IsString()
  @IsOptional()
  payerPhone?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  jobId?: string;

  @IsString()
  @IsOptional()
  professionalId?: string;
}

export class CreatePreferenceDto {
  @IsNumber()
  @Min(1)
  @Max(9999999) // Prevent unreasonably large amounts (max ~$100k USD equivalent)
  amount: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEmail()
  payerEmail: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsString()
  @IsOptional()
  jobId?: string;

  @IsString()
  @IsOptional()
  professionalId?: string;

  @IsString()
  @IsOptional()
  successUrl?: string;

  @IsString()
  @IsOptional()
  failureUrl?: string;

  @IsString()
  @IsOptional()
  pendingUrl?: string;
}

export class WebhookDto {
  @IsString()
  action: string;

  @IsString()
  @IsOptional()
  api_version?: string;

  @IsString()
  @IsOptional()
  data?: any;

  @IsString()
  @IsOptional()
  date_created?: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  live_mode?: boolean;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}