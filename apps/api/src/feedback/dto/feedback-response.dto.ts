import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedbackUserDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiPropertyOptional({ example: 'https://avatar.url/juan.jpg' })
  avatar?: string;

  @ApiProperty({ example: 'professional', enum: ['client', 'professional'] })
  userType: string;
}

export class FeedbackResponseDto {
  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ type: FeedbackUserDto })
  fromUser: FeedbackUserDto;

  @ApiProperty({ type: FeedbackUserDto })
  toUser: FeedbackUserDto;

  @ApiPropertyOptional({ example: 'Excelente profesional, muy confiable.' })
  comment?: string;

  @ApiProperty({ example: true })
  hasLike: boolean;

  @ApiPropertyOptional({ example: '660e8400-e29b-41d4-a716-446655440000' })
  jobId?: string;

  @ApiPropertyOptional({ example: '770e8400-e29b-41d4-a716-446655440000' })
  serviceId?: string;

  @ApiProperty({ example: '2025-10-20T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-10-20T12:30:00.000Z' })
  updatedAt: Date;
}

export class TrustScoreDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: 87, description: 'Total de likes recibidos (Trust Score)' })
  totalLikes: number;

  @ApiProperty({ example: 42, description: 'Total de feedback recibido' })
  totalFeedback: number;

  @ApiProperty({ example: 95.5, description: 'Porcentaje de likes positivos' })
  trustPercentage: number;
}
